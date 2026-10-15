---
name: nuromova-scenario-simulator
description: 按仓库输入模型为内部专家生成或调整运动场景和结构化数据，保留已知、未知、否定与冲突，不预设 Coach 答案。
---

# 场景与结构化数据生成

1. 按 [仓库协议](../nuromova-expert-coach/references/repository.md) 定位项目，读取 [维护边界](../../docs/expert-maintenance.md)。
2. 实际读取 [输入模型](../../agent/input-model.md) 及其 [生成约定](../../agent/scenario-generation.md)、目标阶段配置、Schema 和缺省模板；按案例读取相关知识正文。记录所用版本/哈希，不用 Skill 内旧描述替代当前文档。
3. 按文档生成 initial_input.json、专家阅读摘要和模拟元数据，执行规定的结构校验；依赖缺失时明确未校验。可见输入与专家预期、隐藏答案分开保存，遵守 [会话约定](../nuromova-expert-coach/references/session-contract.md)。
4. 向专家简短呈现场景，交 [Coach 模拟](../nuromova-coach-simulator/SKILL.md) 逐轮执行。专家反馈交 [访谈](../nuromova-expert-interview/SKILL.md)；单例事实改场景版本，通用字段或缺省问题改输入文档及配套合同，不自动修改本 Skill。
