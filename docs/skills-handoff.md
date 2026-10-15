# 后续专家审阅 skills 的仓库接口

用户将单独优化 skills。本轮只调整全库结构、导航和维护说明，现有四个 skills 及其 27 个清单文件保持不变。本说明提供改造时需要对接的入口，不启动旧流程。

## 维护来源

唯一来源是 `NANO-LOOP/ai-coach-rag-knowledge-base` 的 GitHub Markdown 与本地工作副本。以当前仓库版本为基准读文件、准备具体差异和记录审阅；不要求登录原文档平台、不自动同步或写回。远端提交前检查并保留他人修改。

## 读取入口

| 文件或目录 | 用途 |
| --- | --- |
| [knowledge/catalog.json](../knowledge/catalog.json) | 单元 ID、类型、版本、状态、路径与内容哈希的结构目录 |
| [knowledge/coverage.md](../knowledge/coverage.md) | 专题覆盖、已有类型与待补流程 |
| [knowledge/topics/](../knowledge/topics/README.md) | 18 个导读与 HYROX 问题包 |
| [knowledge/STRUCTURE.md](../knowledge/STRUCTURE.md) | 类型职责、单一维护正文与运行边界 |
| [templates/](../templates/README.md) | 专家填写与审阅记录模板 |
| [knowledge/governance/](../knowledge/governance/README.md) | 状态、来源、专业确认与发布约定 |
| [knowledge/sources/migration-map.json](../knowledge/sources/migration-map.json) | 原编号/文章到当前文件的血缘关系 |

`archive/` 不作为默认讨论或检索输入；必要溯源按单元链接读取本地归档。skills 中的旧来源配置、旧 schema 和旧审批语义不能自动覆盖新约定。

## 建议的专家工作闭环

1. 按用户意图或覆盖缺口选一个具体问题，读取当前单元与关联版本。
2. 用简短案例讨论“先考虑什么、问什么、哪些回答改变判断、怎样行动与复评”。已有事实不重复问，反例、未知和冲突保留。
3. 整理为具体的单元差异，区分研究依据、实践推断、专家经验和构造示例。
4. 由实际专家确认其审阅范围与具体版本，保存实际确认记录；用户不参与逐项审查，也不能伪造专家批准。
5. 更新 Markdown、相关专题版本和目录。提交/PR 是协作记录，正式检索发布另行处理。

## 接口需要适配的地方

- 元数据类型增加 `topic`，并暂有 `legacy_unclassified` 历史证据性质；并非旧知识单元 schema 的直接兼容输入。
- 迁移稿的主要分类是编辑整理，不一定已经具备完整提问或行动字段。先修订，不将空缺自动补成已知。
- 专业“确认”、目录检查通过、构造案例走读、模型运行验证、正式发布是不同状态，需要分别记录。
- `catalog.json` 是结构库存，不是可上线检索白名单。本库当前没有正式发布清单。
- 真实用户事实、设备明细和个人记忆不写入公开共享库；案例在提交前按来源与去标识要求处理。

## 本地结构检查

```sh
python3 tools/catalog.py --write
python3 tools/catalog.py --check
```

脚本只读写仓库内结构产物，不访问网络、文档平台或模型。检查不提供科学审阅结论。
