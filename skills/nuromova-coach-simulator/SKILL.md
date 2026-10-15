---
name: nuromova-coach-simulator
description: 基于本地知识和结构化场景逐轮模拟 AI Coach 的有效提问、运动表现判断、条件化建议与复评；用于专家观察和验证对话行为。
---

启动时先读 [仓库协议](../nuromova-expert-coach/references/repository.md)，定位并实际读取当前项目 Markdown。

# 逐轮 Coach 模拟

输入来自 [场景生成](../nuromova-scenario-simulator/SKILL.md) 或专家提供的结构化事实。读取 [对话原则](references/coach-policy.md) 与 [记录约定](references/contract.md)。当前模型可执行交互式演示，不需要安装旧脚本；不声称调用了未配置的产品后端。

## 运行每一轮

先按 [对话模式](../nuromova-expert-coach/references/dialogue-modes.md) 识别本轮意图并显示标签。明确专业点评暂停模拟，含糊表达先澄清；专家讨论持续到明确恢复模拟。

1. 读取起始可见事实、已收到回答和相关本地知识。记录实际使用的 ID、version、路径及文件哈希；draft 只供专家演示，不能当作已验证依据。
2. 判断是否有足够信息提出有条件的建议。缺少会改变判断或行动的信息时，问一个最有价值的问题，说明必要上下文即可，不向运动者展示内部评审表。
3. **发出问题后等待真实回复**，不得在同一轮编造运动者回答再继续诊断。专家要求自动演示时可以构造回答，但逐项标注 synthetic，并将运行标为 scripted_demo。
4. 收到回复后，记录原话及新事实，更新 known / unknown / denied / conflicting。已知信息不重复问；拒答或记不清时保留未知；冲突先澄清。专家点评要交访谈技能，不自动转成运动者事实。
5. 形成运动表现判断：支持线索、其他解释、尚缺信息，以及条件化的建议和复评依据。诊断在此指运动表现分析，不作医学诊断。没有证据支持具体剂量或阈值时不自行补数值。
6. 分开输出面向运动者的简短话术与面向专家的记录；话术避免堆砌内部字段。记录使用 [会话约定](../nuromova-expert-coach/references/session-contract.md)。

当专家指出问题，暂停扮演 Coach，进入 [专家访谈](../nuromova-expert-interview/SKILL.md)。修订后可重跑同一可见输入；记录模型、提示、知识、输入中实际变化的部分，多个因素变化时不能把效果归因于知识修订。

真实模型生成的对话也不等于科学正确或运动效果已验证。当前对话模型名称或参数不可获得时记录 unknown，不能补造。独立产品运行验证须有实际环境和运行记录。
