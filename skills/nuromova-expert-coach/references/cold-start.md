# 冷启动和内部共享

这是内部运动表现专家工作流。产品部飞书文档已经共享；专家共同维护同一套文章，不创建每个人的知识库副本，不逐篇问有无权限。

## 新任务先做什么

1. 包尚未安装时，按包根 INSTALL.md 执行安装和只读检查。已安装则直接用当前入口，不因开始聊天重复安装。
2. 新测试请求执行 session-start，在用户本次工作目录建立新批次。继续请求用 session-show 恢复。个人记录不写在 Skill 目录中；不删除旧批次，也不清空团队索引或共享文章。
3. 按 knowledge-editor/config/knowledge-base.json 找入口并读取当前原文。配置里的版本只是定位快照，个人冷启动不代表远端全库从未审阅。检查团队现有记录后选题；用户明确要重审已审知识可在新个人批次进行。
4. 给出约200–350字的简短案例，附实际引用章节链接，接一个自然追问。不要先向专家输出技术报告、让其选引用或填表。

## 新电脑如何补齐飞书工具

先检查 lark-cli，存在就复用。未安装时参照包根 INSTALL.md 安装官方CLI，不复制发包人的账号数据。
如果目标会话没有 lark-doc / lark-wiki / lark-shared Skill，用 CLI 自带文档：

```sh
lark-cli skills read lark-shared
lark-cli skills read lark-doc
lark-cli skills read lark-wiki
```

再按所需操作读取相应 reference，例如 `lark-cli skills read lark-doc/references/lark-doc-fetch.md`。不猜参数；用户资料始终显式 --as user。

## 只有实际缺少连接才处理

读取成功就继续，不因“换专家”强制重新授权。实际登录缺失时读取 `lark-shared/references/lark-shared-identity-and-permissions.md`，按当前CLI帮助使用 auth status --json --verify。

有应用但用户未登录时，按所需文档业务范围发起 `lark-cli auth login --domain docs --domain drive --no-wait --json`；明确缺少某个scope时只补该scope。将CLI给出的授权URL原样与PNG二维码一起展示；让用户完成后告知，再执行CLI返回的device-code后续步骤。不把密钥、令牌或device code写到分享文件。

只有CLI明确提示未配置应用时才读 `lark-shared/references/lark-shared-config-init.md` 并初始化，不覆盖已有团队应用配置。如果授权过期，生成新链接，不复用旧链接。

如果是资源权限错误，说明当前账号与文档的实际问题；不要改用bot身份绕过、重置权限或复制文档来假装成功。文档已共享不代表CLI连接永不失效。

## 团队写入

正式修订由专家确认具体稿件后执行。每次写前读取最新版本，确认他人是否刚修订过；出现冲突先合并保留有效贡献，改稿后让专家只确认变化部分。写后读回位置和内容，再同步共享索引/变更记录。
个人会话、共享知识、产品规则候选、案例与反例保持各自用途。专业文章不插入聊天策略或安装说明。
