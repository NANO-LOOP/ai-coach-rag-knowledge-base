#!/usr/bin/env python3
"""Build and check the local Markdown inventory; never publish or assess science."""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import quote, unquote, urlparse

DIRECTORIES = {
    'concepts': {'concept'}, 'assessments': {'assessment'},
    'questions': {'question'}, 'evidence': {'evidence'},
    'actions': {'action'}, 'cases': {'case'},
    'topics': {'topic', 'problem_package'},
}
REQUIRED = {'id', 'type', 'version', 'review_status', 'evidence_type', 'updated_at'}
STATUSES = {'draft', 'in_review', 'confirmed', 'disputed', 'needs_review', 'withdrawn'}
EVIDENCE = {'original_research', 'research_synthesis', 'consensus', 'expert_experience',
            'athlete_story', 'synthetic', 'practice_inference', 'design_proposal', 'legacy_unclassified'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def front_matter(text, label):
    match = re.match(r'\A---\n(.*?)\n---\n', text, re.S)
    if not match:
        raise ValueError(f'{label}: missing front matter')
    result = {}
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        field = re.fullmatch(r'([a-z_]+):\s*(.+)', line)
        if not field:
            raise ValueError(f'{label}: use one-line scalar metadata')
        key, raw = field.groups()
        if key in result:
            raise ValueError(f'{label}: duplicate metadata key {key}')
        if raw.startswith(('"', '[', '{')) or raw in ('true', 'false', 'null'):
            try:
                value = json.loads(raw)
            except ValueError:
                raise ValueError(f'{label}: unsupported inline value for {key}')
        else:
            value = raw
        if not isinstance(value, (str, bool, type(None))):
            raise ValueError(f'{label}: metadata {key} must be scalar')
        result[key] = value
    if not REQUIRED <= result.keys():
        raise ValueError(f'{label}: missing {sorted(REQUIRED - result.keys())}')
    for key in REQUIRED:
        if not isinstance(result[key], str) or not result[key]:
            raise ValueError(f'{label}: {key} must be a nonempty string')
    if not re.fullmatch(r'[A-Z][A-Z0-9-]+', result['id']) or result['id'].startswith('TEMPLATE-'):
        raise ValueError(f'{label}: invalid knowledge ID')
    if not re.fullmatch(r'\d+\.\d+\.\d+', result['version']):
        raise ValueError(f'{label}: version must be x.y.z')
    if result['review_status'] not in STATUSES or result['evidence_type'] not in EVIDENCE:
        raise ValueError(f'{label}: unknown review status or evidence type')
    date.fromisoformat(result['updated_at'])
    if result['review_status'] == 'confirmed':
        if not all(result.get(k) for k in ['reviewer', 'reviewed_at', 'review_ref']):
            raise ValueError(f'{label}: confirmed requires reviewer, reviewed_at, review_ref')
    return result


def collect(root):
    units, seen = [], set()
    for directory, types in DIRECTORIES.items():
        for path in sorted((root/'knowledge'/directory).rglob('*.md')):
            if path.name == 'README.md' and directory == 'topics' and path.parent == root/'knowledge/topics':
                continue
            label = path.relative_to(root).as_posix()
            text = path.read_text()
            meta = front_matter(text, label)
            if meta['type'] not in types:
                raise ValueError(f'{label}: type does not match directory')
            if meta['id'] in seen:
                raise ValueError(f'duplicate ID: {meta["id"]}')
            seen.add(meta['id'])
            title = re.search(r'^# (.+)$', text, re.M)
            if not title:
                raise ValueError(f'{label}: missing document title')
            units.append(dict(meta, title=title.group(1), path=label, sha256=sha(path)))
    return sorted(units, key=lambda u:u['id'])


def check_sources(root, migration, units):
    archive = root/migration['legacy_archive']
    original = json.loads((archive/'manifest.json').read_text())
    for record in original['documents'] + original['assets']:
        if sha(archive/record['path']) != record['sha256']:
            raise ValueError(f'original archive hash mismatch: {record["path"]}')
    by_id = {u['id']: u for u in units}
    imported_ids = set()
    numbered_ids = set()
    for record in original['documents']:
        text = (archive/record['path']).read_text()
        numbered_ids.update(re.findall(r'^## ([A-Z]+-\d+)｜', text, re.M))
    for item in migration['entries']:
        kid = item['id']
        if kid in imported_ids or kid not in by_id:
            raise ValueError(f'missing or duplicate imported ID: {kid}')
        imported_ids.add(kid)
        if by_id[kid]['path'] != item['path']:
            raise ValueError(f'{kid}: update the migration path after moving a unit')
        source = root/item['source_archive']
        if sha(source) != item['source_sha256']:
            raise ValueError(f'{kid}: source lineage hash mismatch')
        text = source.read_text()
        if item['migration'] == 'full_numbered_section':
            matches = list(re.finditer(r'^## ([A-Z]+-\d+)｜[^\n]+\n', text, re.M))
            index = next((i for i,m in enumerate(matches) if m.group(1) == kid), None)
            if index is None:
                raise ValueError(f'{kid}: missing original section')
            end = matches[index+1].start() if index+1 < len(matches) else len(text)
            chunk = text[matches[index].start():end]
            chunk = re.split(r'^# 资料与维护边界\s*$', chunk, flags=re.M)[0]
        else:
            chunk = text
        chunk = re.split(r'^---\s*\n\n来源：', chunk, flags=re.M)[0].rstrip()+'\n'
        if hashlib.sha256(chunk.encode()).hexdigest() != item['source_excerpt_sha256']:
            raise ValueError(f'{kid}: source excerpt hash mismatch')
    migrated_numbered = {e['id'] for e in migration['entries'] if e['migration']=='full_numbered_section'}
    if migrated_numbered != numbered_ids:
        raise ValueError('original numbered sections are not covered exactly once')
    for topic in migration['topics']:
        if not (root/topic['path']).is_file() or not set(topic['unit_ids']) <= imported_ids:
            raise ValueError(f'{topic["slug"]}: missing topic or unit')


def active_markdown(root):
    for name in ['README.md', 'AGENTS.md', 'CONTRIBUTING.md']:
        if (root/name).is_file():
            yield root/name
    for name in ['knowledge', 'templates', 'docs']:
        yield from (root/name).rglob('*.md')


def check_links(root):
    count = 0
    for path in active_markdown(root):
        text = path.read_text()
        if re.search(r'https?://[^\s<>()]*feishu\.cn', text):
            raise ValueError(f'{path.relative_to(root)}: retired external source URL in active content')
        text = re.sub(r'```.*?```', '', text, flags=re.S)
        text = re.sub(r'`[^`\n]*`', '', text)
        for raw in re.findall(r'\]\((<[^>]+>|[^)]+)\)', text):
            target = raw.strip('<>')
            if urlparse(target).scheme or target.startswith('#'):
                continue
            local = (path.parent/unquote(target.split('#', 1)[0])).resolve()
            if not local.is_relative_to(root) or not local.exists():
                raise ValueError(f'{path.relative_to(root)}: broken/escaping link {target}')
            count += 1
    return count


def generated(root, units, migration):
    counts = dict(sorted(Counter(u['type'] for u in units).items()))
    catalog = {'schema_version':'1.0.0','authority':'github_markdown_only',
               'purpose':'structural_inventory_not_retrieval_allowlist',
               'unit_count':len(units),'type_counts':counts,'units':units}
    by_id = {u['id']:u for u in units}
    lines = ['# 知识覆盖与待专家补充项', '', '本文件由 `tools/catalog.py` 生成。统计只表示文件结构覆盖，不表示专业正确或可上线检索。', '',
             f'当前结构目录共 {len(units)} 个记录，包含知识单元、18 个专题导读与 1 个问题包入口。', '',
             '| 类型 | 文件数 |', '| --- | --- |']
    lines += [f'| {kind} | {count} |' for kind,count in counts.items()]
    lines += ['', '## 专题覆盖', '', '138 个迁移稿保留专业正文，但并不自动具备该类型的完整填写契约。除 HYROX 样板外，尚未建立完整问题包；不能因为存在旧知识就认为提问与行动链已经完成。', '',
              '| 专题 | 迁移正文数 | 暂定类型覆盖 | 问题流程状态 |', '| --- | --- | --- | --- |']
    for topic in migration['topics']:
        kinds=Counter(by_id[kid]['type'] for kid in topic['unit_ids'])
        summary='、'.join(f'{k} {v}' for k,v in sorted(kinds.items()))
        href=quote(str(Path(topic['path']).relative_to('knowledge')),safe='/.-')
        state='有 HYROX 样板，仍待专家审阅' if topic['slug']=='hyrox' else '待补判断分叉、有效提问、条件化行动与反例'
        lines.append(f'| [{topic["title"]}]({href}) | {len(topic["unit_ids"])} | {summary} | {state} |')
    lines += ['', '## 审阅与发布', '',
              '下表统计当前审阅状态；专家修改状态后应刷新本文件。', '',
              '| 审阅状态 | 文件数 |', '| --- | --- |']
    lines += [f'| {state} | {n} |' for state,n in sorted(Counter(u['review_status'] for u in units).items())]
    lines += ['', '本库当前没有正式发布清单。结构目录不是检索白名单。审阅、模型运行验证及正式发布分别管理，见 [维护约定](governance/README.md)。', '']
    return {'knowledge/catalog.json': json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',
            'knowledge/coverage.md':'\n'.join(lines)}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write',action='store_true')
    mode.add_argument('--check',action='store_true')
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    args=parser.parse_args()
    root=args.root.resolve()
    try:
        units=collect(root)
        migration=json.loads((root/'knowledge/sources/migration-map.json').read_text())
        check_sources(root,migration,units)
        outputs=generated(root,units,migration)
        if args.write:
            for name,content in outputs.items():
                (root/name).write_text(content)
        else:
            for name,content in outputs.items():
                if not (root/name).exists() or (root/name).read_text()!=content:
                    raise ValueError(f'{name}: stale; run --write')
        links=check_links(root)
    except (ValueError, OSError, KeyError, StopIteration) as exc:
        print(f'FAIL: {exc}',file=sys.stderr)
        return 1
    print(json.dumps({'status':'structure_ok','units':len(units),'local_links':links,
                      'numbered_sections':migration['numbered_sections'],
                      'science_review':'not_assessed','model_tests':'not_run','published':False},ensure_ascii=False))
    return 0


if __name__=='__main__':
    sys.exit(main())
