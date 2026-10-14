# 能力组与边界
版本 2.0.1；用户确认于 2026-09-29。一个入口、专家访谈、Coach 模拟复验、知识维护四个 Skill，共享 Node 工具；不需要多 Agent 或部署新 App。
专家体验：完整但简短案例优先；必要时准确简述或逐轮展开；每次一个有价值的问题；Agent 主动建议阶段整理；专家明确确认稿件即可写入；按知识缺口与覆盖推进，随时允许换题。
产品 Coach 和专家访谈是两种对话。产品追问预算来自受控输入，专家访谈不受这个固定上限约束。
科学知识保留完整文章和可检索单元；产品规则、案例、未决争议分开保存。检索配置不等同固定决策树。
共享文件：case、output、candidate、knowledge-unit 的 JSON Schema 均由模拟 Skill 管理；相邻 Skill 不再维护副本。
会话状态保存在工作目录 review-data。知识正文的权威副本在飞书；本地文章快照注明版本。多个专家共享知识不共享凭据；复验与审阅状态不等同运动者接受/执行/效果。

## 已读取的产品参考
- 架构 v1.3：https://ni4nrbhniif.feishu.cn/wiki/IpHXwdJ77iiysikruS7cNst6nNf （2026-09-29 读取 revision 6）。
- 案例 v1.4：https://ni4nrbhniif.feishu.cn/wiki/VhQww1fPNiMsl5kmHuoc3Rn7n4H （同日读取 revision 23）。
架构稿明示历史归档，案例待科学审阅；正式接产品需核对当前研发文档及字段映射。不要把归档参数当永久最新规则。
输入附件 v1.3 可 import-legacy；只接入 initial_input，不把预期输出及未来用户答案泄露给 Coach。导入后需人工核对字段语义，不能称已对接生产。
