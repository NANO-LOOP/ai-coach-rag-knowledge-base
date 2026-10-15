# 会话数据与交接

在项目 `review-data/<session-id>/` 使用 Markdown 记录。该目录已被 Git 忽略；不要强制添加私人对话到公开仓库。需要共享的构造案例经编辑后进入 knowledge/cases/。

## session.md

模式和暂停位置按 [对话模式](dialogue-modes.md) 记录。运动者事实、专家反馈、案例设定修改分别保存，未判定意图的原话暂不归入任何事实或结论。

## initial_input.json、scenario.md 与 simulation_meta.json

使用 [L0–L6 输入模型](../../../agent/input-model.md) 的 JSON Schema、阶段配置和缺省模板。initial_input.json 是模拟业务事实源；scenario.md 是专家阅读摘要，不独立维护第二份事实。simulation_meta.json 保存 session_id、scenario_id、scenario_version、synthetic 标记、运行方式、Git HEAD 和引用知识版本/哈希。

起始可见输入与 athlete-role.md、专家预期分开；只有实际收到的运动者回答才追加事实，纠正保留版本与替代关系。三个阶段都保留完整 L0–L6，按能力与数据可用性填写，不用零或否定替代缺省。

## coach-transcript.md

每轮记录：轮次和时间、可见事实版本、实际 Coach 输出、实际收到的运动者回答、新增/冲突事实、所用知识引用、判断及替代解释、未知、建议条件与复评信息。没有用户回答时停在等待状态。

运行方式只能按实际情况填写：
- interactive_host_model：当前对话模型逐轮生成，专家扮演运动者。记录模型标识（未知写 unknown）及上下文是否含隐藏信息。
- scripted_demo：构造回答或预编排剧情，仅作走读。
- isolated_model_run：确实通过独立模型环境运行且记录请求、响应和配置；不能凭计划使用此标签。

## expert-feedback.md 与 change-summary.md

前者保存专家原话、受影响轮次和单元、意见性质、条件、反例及待查证点。后者保存目标文件、变更前版本/哈希、修改摘要、变更后版本、专业审阅状态、校验结果和 Git 状态。

真正审阅记录使用 templates/review.md，保存在 knowledge/governance/reviews/，关联实际确认的单元版本。公开记录只包含得到授权、适合公开的必要信息。草稿生成不能自动填写 reviewer 或批准原话。

## Agent 决策记录

coach-transcript.md 按 [回合模板](../../../agent/templates/turn-record.md) 记录主动作、知识依据与状态变更；专业反馈之外，行为变更写入 agent-change.md，字段遵循 [验证设计](../../../agent/evaluation.md)。状态字段是设计契约；缺少真实执行或验证时明确标为未实现/未执行。
