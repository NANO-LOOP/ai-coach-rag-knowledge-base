# AI Coach RAG Knowledge Base

Nuromova AI Coach 的共享知识库。**GitHub 仓库及其中的 Markdown 是唯一维护源**，支撑结构化输入、有效提问、运动表现分析、条件化建议与复评。

知识内容后续由专家审阅。目录整理、提交或用户认可整体结构，不等于专业审阅，也不代表已进入正式 RAG。

## 从这里开始

- [知识库总入口](knowledge/README.md)：按类型和专题找到内容。
- [18 个专题](knowledge/topics/README.md)：运动专项、营养、恢复、心理表现及通用基础。
- [HYROX 完整问题包](knowledge/topics/hyrox-prior-load/README.md)：从输入到提问、判断、行动的完整样板。
- [结构与维护约定](knowledge/STRUCTURE.md)、[专家模板](templates/README.md) 和 [贡献说明](CONTRIBUTING.md)。
- [覆盖与待补项](knowledge/coverage.md)：哪些已有正文，哪些仍缺提问、判断和行动链。
- [专家 skills 使用说明](docs/skills-handoff.md)：一个入口、四项功能及本地 Markdown 工作流。

- [App Coach 最小单元设计](agent/README.md)：回合输入输出、决策规则、状态与验证设计。

## 当前内容

原有专业资料已整理为 **137 个完整编号章节和 1 篇完整案例文章**，按主要用途归入概念、判断、行动和案例目录，并由 18 个专题页串联。分类是待专家校正的编辑判断，未将混合研究、经验与建议的历史章节自动判为纯研究证据。

HYROX 问题包另包含 11 个示例单元、1 个问题包入口、9 种构造审阅变式。它是完整流程样板，其余专题需要专家继续补齐问题与行动关系。所有当前单元仍为草稿，未发布正式检索版本。

## 仓库结构

```text
knowledge/     分类知识、专题入口、来源记录、审阅与目录索引
templates/     专家填写模板
docs/          迁移和 skills 接口说明
tools/         仅操作本地仓库的目录检查工具
skills/        专家入口与四个独立功能 Skill
agent/         App Coach 决策契约与验证设计（设计草案）
archive/       历史导入与停用工具，仅作溯源
```

历史资料已移出日常维护目录。归档中的旧来源链接与操作指令只作历史材料；当前工作不连接、读取或同步原文档系统。当前 skills 已采用本地 Markdown 协议；旧工具及不兼容 schema 已归档停用。

## 维护与检查

需要 Python 3.9 或以上，无需文档平台登录或网络：

```sh
python3 tools/catalog.py --write
python3 tools/catalog.py --check
```

第一条刷新 [结构目录](knowledge/catalog.json) 和 [覆盖清单](knowledge/coverage.md)，第二条检查元数据、ID、相对链接、迁移来源及生成文件是否一致。检查通过只表示结构一致，不评判专业正确性，不调用模型、不做真实检索，也不发布知识。

专家直接编辑各知识单元的 Markdown；专题页通过链接复用，不再维护多份相同正文。来源、适用条件、反例与不确定性随单元保留，具体版本确认见 [审阅约定](knowledge/governance/README.md)。
