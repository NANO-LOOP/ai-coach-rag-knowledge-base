# 会话数据与交接

在项目 `review-data/<session-id>/` 使用 Markdown 记录。该目录已被 Git 忽略；不要强制添加私人对话到公开仓库。需要共享的构造案例经编辑后进入 knowledge/cases/。

## scenario.md

记录 session_id、scenario_id、scenario_version、synthetic、目标、运动阶段、时间线和运行方式。事实表列为 `fact_id | 字段 | 值 | 单位 | 时间 | 来源 | 状态`，状态为 known / unknown / denied / conflicting。unknown 的值留空并说明缺少信息，否定保留否定对象，冲突保留相互矛盾记录。来源区分 synthetic、专家提供的案例事实、运动者本轮回答，不混入专家机制解释。

起始可见输入与 athlete-role.md 分离。记录当前 Git HEAD、知识路径/ID/version/hash。没有读取的资料不列为已使用。

## coach-transcript.md

每轮记录：轮次和时间、可见事实版本、实际 Coach 输出、实际收到的运动者回答、新增/冲突事实、所用知识引用、判断及替代解释、未知、建议条件与复评信息。没有用户回答时停在等待状态。

运行方式只能按实际情况填写：
- interactive_host_model：当前对话模型逐轮生成，专家扮演运动者。记录模型标识（未知写 unknown）及上下文是否含隐藏信息。
- scripted_demo：构造回答或预编排剧情，仅作走读。
- isolated_model_run：确实通过独立模型环境运行且记录请求、响应和配置；不能凭计划使用此标签。

## expert-feedback.md 与 change-summary.md

前者保存专家原话、受影响轮次和单元、意见性质、条件、反例及待查证点。后者保存目标文件、变更前版本/哈希、修改摘要、变更后版本、专业审阅状态、校验结果和 Git 状态。

真正审阅记录使用 templates/review.md，保存在 knowledge/governance/reviews/，关联实际确认的单元版本。公开记录只包含得到授权、适合公开的必要信息。草稿生成不能自动填写 reviewer 或批准原话。
