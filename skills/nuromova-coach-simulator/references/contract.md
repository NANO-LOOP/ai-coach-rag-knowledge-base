# 评审数据约定 1.0.0
用途：统一专家评审案例的语义输入，使同一数据能复验知识版本；不是正式后端 schema。

## 对照
| 现有附件/产品语义 | 当前工具字段 |
|---|---|
| athlete / event / wear cycle | evidence_packet.identity |
| current_event | event（运动前 event_id 可空；不伪造已开始运动） |
| n1_evidence、问卷、Note、历史等 | facts，保留 kind/source/status/time |
| 受控计算输出 | calculations（版本、单位、输入引用和审核状态） |
| readiness、剩余问题、按钮结果 | rules |
| 后续用户回答 | replay，只有明确推进才成为当前事实 |
| expected_output/audit_only | 不进入 evidence_packet；review_only 仅审阅侧 |

facts 的 key 可扩展；kind/source/status 固定枚举。变化需新 schema 版本、映射、样例和测试，未支持版本应失败；--schema 允许加严验证，不允许绕开语义版本检查。
recorded_at 是本轮何时获知，observed_at 是事件何时发生；不精确可为空且保留 time_label。发生在运动后的行为不能解释此前表现。
运动前三核心疲劳/压力/精力使用 IDEAL/ATTENTION/ACTION 的受控程度，不从原始数值重算阈值。任一缺失/失效则 waiting_data；按钮 blue 不等于禁用或安全。规则层结果应与三项一致。
复盘 processing_state=ready 后允许部分有效项；没有任何本场可用实质事实则 unavailable。空白 Blink 不是表现或情绪证据。
rules.device_qualified 在运动前指当前设备准入，在运动后指本场已有资格结算有效，不表示用户现在仍佩戴设备。查看既有有效复盘不要求重新佩戴。
算法状态、用户事实、假设、建议分离。用户否认后旧事实 invalidated；新事实有新 ID，不把旧记录擦掉。activeFacts 排除过期/失效事实。
历史按目标运动开始时间取前7天背景与前28天最多3场同项目（来自归档稿；接生产需核对现行约定），不拿今天当锚点、不扩大窗口凑数；单场历史不是个人基线。
工具的 legacy 导入保留相对时间，不造真实日期或 canonical 阈值；原文件不同 source 层级需人工映射检查。
legacy 是白名单适配器，只迁入已支持的状态、问卷、个人复盘、前后背景及标记；不会无损迁移所有档案、历史和附件字段。正式映射须对照原始 initial_input 检查遗漏，不能把导入成功等同完整迁移。

## 输出约定
message 是用户看到的话；question 可空；hypothesis/unknowns 是简洁可审计内容。fact_refs 指向有效事实；knowledge_refs 指向实际读取的来源 ID 和版本；quantities 必须等于输入事实或已审核计算结果。
来源文件为数组，每项含 id/url/revision/excerpt；excerpt 是实际摘取内容，不是模型编写的出处。
versions 记录真实 model/prompt/sport_config/rules/knowledge；不知道就填 unknown，不能假装已经调用产品模型。
脚本验证结构与明确引用，不验证全部自然语言数字、因果正确性、科学有效性、权限或医学风险；这些仍需专家和产品校验。
