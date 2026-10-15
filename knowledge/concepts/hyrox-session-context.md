---
id: CON-HYROX-SESSION-CONTEXT
type: concept
version: 0.1.0
review_status: draft
evidence_type: design_proposal
updated_at: 2026-10-15
---

# HYROX 关键课分析需要哪些输入

用于 [HYROX 问题包](../topics/hyrox-prior-load/README.md)。下面是知识层的语义字段，由研发映射到已有数据；不要求后端采用同名字段，不给设备新增等级或阈值。

## 输入与解释边界

| 语义字段 | 可能来源 | 用途 | 缺失时的处理 |
| --- | --- | --- | --- |
| `sport`、`session_goal` | 用户确认、课程记录 | 是否为 HYROX，以及本课要完成什么 | 项目或目标不明时先澄清，不能强套本包 |
| `session_phase` | 事件状态、用户陈述 | 训练前、过程中还是已结束 | 不清楚时不能说“取消今天剩余补练” |
| `performance_change` | 分段记录或用户陈述 | 后段是否比同场前段或可比历史变差 | 没有分段不能编造掉速比例或站点 |
| `leg_heaviness`、`onset` | Note、用户回答 | 腿沉与任务下降何时出现 | 未提及不等于没有；“腿沉”不能定位生理原因 |
| `prior_lower_body_training` | 前序训练事件、用户回答 | 是否存在相关前序负荷 | 记不清、没记录、明确没有分别保存 |
| `plan_difference` | 原计划与实际记录、用户明确回答 | 是临时增加、原计划内还是未知 | “练过腿”不等于“超计划” |
| `within_session_distribution` | 跑段、站点记录、用户描述 | 是否有早段抢速、动作/转换变化等线索 | 没有记录只保留候选解释 |
| `sleep_food_environment` | 用户记录或回答 | 是否存在尚未排查的其他背景 | 不因未记录而宣称正常或充足 |
| `extra_training_intent` | 用户明确陈述 | 是否真的计划在课后补练 | 没有补练意图时不输出“取消补练” |
| `host_checks` | 上游系统 | 是否允许进入普通运动分析、是否有需退出的情况 | 未完成上游检查时，本包不给放行结论 |

## 每个事实的记录方式

建议保留 `value / status / source / observed_at / fact_id`。`status` 至少区分 `known`、`unknown`、`not_recorded`、`denied`、`conflicting`。`denied` 是用户明确否定，不能由空值转换。没有发生时间就保存未知，不由当前日期补填。

用户纠正事实后，旧判断失效并重新评估；冲突记录并列保留，确认指向同一天、同一场课后再更新事实。假设和建议不能写回这些事实字段。

## 不需要的输入

这个样板不依赖 EEG、HRV、肌糖原、乳酸或 CK，也不生成这些测量值。已有设备信息可作为有来源的背景，不能据其给 H1 自动加分、判断中枢/外周疲劳或宣称可以继续训练。

## 专家待补充

- 哪些现场表现会显著改变对“前序负荷”这一解释的关注？
- 在没有分段数据时，哪些用户描述足以支持有限分析？
- 目前字段中，哪些并不值得追问？
