# 本地 Markdown 技能改造检查

本次将专家流程拆为一个入口和四个功能 Skill。当前技能只读取本地项目正文，旧远程配置及路由已移除，旧模拟脚本与 schema 完整移至 archive/legacy-coach-kit-v2.0.1，不再作为当前运行依赖。

## 已执行

- 五个 SKILL.md 均通过 skill-creator 的 quick_validate.py 格式检查。
- 当前技能的 Markdown 相对链接全部指向实际文件。
- skills-manifest.json 中 20 个文件的 SHA-256 与磁盘一致。
- catalog.py --write / --check 通过：168 个结构记录、765 个本地链接、137 个历史编号章节。
- git diff --check 通过。
- 当前 skills 中的 Feishu/Lark 字样仅保留禁止访问的规则，无旧平台 URL、登录流程或写回指令。

## 检查边界

以上是格式、路径和结构检查。未运行独立模型端到端实验，未进行真实专家审阅，未验证训练效果，也未发布正式 RAG。当前交互由会话模型按 Skill 指令执行，没有新增自动调用模型 API 的运行器。

旧工具的历史测试结果不作为本次技能行为验证。全局已安装技能及旧分发包未被修改，使用时须指向仓库内新入口。
