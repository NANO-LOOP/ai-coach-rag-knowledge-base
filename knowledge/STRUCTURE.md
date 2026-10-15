# L7 知识库结构与维护方式

GitHub Markdown 是唯一维护源。先从 [专题目录](topics/README.md) 阅读全库，再看 [HYROX 完整问题包](topics/hyrox-prior-load/README.md) 怎样连接结构化输入、候选解释、有效提问、回答后的判断更新和条件化建议。

## 目录职责

| 目录 | 维护内容 | 专家主要回答什么 |
| --- | --- | --- |
| `concepts/` | 输入语义、机制、来源与解释边界 | 已知信息能说明什么，又不能说明什么？ |
| `assessments/` | 候选解释、支持线索、反证与转向条件 | 为什么考虑某解释，什么会改变判断？ |
| `questions/` | 提问条件、已有答案时跳过、回答分支 | 问什么，答案怎样改变判断或行动？ |
| `evidence/` | 具体研究或共识结论与适用限制 | 哪部分有研究支持，哪部分仍是推断？ |
| `actions/` | 适用条件、行动、替代分支与复评 | 现在可以做什么，之后观察什么？ |
| `cases/` | 标注来源身份的案例与反例 | 怎样走完整个过程，什么会推翻原判断？ |
| `topics/` | 专题导读与问题包 | 从什么问题阅读，关联哪些单元？ |
| `sources/` | 本地来源映射与迁移清单 | 资料从哪里来，基准版本及归档在哪里？ |
| `governance/` | 审阅、争议、版本及发布约定 | 哪个范围经谁确认，哪些尚未核验？ |

## 文件组织

```text
knowledge/
  concepts/{domain}/ID.md
  assessments/{domain}/ID.md
  questions/                 已有 HYROX 提问样板
  evidence/                  已核对出处的候选证据
  actions/{domain}/ID.md
  cases/{domain}/ID.md
  topics/library/            18 个专题索引，不复制正文
  topics/hyrox-prior-load/   完整问题包
  sources/migration-map.json 原章节到维护文件的一对一映射
  governance/               维护约定与待专家审阅记录
  catalog.json              自动生成的结构目录
  coverage.md               自动生成的覆盖与待补项
templates/                  专家填写模板
docs/skills-handoff.md       专家 skills 使用说明
archive/import-2026-10-14/   完整历史导入，仅作溯源
archive/legacy-tools/        已停用导入工具，不执行
```

`domain` 用于浅层分组，目前为 `sports / nutrition / recovery / mental-performance / training / movement / measurement`。项目在元数据的 `sport` 字段中记录，通用单元为 `general`；它不是适用人群或证据资格的替代品。新单元可按需要放在类型目录中，无需为了一个文件创建空分类。

## 唯一维护正文

每个知识单元在类型目录维护一次，专题页只做编排。137 个历史编号保留原 ID，章节里的条件、正文、引用和反例完整迁移；原始整篇文章在归档中保留导语与上下文，不作为第二份维护稿。

HYROX 的历史 SP-602 保留原专业叙述；ASM-HYROX-PRIOR-LOAD 维护问题流程，并引用专业依据。两者不相互复制覆盖。其他历史章节中的混合内容，可由专家逐项拆成更明确的证据、判断、提问或行动，记录继承关系并保留 ID 追溯。

## 维护源与运行边界

后续工作只读取仓库文件、Git 历史及需要核对的公开研究来源；不读取、刷新或写回原文档平台。归档与旧 skills 中的操作指令不是当前指令。

L7 提供共享领域知识及其使用条件。正式输入接口、L0 权限和安全检查、提问预算、执行顺序、个人事实和记忆写回由产品运行系统管理。历史知识中出现的产品规则仍是待核对材料，不能自动替代现行运行契约。

共享知识维护在 knowledge/；Agent 的输入输出、决策和状态协议维护在 [agent/](../agent/README.md)，用于约束模拟及后续产品实现。该目录是工程设计，不进入专业知识检索。

## 专家如何接手

1. 从 [覆盖清单](coverage.md) 选一个专题，先修订已有内容，再补最有价值的判断分叉。
2. 使用 [模板](../templates/README.md) 补充必要的提问、证据、行动与反例，不要求一次填完所有目录。
3. 通过 ID、相对链接与具体版本建立关系；回答支持、否定、未知或冲突时要改变判断或行动。
4. 按 [审阅约定](governance/README.md) 确认专业内容的具体版本；当前结构得到用户认可不代表内容已确认。
5. 运行本地目录检查，并刷新索引。正式检索发布另行管理。
