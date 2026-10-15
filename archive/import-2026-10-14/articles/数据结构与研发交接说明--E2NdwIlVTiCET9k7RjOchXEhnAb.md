# 数据结构与研发交接说明

管理版本：2.0.0｜2026-09-29

交接入口就是 RAG库知识储备。本轮交付知识组织、正文快照、审阅约定和本地工具，不代表已部署检索服务或完成全部科学审核。

# 资产

articles/\*.md 保存原文快照；manifest.json 保存文档ID、链接、分类、版本、抓取时间、正文hash和访问要求；knowledge-units.jsonl 保存完整章节与稳定ID、来源、条件、边界和审阅状态。

# 检索分流

knowledge 是专业文章；product_rule 是产品规则；case 是案例；navigation 是导航；dispute 是争议。默认正式知识检索仅使用 rag_eligible=true 单元。未审阅、条件边界未结构化、版本失配及来源待核验不会自动进入这个集合。

当前初始章节索引全部待逐点核对；正式可检索标记为零不表示没有内容，而是没有给未经核验的历史资料自动盖章。原文内容已完整保留，可用于研发设计与专家工作。

# 结构与版本

输入包含 identity、role、event、facts、calculations、rules；事实保留来源、时间和有效性。评审schema为1.0.0，属于语义适配，须与实际后端接口对照。原附件initial_input可导入，未来答案和audit_only不进入Coach生成输入。

复验输出记录用户消息、可选一问、事实及知识引用、主要假设、行动和版本。独立干净请求才可用于盲测；已看完整答案的专家聊天只能用于演示改写。工具不调用模型API，也不把本地校验称作生产验收。

# 研发后续工作

核对生产字段与事件权限；按适用条件保留上下文切片；做访问权限过滤、引用与撤回同步；对专业知识和案例分别建立检索与评测；结合真实专家反馈验证效果。

快照中的附件标记保留在正文，但二进制附件未自动转录；如需要其中的内容，应另行取回、核对许可及解析结果。拥有导出文件或Skill不等于拥有飞书原文权限。

[nuromova-rag-handoff-20260929.zip](../assets/HsQIbv53CoCWRIxuG63cY1aMnQb.zip)

[nuromova-expert-coach-skills-v2.0.0.zip](../assets/QzoUbCiubotItux2c8mcE2YbnPe.zip)

---

来源：[飞书原文](https://ni4nrbhniif.feishu.cn/wiki/E2NdwIlVTiCET9k7RjOchXEhnAb) · 文档版本：6 · 抓取时间：2026-10-14T06:30:19.867208+00:00
