#!/usr/bin/env python3
"""Export the configured Feishu Wiki subtree using the caller's own lark-cli login."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from datetime import datetime, timezone
from urllib.parse import quote

REPO = Path(__file__).resolve().parents[1]

def now():
    return datetime.now(timezone.utc).isoformat()

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def cli(*args):
    env = dict(os.environ, LARKSUITE_CLI_NO_UPDATE_NOTIFIER='1', LARKSUITE_CLI_NO_SKILLS_NOTIFIER='1')
    p = subprocess.run(['lark-cli', *args, '--as', 'user', '--format', 'json'],
                       cwd=REPO, env=env, capture_output=True, text=True, timeout=120)
    try:
        result = json.loads(p.stdout if p.returncode == 0 else p.stderr)
    except ValueError:
        raise RuntimeError(f'lark-cli failed (exit {p.returncode}); no JSON response')
    if p.returncode or result.get('ok') is not True:
        error = result.get('error', {})
        raise RuntimeError(error.get('message', 'lark-cli unsuccessful'))
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', default='knowledge')
    args = parser.parse_args()
    out = REPO / args.out
    if not out.resolve().is_relative_to(REPO):
        parser.error('--out must be inside this repository')
    config = json.loads((REPO / 'skills/nuromova-knowledge-editor/config/knowledge-base.json').read_text())
    root = cli('wiki', '+node-get', '--node-token', config['root_url'])['data']
    nodes = []
    visited = set()
    def walk(node, parents):
        if node['node_token'] in visited:
            return
        visited.add(node['node_token'])
        node = dict(node, title_path=parents + [node['title']])
        nodes.append(node)
        print('Inventory:', ' / '.join(node['title_path']), flush=True)
        if node.get('has_child'):
            data = cli('wiki', '+node-list', '--space-id', root['space_id'],
                       '--parent-node-token', node['node_token'], '--page-all', '--page-limit', '0')['data']
            if data.get('has_more'):
                raise RuntimeError('Incomplete Wiki pagination')
            for child in data.get('nodes', []):
                walk(child, node['title_path'])
    walk(root, [])
    write_json(out / 'tree.json', {'root_url': config['root_url'], 'captured_at': now(), 'nodes': nodes})
    manifest = {'schema_version': 1, 'root_url': config['root_url'], 'space_id': root['space_id'],
                'started_at': now(), 'documents': [], 'assets': [], 'failures': []}
    asset_seen = set()
    for i, node in enumerate(nodes, 1):
        token = node['node_token']
        url = 'https://ni4nrbhniif.feishu.cn/wiki/' + token
        if node['obj_type'] != 'docx':
            manifest['failures'].append({'node_token': token, 'reason': 'unsupported node type', 'type': node['obj_type']})
            continue
        try:
            md = cli('docs', '+fetch', '--doc', url, '--doc-format', 'markdown', '--detail', 'full')
            doc = md['data']['document']
            xml = cli('docs', '+fetch', '--doc', url, '--doc-format', 'xml', '--detail', 'full',
                      '--revision-id', str(doc['revision_id']))
            write_json(out / 'snapshots' / (token + '.markdown.json'), md)
            write_json(out / 'snapshots' / (token + '.xml.json'), xml)
            slug = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '-', node['title']).strip(' .')[:90]
            relative = 'articles/' + slug + '--' + token + '.md'
            path = out / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(doc['content'] + '\n')
            record = {'node_token': token, 'document_id': doc['document_id'], 'title': node['title'],
                      'title_path': node['title_path'], 'source_url': url, 'revision_id': doc['revision_id'],
                      'captured_at': now(), 'path': relative, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                      'review_status': 'unreviewed', 'rag_eligible': False}
            manifest['documents'].append(record)
            xd = xml['data']['document']
            text = xd['content']
            refs = xd.get('reference_map', {})
            resource_tags = re.findall(r'<(?:img|source|whiteboard|sheet|bitable|synced_reference)\b[^>]*>', text)
            record['embedded_resource_tags'] = resource_tags
            media = []
            for tag in resource_tags:
                match = re.search(r'\btoken="([^"]+)"', tag)
                if match and re.match(r'<(?:img|source|whiteboard)\b', tag):
                    media.append((match.group(1), 'whiteboard' if tag.startswith('<whiteboard') else 'media'))
            for group, entries in refs.items():
                if group in ('img', 'image', 'source', 'file', 'whiteboard') and isinstance(entries, dict):
                    for attrs in entries.values():
                        if isinstance(attrs, dict):
                            t = attrs.get('token') or attrs.get('file_token')
                            if t:
                                media.append((t, 'whiteboard' if group == 'whiteboard' else 'media'))
            for t, kind in media:
                if t in asset_seen:
                    continue
                asset_seen.add(t)
                dest = out / 'assets' / t
                dest.parent.mkdir(parents=True, exist_ok=True)
                try:
                    cli('docs', '+media-download', '--token', t, '--type', kind,
                        '--output', str(dest.relative_to(REPO)), '--overwrite')
                    files = sorted(dest.parent.glob(t + '*'))
                    if not files:
                        raise RuntimeError('Download returned success without a local file')
                    for f in files:
                        manifest['assets'].append({'token': t, 'type': kind, 'path': str(f.relative_to(out)),
                                                   'sha256': hashlib.sha256(f.read_bytes()).hexdigest()})
                except Exception as exc:
                    manifest['failures'].append({'node_token': token, 'asset_token': t, 'reason': str(exc)})
            for tag in resource_tags:
                if re.match(r'<(?:sheet|bitable|synced_reference)\b', tag):
                    manifest['failures'].append({'node_token': token, 'reason': 'embedded resource needs separate export', 'tag': tag})
            print(f'Fetched {i}/{len(nodes)}: {node["title"]} (revision {doc["revision_id"]})', flush=True)
        except Exception as exc:
            manifest['failures'].append({'node_token': token, 'source_url': url, 'reason': str(exc)})
            print(f'FAILED {node["title"]}: {exc}', flush=True)
        write_json(out / 'manifest.json', manifest)
    manifest['finished_at'] = now()
    manifest['status'] = 'complete' if not manifest['failures'] and len(manifest['documents']) == len(nodes) else 'partial'
    write_json(out / 'manifest.json', manifest)
    navigation = ['# 飞书 RAG库知识储备', '', '完整正文快照；审阅状态未重新认定。', '']
    for d in manifest['documents']:
        navigation.append('- [' + ' / '.join(d['title_path'][1:] or d['title_path']) + '](' + quote(d['path'], safe='/') + ')')
    (out / 'README.md').write_text('\n'.join(navigation) + '\n')
    from format_markdown import format_export
    format_export(out)
    print(json.dumps({'status': manifest['status'], 'nodes': len(nodes), 'documents': len(manifest['documents']),
                      'assets': len(manifest['assets']), 'failures': manifest['failures']}, ensure_ascii=False), flush=True)

if __name__ == '__main__':
    main()
