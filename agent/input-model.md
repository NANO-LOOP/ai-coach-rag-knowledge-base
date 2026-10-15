# L0–L6 输入模型与阶段缺省

版本：0.1.0。用途：内部场景生成和未来 App 适配的统一输入合同。已经提供 JSON Schema 和结构验证；不表示已接入真实设备、产品后端或完成模型验证。

用户决定：保留 RAG 完整分层，补齐 T0 数据对象，按 T0/T1/T2 控制可用范围。阶段依据为用户指定开发文档 V0.4、2026-10-15 实读 revision 1460 的 §3.3、§6.2、§7、§9、§10.2–10.3。来源快照元数据见 [source-baseline.json](contracts/source-baseline.json)。本地文件为维护源，来源记录不恢复在线文档依赖。

专家可以修改本模型及配套结构；修改范围与同步要求见 [专家维护边界](../docs/expert-maintenance.md)。场景构造规则见 [生成约定](scenario-generation.md)，场景 Skill 只读取和执行这些规则。

## 文件入口

- [统一 JSON Schema](contracts/coach-input.schema.json)：字段、数据类型和阶段约束。
- 阶段配置：[T0](contracts/profiles/T0.json)、[T1](contracts/profiles/T1.json)、[T2](contracts/profiles/T2.json)。
- 全量缺省模板：[T0](contracts/defaults/T0.json)、[T1](contracts/defaults/T1.json)、[T2](contracts/defaults/T2.json)。
- [T0 HYROX 部分输入示例](contracts/examples/T0-hyrox-partial.json)：展示身份、事件、部分算法结果、标记与缺省，并非完整问答测试或完整原案例。其 safety_gate 仍为 unknown，不能称为安全检查通过。

## 数据归属

本库使用提问、分析、建议、执行反馈和效果验证等业务概念。App 的流程编号和页面状态由产品适配层维护，不进入知识正文、模拟输入或阶段配置。

所有业务数据纳入 L0–L6。运行上下文是各层中的明确对象，不另建 L8，也不重复维护第二份状态。

| 层 | 数据对象 | 新补充的关键语义 |
| --- | --- | --- |
| L0 控制 | identity、controls、quality、versions、budgets、runtime | 用户/事件/佩戴/会话/分析轮次/请求身份；两项 N1 准入；运行前置条件；证据版本、并发、生成失败和预算 |
| L1 身份 | profile、profile_version、sport_profiles、normal_performance、devices、baselines、iznp | 事件时有效的档案与运动目录版本；定性正常发挥画像与数值个人区间分开 |
| L2 任务 | task、dialogue、analysis、plan、execution_task | 当前已发送对话、待答问题、工作假设、分析进度与比较依据、生命周期、方案版本和决策、执行任务关联 |
| L3 状态 | algorithm_states、emotion、hrv、sleep、external_sleep、training_response、questionnaire、personal_review、calculations | 分段算法数据、情绪双轴、问卷与个人复盘独立、受控计算依据；自报睡眠和外部接口分开 |
| L4 事件 | current_event、markers、context_events、symptoms | 事件发生/记录时间、Note/Blink 与同刻状态引用、前后生活背景、症状自报 |
| L5 记忆 | history、recall、previous_coach_records、execution_tracking、outcomes | 实际召回范围与结果；历史方案、执行状态、原事件/验证事件、可比性和用户改善确认 |
| L6 模式 | patterns、experience_memory | 支持/反例、观察次数、复核；成功闭环的长期记忆和 LE 候选，与本轮工作假设分开 |

L2 当前状态和 L5 历史只通过 ID/版本关联；历史副本作为已冻结记录，不作为第二个当前真相源。业务判断不能由标签点击、页面导航或模型生成直接写成已接受、已执行。设备准入只包含硬件佩戴与 IMU 方向；连接、权限和数据流是独立运行前置条件，不引入 SQI。

这是一套归一化适配结构，不照搬附件不一致的字段名；不是生产数据库改表指令。它覆盖本次 Coach 输入范围，不复制整个 App 的页面和导航模型。四类问卷暂通过已提交事实投影进入 Coach，完整问卷定义、答案修改历史与原始实例仍由业务系统保管并以 source.reference 追溯。

## 阶段能力

| 能力 | T0 | T1 | T2 |
| --- | --- | --- | --- |
| 身份、任务、算法状态、问卷、标记、背景、历史、当前对话、方案决策 | 支持 | 继承 | 继承 |
| 定性正常发挥画像 | 支持，但可缺失 | 继承 | 继承；不等于 IZNP |
| 执行任务与执行记录 | 阶段不支持 | 支持，但默认未提供数据 | 继承 |
| 可比性与表现复评 | 阶段不支持 | 支持，但默认未提供数据 | 继承 |
| IZNP 区间及比较资格 | 不读取 | 不读取 | 支持；上游资格未满足时不能比较 |
| 长期模式、已验证经验和 LE 候选 | 阶段不支持 | 阶段不支持 | 支持；默认无数据，不能自动形成规律 |
| RAG 泛化的 7/28/90 天基线算法 | 不作为比较输入 | 不作为比较输入 | 字段保留；算法口径待确认，不等同 IZNP |
| 外部 HRV、外部睡眠接口 | 仅产品占位，不进入 Coach | 接口阶段未明确，默认不可用 | 接口阶段未明确，默认不可用 |

