本知识库为产品部向内部专家共享的团队资料，默认直接读取原文。新设备仅需自己的CLI连接，勿要求逐篇重复授权。
# 飞书维护
查看 config/knowledge-base.json 中的当前入口与节点映射。通过 wiki +node-get 解析 space_id，不把历史空间 ID 当永久常量。
使用可用的 lark-wiki 管层级、lark-doc 管正文；按各 Skill 的 reference 检查参数。执行前先看 --help，不猜 flag。用户身份 --as user；凭据保留 CLI 安全存储，不放 Skill、日志、文档或聊天。
若使用者尚未登录/没有资源权限，说明当前实际阻塞，并遵从 lark-shared 授权方式；安装 Skill 不会赋予飞书访问权限。

读取：lark-cli docs +fetch --doc URL --doc-format markdown --as user --format json
需要章节精确定位先 outline 再 section/keyword，使用实际 block ID 组成直达链接；没有 ID 就链接文章并写明章节标题。
正文修改先 fetch 最新 full/with-ids，保存版本与原文；用 block_replace/str_replace 或小范围 append，避免覆盖整篇丢失附件和评论。
目录创建用 wiki +node-create；移动用 wiki +move --node-token SOURCE --target-parent-token TARGET。先盘点同名节点，避免重复。目录整理只在已授权范围，保留原始链接。
每次写入核对 ok/result/warnings，随后重新 fetch 核对实际正文。只回读标题或节点创建成功不算内容成功。目录调整还要 node-get/node-list 核验父子关系。
失败请求未知时先读远端变更 ID，禁止盲目重试。需要新授权或资源访问权时停相关写入，继续本地候选整理，不能换身份绕过。

没有预装 lark-* Skill 时，可通过 `lark-cli skills read lark-shared`、`lark-cli skills read lark-wiki`、`lark-cli skills read lark-doc` 读取 CLI 自带指导，按其中引用读取具体参考。连接检查和初始化见 [冷启动说明](../../nuromova-expert-coach/references/cold-start.md)。
