# 知识结构与审阅契约

以根目录 knowledge/STRUCTURE.md、knowledge/governance/README.md 和 templates/ 为唯一字段规范；本文件不复制枚举，避免出现第二份不一致 schema。

基本字段为 id、type、version、review_status、evidence_type、updated_at。当前解析器支持单行标量 front matter；未知留在正文说明，不能写复杂嵌套字段后声称已通过解析。

catalog.json 是结构库存，不是可上线检索白名单。没有自动发布清单。研究依据、专家经验、实践推断、构造案例须分别标注，专家确认不会自动提高证据类型。

专业确认需要实际审阅者、时间、明确的单元版本和范围，以及可追溯的原话或评论记录。记录使用 templates/review.md；不能把模拟回复或“同意整理”作为批准。存在争议时保留各方条件与证据。

正文完整保留适用条件、反例、行动含义和来源；索引只链接复用。原始导入 lineage 是溯源记录，不是当前运行时文档地址。新知识写入 typed 目录，不写回归档。