T0 没有个人区间，不等于没有初始静息采集或历史数据。阶段支持不等于能力已经在 App 实现，也不等于本次用户有可用数据。T1/T2 的执行触达 UI 另有合同，不因字段启用恢复旧独立准备页。

L0.budgets 由可信配置提供：普通问题每条最多一个，同一 analysis_iteration_id 上限三问。阶段模板不自动填权限、检查通过或事实；模拟填值须显式标记 synthetic。模拟中的 L7 Markdown 读取是本项目的知识试用方式，不声称 T0 App 已部署 RAG。

## 三个独立状态维度

每个数据对象统一使用：

```json
{
  "capability": "supported",
  "availability": "missing",
  "reason": "not_provided",
  "data": null
}
```

- capability：supported（本阶段合同允许）/ not_supported（阶段明确不支持）/ pending_confirmation（具体接口或算法尚待确认）。
- availability：available / missing / unavailable / not_applicable / withheld。非 available 时 data 必须为 null，并保留原因；不支持的对象不能填值。
- fact.epistemic：known / unknown / denied / conflicting。是否发生与数据能否使用是两个维度，否定是实际回答，不是缺省。

缺省原因：unsupported_stage、dependency_unconfirmed、not_provided。具体事实进一步区分 skipped、not_recorded、not_recalled、stale、invalid、withheld。unknown 的事实值必须为 null；用户明确否定可以保留 false 和对应来源。真实 0 是合法数值，不能转换成 unknown。

数组 null 表示尚未取得，available + [] 仅表示已明确取得空结果。缺少数据不能默认“无红旗”“未执行”或“没有历史”。schema 中出现某字段，不表示该字段必填为真实值，也不要求 Coach 逐个追问。

## 阶段门槛与依赖

L2.analysis 的 progress 表示对话分析进度；comparison_basis 仅表示证据基础：absolute_state（绝对状态）、personal_interval（个人区间）或 null（尚未确定）。它们不与 App 页面或流程步骤建立编号映射。

- 运动前用当前疲劳、心理压力、精力及有效性；运动后可用部分有效状态。疲劳按开发文档为运动疲劳，不能静默将 RAG 的 cns_fatigue 改名当成同一实测量。
- 情绪独立保存双轴、类别、强度与映射版本，不使用 canonical 的理想/需关注/需行动等级。缺少正式输出时保留未知，模型不自行计算映射。
- 执行任务关联已接受方案的具体版本。效果验证保留原事件与验证事件，先核对执行和可比性。部分执行、未执行或不可比时不能评判有效/无效。
- T2 使用个人区间比较时必须有上游 comparable 资格；模型不能因 stage=T2 自行建立资格。基线不足回退绝对状态分析，不伪造个人偏离。
- 长期经验需要执行确认、可比性确认和专项表现改善确认。一次成功只允许“上次有帮助”；多次可比成功仍须核对证据，不能只按条数产生稳定规律。
- 事实同时保留 occurred_at 和 recorded_at。原事件补述不倒灌初始快照；运动后发生的行为不能解释此前表现。

## 生成和维护

场景 Skill 先复制目标阶段缺省模板，再按情境填写允许字段，生成 initial_input.json。所有构造来源标记 synthetic 和模拟的来源类型，不使用有歧义的 U/D 缩写。Markdown 摘要由 JSON 导出或据其撰写，JSON 是事实维护源。专家专用预期结果与隐藏答案放在独立文件，schema 不接收这些字段。

新增阶段能力需同步 schema 的条件约束、阶段 profiles 和 defaults，以及验证用例。不可仅将输入中的 capability 改成 supported 绕过阶段限制。

## 验证方式与边界

在 agent/contracts 下安装 package.json 中固定的开发依赖后，执行 `npm test`。也可执行 `node scripts/check-input.cjs <输入文件>` 验证指定输入。

当前检查覆盖结构、阶段字段、缺省语义、个人区间比较资格和部分效果/记忆门槛；它不验证上游资格真假、引用对象存在性、时间范围、算法公式、跨用户隔离、状态迁移事务或科学正确性。执行任务与已接受方案的关联、效果验证的比较依据、IZNP 算法资格仍须产品适配层校验。通过 schema 不等于允许模型调用或建议安全。
