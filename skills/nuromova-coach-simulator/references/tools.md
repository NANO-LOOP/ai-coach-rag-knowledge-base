# 当前工具边界

当前技能由会话模型按 Markdown 协议执行，不依赖 Node 模拟工具或外部模型 API。使用标准文件读写、Git 和仓库 tools/catalog.py 完成记录与结构检查。

旧 v2.0.1 脚本及 schema 已移入 archive/legacy-coach-kit-v2.0.1，仅作追溯，不调用。旧 render、advance 或测试成功不代表实际 Coach 模型运行。

在仓库根目录执行 `python3 tools/catalog.py --write` 和 `python3 tools/catalog.py --check`。这些命令不调用模型，不评判科学正确性，也不发布 RAG。
