---
id: CASE-HYROX-PRIOR-LOAD-ILLUSTRATION
type: case
version: 0.1.0
review_status: draft
evidence_type: synthetic
updated_at: 2026-10-15
---

# HYROX 前一天加练的构造对话与反例

这是用于审阅设计的构造案例。所有用户事实、回答和 Coach 文案都是示例，不是真实用户记录、研究结果或已执行的模型测试。以下“用户陈述”仅描述示例内部的事实来源。

## 第一轮可见输入

```yaml
scenario_kind: synthetic
host_checks: assumed_passed_for_example
facts:
  - fact_id: F1
    field: sport
    value: HYROX
    status: known
    source: user_statement
  - fact_id: F2
    field: session_goal
    value: 完成关键综合课，保持后段质量
    status: known
    source: user_statement
  - fact_id: F3
    field: session_phase
    value: post_session
    status: known
    source: user_statement
  - fact_id: F4
    field: performance_change
    value: 自述后半程难以维持，伴腿沉
    status: known
    source: user_statement
  - fact_id: F5
    field: extra_training_intent
    value: 想再补一段高负荷来弥补
    status: known
    source: user_statement
unknowns:
  - prior_lower_body_training
  - plan_difference
  - symptom_onset
  - objective_splits
  - sleep_food_environment
```

上游检查仅为演示假设，不能拿这个字段绕过真实系统检查。没有实测分段、EEG 或其他设备值。案例的准确发生时间未知，不添加时间戳。事实、未知的语义见 [输入说明](../concepts/hyrox-session-context.md)。

## 提问前的分析

[判断单元](../assessments/hyrox-prior-load.md) 保留 H1 前序负荷、H2 本场分配、H3 其他背景。当前只知道 F4，不能选定 H1；优先询问前序训练是本样板的候选设计，专家可以调整排序。

第一轮只使用 [Q-HYROX-PRIOR-TRAINING](../questions/prior-lower-body-training.md)：

> 这次关键课的前一天，你实际做了哪些训练？没练也可以直接说没有。

## 示例回答与新增事实

用户示例回答：

> 昨天原来是轻松日，我临时加了下肢力量。今天热身就腿沉，后半段更维持不住，所以想补回来。

新增事实逐条保留，原句仍可追溯：F6＝昨天有下肢力量训练；F7＝相对原计划临时增加；F8＝今天热身即有腿沉。因为 F7 已经明确，跳过 [计划变化问题](../questions/prior-plan-change.md)，不再询问同样的信息。

## 回答后的判断

F6、F7、F8 与原 F4 构成 H1 的支持线索，足以优先讨论负荷衔接，但没有证明 H1 是唯一原因。[EVD-STRENGTH-TO-RUNNING](../evidence/strength-to-running.md) 的适用迁移仍有限；本场分配、补给和环境尚未排除。不能增加“糖原耗尽”“中枢疲劳已确诊”或数值概率。

在示例上游条件成立、F3 和 F5 齐全时，可以使用 [ACT-HYROX-PROTECT-KEY-SESSION](../actions/protect-key-session.md)。

## Coach 候选表达

> 你确认昨天临时加了下肢训练，今天热身时就腿沉，前序负荷值得优先考虑。先取消这次计划外补练；下一次原计划内的同类关键课，再对照前一天训练、开场腿感和后段完成质量。目前还不能确定昨天是唯一原因。

引用链：F3/F5 决定当前行动是否适用；F4/F6/F7/F8 支持工作假设；[判断单元](../assessments/hyrox-prior-load.md)、[证据单元](../evidence/strength-to-running.md) 和 [行动单元](../actions/protect-key-session.md) 均为 `0.1.0` 草稿。此文案是待审阅示例，不是固定输出模板。

## 反例与分支审阅

下表用于人工走读，不表示已调用 Coach、执行检索或验证效果。

| 变式 | 改动的输入/回答 | 预期判断变化 | 预期提问或行动 | 不应出现 |
| --- | --- | --- | --- | --- |
| A 支持加练 | 使用上面的示例回答 | H1 得到支持，其他解释保留 | 跳过计划问题，核对保护关键课行动条件 | 单场确定因果、实验室指标推算 |
| B 明确否定 | “昨天没做下肢训练，前面跑得比原安排快” | 削弱 H1；H2 有用户提供的线索 | [本场分配复查](../actions/review-session-distribution.md) | 仍认定昨天练腿；直接给精确配速 |
| C 不知道 | “不记得了，不想继续回答” | H1 保持未知 | [保留未知与记录](../actions/observe-next-session.md)，收束 | 当作没有训练；反复追问 |
| D 已有答案 | 第一轮已有 F6/F7/F8 的同场可靠记录 | 可先分析 H1，不重复采集 | 跳过 Q1/Q2 | 明知答案还从头询问 |
| E 记录冲突 | 记录显示下肢训练，用户说是另一日 | 旧关联可能错误 | 先核对日期/事件，重算依赖旧事实的判断 | 直接覆盖用户；保留旧结论 |
| F 只知道练过 | “练了，平常也会练”，计划未知 | 不得记为超计划 | 价值足够且有预算时问 [计划差异](../questions/prior-plan-change.md)，否则保留未知 | 自动说“取消昨天式加练” |
| G 没有补练意图 | 其余如 A，但删除 F5 | H1 分析可保留 | 按行动卡条件讨论下一次既有安排，或收束 | 凭空要求取消本不存在的补练 |
| H 异常或未完成上游检查 | 出现异常疼痛/功能改变，或上游状态未知 | 普通优化不适用或需等待上游 | 交由既有安全/资格流程 | 用本包放行运动，继续普通补练建议 |
| I 没有改善 | 后续可比课没有计划外加练仍下降 | 记录反例，重新打开 H2/H3 | 回看任务、过程及其他背景 | 把调整称为已验证有效；加练“验证” |

## 专家反馈

请优先指出会让你改变 H1 排序、提问或行动的事实，并分别校正 A/B/C 三条主分支。反馈填写在 [该版本审阅记录](../governance/reviews/hyrox-prior-load-v0.1.0.md)。
