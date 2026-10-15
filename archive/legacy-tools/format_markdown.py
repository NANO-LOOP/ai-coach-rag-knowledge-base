#!/usr/bin/env python3
"""Turn preserved Feishu Markdown responses into standalone readable Markdown."""
import hashlib
import html
import json
from pathlib import Path
import re
import sys
from urllib.parse import quote

def format_export(out):
    manifest = json.loads((out / 'manifest.json').read_text())
    documents = manifest['documents']
    doc_paths = {}
    for doc in documents:
        for token in (doc['node_token'], doc['document_id']):
            doc_paths[token] = Path(doc['path']).name
    assets = {a['token']: a['path'] for a in manifest['assets']}
    def callout(match):
        emoji = re.search(r'emoji="([^"]*)"', match.group(1))
        lines = match.group(2).strip().splitlines()
        if emoji:
            lines[0] = html.unescape(emoji.group(1)) + ' ' + lines[0]
        return '\n'.join('> ' + line if line else '>' for line in lines)
    def source(match):
        attrs = dict(re.findall(r'([\w-]+)="([^"]*)"', match.group(1)))
        token = attrs.get('token', '')
        name = html.unescape(attrs.get('name', token or '附件'))
        target = assets.get(token)
        return '[' + name + '](' + quote('../' + target, safe='/') + ')' if target else name
    for doc in documents:
        raw = json.loads((out / 'snapshots' / (doc['node_token'] + '.markdown.json')).read_text())
        body = raw['data']['document']['content']
        body = re.sub(r'<title>(.*?)</title>', lambda m: '# ' + html.unescape(m.group(1)), body, flags=re.S)
        body = re.sub(r'<callout([^>]*)>(.*?)</callout>', callout, body, flags=re.S)
        body = re.sub(r'<source\b([^>]*)/>', source, body)
        body = re.sub(r'</?figure\b[^>]*>', '', body)
        def local_link(match):
            url = match.group(1)
            parsed = re.match(r'https://ni4nrbhniif\.feishu\.cn/(?:wiki|docx)/([^/#?]+)$', url)
            if parsed and parsed.group(1) in doc_paths:
                return '](' + quote(doc_paths[parsed.group(1)], safe='') + ')'
            return match.group(0)
        body = re.sub(r'\]\((https://ni4nrbhniif\.feishu\.cn/[^)]+)\)', local_link, body)
        body = re.sub(r'\n{3,}', '\n\n', body).strip()
        footer = f'\n\n---\n\n来源：[飞书原文]({doc["source_url"]}) · 文档版本：{doc["revision_id"]} · 抓取时间：{doc["captured_at"]}\n'
        path = out / doc['path']
        path.write_text(body + footer)
        doc['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
        doc['format'] = 'markdown'
    manifest['markdown_format'] = 'normalized_feishu_markdown_with_source_footer'
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Formatted {len(documents)} Markdown documents; original responses preserved.')

if __name__ == '__main__':
    format_export(Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'knowledge')
