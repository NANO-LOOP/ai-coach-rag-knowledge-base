# 专家填写模板

先看 [HYROX 完整样板](../knowledge/topics/hyrox-prior-load/README.md)。你可以直接改一张已有卡，也可以从一个具体问题开始写完整判断，再拆出可复用单元。不需要先学 JSON、向量库或后端字段。

## 选哪个模板

| 想补充的内容 | 模板 | 保存位置 |
| --- | --- | --- |
| 一个完整的问题与判断过程 | [问题包](problem-package.md) | `knowledge/topics/问题短名/README.md` |
| 对数据或专业概念的解释 | [概念](concept.md) | `knowledge/concepts/` |
| 如何在几个原因之间判断 | [判断](assessment.md) | `knowledge/assessments/` |
| 哪个问题最值得问 | [提问](question.md) | `knowledge/questions/` |
| 一条有来源支持的结论 | [证据](evidence.md) | `knowledge/evidence/` |
| 某个条件下能做的下一步 | [行动](action.md) | `knowledge/actions/` |
| 完整案例或会推翻判断的反例 | [案例](case.md) | `knowledge/cases/` |
| 对具体版本的意见与确认 | [审阅记录](review.md) | `knowledge/governance/reviews/` |

## 怎么填写

1. 复制所需模板，替换 `TEMPLATE-...`、标题、日期和提示文字。`type` 保留对应类型；版本从 `0.1.0` 开始，状态保持 `draft`。AI 可以帮你整理这些字段。
2. 优先写你会如何判断、哪种回答会改变判断、什么情况下不适用。暂时没有证据就注明待补充；没有观察到的结果不填写“有效”。不要把所有占位项直接删掉而假装没有未知。
3. 用已有单元 ID 和相对链接引用内容；例如本页可用 `[判断单元](../knowledge/assessments/hyrox-prior-load.md)`，实际路径按文件位置调整。避免复制同一条完整结论到多个维护文件。
4. 提交本地修改或 PR 后，按 [审阅约定](../knowledge/governance/README.md) 对具体版本讨论和确认。保存、合并或通过格式检查均不等于正式检索发布。

研究支持、个人经验和构造案例分开写。真实案例在进入这个公开仓库前先去标识；不能把模拟用户回答当作真实反馈，也不提交个人原始设备数据。

## 专家暂时只想口述

可以先在问题包或审阅记录里写一段自然语言：“这个情况下我先看什么、会问什么、哪些回答让我改主意”。AI 再整理为差异稿，由你核对具体内容；整理行为不自动构成确认。

## 共用约定

元数据含义、状态与证据类型见 [维护规则](../knowledge/governance/README.md)。模板里的 `TEMPLATE-...` 是占位 ID，不能留在实际知识单元中；无需手填 `rag_eligible`。没有实际审阅记录时，不将状态改为 `confirmed`。
