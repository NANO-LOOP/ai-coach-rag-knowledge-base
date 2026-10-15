---
name: nuromova-coach-simulator
description: 按仓库 AI Coach Agent 架构与本地知识逐轮模拟提问、运动表现分析和建议，供专家观察、纠正和验证对话行为。
---

# 逐轮 Coach 模拟

1. 按 [仓库协议](../nuromova-expert-coach/references/repository.md) 定位项目，读取 [维护边界](../../docs/expert-maintenance.md)。
2. 实际读取 [Coach Agent 架构](../../agent/README.md)、其 [回合契约](../../agent/turn-contract.md) 和 [对话原则](../../agent/dialogue-policy.md)。依据 [输入模型](../../agent/input-model.md) 检查输入与缺省，再按本轮问题读取相关知识正文；记录实际版本/哈希。结构通过不等于事实和专业结论得到确认。
3. 每轮先按 [对话模式](../nuromova-expert-coach/references/dialogue-modes.md) 识别意图并显示标签，再执行文档定义的回合。发出问题后等待实际回复；只有专家明确要求自动演示时才使用标注为 scripted_demo 的构造回答。不得把专家点评或预期答案混入运动者事实。
4. 使用 [回合记录模板](../../agent/templates/turn-record.md) 和 [会话约定](../nuromova-expert-coach/references/session-contract.md) 保存实际输入、引用、输出及状态变化。当前由会话模型执行，不声称已调用产品后端或完成独立模型验证。
5. 专业点评暂停模拟并交 [专家访谈](../nuromova-expert-interview/SKILL.md)。修订后重读受影响文档，按 [验证设计](../../agent/evaluation.md) 复验；收到明确恢复指令才继续。提问、分析或建议规则的修改落在 Agent 文档，本 Skill 的执行规则变更遵守特殊确认流程。
