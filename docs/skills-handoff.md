# 专家 skills 使用说明

当前是 **一个入口 + 四个独立功能 Skill，共五个**。正文和结构都在本地项目 Markdown 维护，由 GitHub 管理共享版本。

| Skill | 作用 | 输出 |
| --- | --- | --- |
| [nuromova-expert-coach](../skills/nuromova-expert-coach/SKILL.md) | 冷启动说明、读取结构、协调流程 | 当前议题及下一步 |
| [nuromova-scenario-simulator](../skills/nuromova-scenario-simulator/SKILL.md) | 构造场景与结构化输入 | 可见事实、未知和变式 |
| [nuromova-coach-simulator](../skills/nuromova-coach-simulator/SKILL.md) | 逐轮提问、判断和建议 | 实际对话及引用记录 |
| [nuromova-expert-interview](../skills/nuromova-expert-interview/SKILL.md) | 询问和接收专家建议 | 条件、反例、依据和修改意见 |
| [nuromova-knowledge-editor](../skills/nuromova-knowledge-editor/SKILL.md) | 总结并修改结构与正文 | Markdown 差异、审阅记录、索引 |

## 双重目标

模拟既用于完善专业知识，也用于设计将来 App 的 Coach Agent。参见 [最小单元设计](../agent/README.md)：每轮保留输入、知识依据、主动作和状态更新。专家反馈分别进入知识修订、行为设计或场景调整，并补充可复现的检查场景。当前是 Skill 执行的设计协议，产品运行适配层尚未实现。

## 开始使用

在这个仓库中让 Agent 读取 `skills/nuromova-expert-coach/SKILL.md` 并按其执行。例如：“按仓库里的专家入口启动，先介绍知识结构，再用 HYROX 前一天加练影响关键课的案例逐轮模拟，我来扮演运动者。”

需要直接改稿时：“按仓库里的知识编辑 Skill，把下面意见整理为 draft，并更新相关专题。”需要结构维护时：“检查两个主题的重复内容，保留稳定 ID，整理目录和引用。”

首次启动按“能做什么、怎么开始、怎么切换”三部分介绍用法和知识结构。每轮显示【模拟对话】或【专家讨论】；明确专业点评自动暂停模拟，含糊表达先确认意图，专家说“继续模拟”后恢复。个人事实纠正不会仅因包含“不对”而被当作专家点评。之后可以说“暂停点评”“生成反例”“整理成草稿”“调整目录”。五个目录共同构成技能集合，保持相邻路径；只克隆仓库并不自动注册到客户端技能列表。旧全局安装或旧 ZIP 包不会被本次仓库修改自动替换，应明确使用仓库中的文件。

## 知识与会话

knowledge 的 concepts / assessments / questions / evidence / actions / cases 保存单一正文，topics 串联问题包；templates 提供填写格式，governance 保存审阅，catalog 与 coverage 用于定位和找缺口。

默认由专家扮演运动者，Coach 问完等待回答。自动构造的完整问答只能标为 scripted_demo；同一会话看过隐藏答案时不能声称是隔离测试。当前技能可由会话模型执行，不包含生产模型 API 或自动发布服务。

会话草稿保存在忽略目录 review-data/。共享知识写入 knowledge/，未经实际审阅保持 draft。研究依据与专家经验分开，项目负责人无需逐条审核。实际专家确认针对具体版本和范围；提交或合并不等于正式检索发布。

## 检查与版本管理

在仓库根运行 `python3 tools/catalog.py --write` 和 `python3 tools/catalog.py --check`，查看 Git diff 后按授权提交。目录校验只验证结构，不验证科学结论或真实训练效果。

旧来源配置、远程文档写回指令均已从当前技能移除；旧 v2.0.1 工具及 schema 保存在 archive/legacy-coach-kit-v2.0.1，仅供追溯。当前技能不得执行归档工具。skills-manifest.json 记录当前技能文件哈希，用于核对分发内容。

场景生成现使用 [L0–L6 输入模型及 T0/T1/T2 缺省](../agent/input-model.md)。默认 T0，JSON 为输入事实源，Markdown 为阅读摘要；模型只接收可见输入，不接收专家预期。
