# AI Coach RAG Knowledge Base

Nuromova AI Coach 的知识资产与专家协作 skills。由飞书产品部知识库 **RAG库知识储备** 导出，保留完整文章、目录层级、原文链接、文档版本与内容校验值。

## 内容

- [`knowledge/`](knowledge/README.md)：飞书 RAG 库全部子节点的正文快照与目录导航。
- [`knowledge/manifest.json`](knowledge/manifest.json)：导出时间、版本、文件路径、SHA-256 与完整性记录。
- [`knowledge/EXPORT-NOTES.md`](knowledge/EXPORT-NOTES.md)：本次导出范围、历史附件与失效目录链接说明。
- `knowledge/snapshots/`：Markdown 与 XML 的完整读取响应，保留引用资源信息。
- `knowledge/assets/`：文档嵌入素材；本次包含 1 个 Markdown 和 2 个历史 ZIP 附件。
- [`skills/`](skills/)：四个关联 skill 的完整源码、参考资料、配置、数据契约与工具。
- [`skills-manifest.json`](skills-manifest.json)：skill 文件的 SHA-256 清单。
- [`tools/export_feishu.py`](tools/export_feishu.py)：使用自己的飞书登录重新导出知识库。

| Skill | 用途 |
| --- | --- |
| `nuromova-expert-coach` | 内部运动专家的连续对话入口 |
| `nuromova-expert-interview` | 专家访谈与案例点评 |
| `nuromova-coach-simulator` | 版本化输入、Coach 案例模拟和工具校验 |
| `nuromova-knowledge-editor` | 飞书知识维护、候选确认与研发交付 |

## 使用 skills

把 `skills/` 下四个目录一起复制到你的 Codex skills 目录（通常为 `~/.codex/skills/`）。工具需要 Node.js 20 或以上：

```sh
cd skills/nuromova-coach-simulator
npm ci --ignore-scripts
npm test
node scripts/coach-kit.mjs --help
```

飞书访问需要自己的 `lark-cli` 登录及原文权限；本仓库不包含登录凭据。配置中的飞书 URL 和文档 ID 是来源标识。

## 更新知识快照

需要 Python 3.9 或以上、可用的 `lark-cli` 以及当前用户对源知识库的读取权限。在仓库根目录执行：

```sh
python3 tools/export_feishu.py --out knowledge-next
```

脚本只读取飞书，不修改远端。先检查新目录的 `manifest.json`，确认 `status` 与 `failures`；核对变更后再替换当前 `knowledge/` 并提交。新目录导出避免旧快照中已删除文件残留。

## 来源与审阅状态

源入口：[飞书 RAG库知识储备](https://ni4nrbhniif.feishu.cn/wiki/RqDGw7Oo8irVhQkoG5jcUlnSnlb)。本仓库是导出时的版本快照，飞书仍是团队维护的来源。

专业文章、产品规则、案例与管理资料都保留在原目录。此次搬运没有逐条重新审阅知识；清单中的 `unreviewed` 和 `rag_eligible: false` 是保守的导出标记，不覆盖原文已有的确认记录。部署检索前应依据知识单元的来源、适用条件和实际审阅记录筛选。

仓库包含知识资产与协作工具；向量化、检索服务和线上 Coach 的部署由后续工程实现。
