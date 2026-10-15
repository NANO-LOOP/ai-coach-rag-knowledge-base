# Markdown 知识维护与审阅约定

GitHub Markdown 是新知识的主维护源。这个目录管理单元身份、版本、审阅与冲突；个人用户的事实和回答保留在运行系统，不能将其未经去标识直接提交到本公开仓库。

## 基本元数据

实际单元使用 YAML front matter，必填 `id / type / version / review_status / evidence_type / updated_at`。可选字段包括 `sports / scenarios / reviewer / reviewed_at / review_ref`；正文继续保留完整条件、边界与来源。

| 字段 | 本样板约定 |
| --- | --- |
| `id` | 稳定且全库唯一；移动文件或普通改文案保留 ID |
| `type` | `concept / assessment / question / evidence / action / case / problem_package / topic`；`topic` 是专题导航，不是专业证据 |
| `version` | 本样板从 `0.1.0` 开始；有实质修改就更新版本并复查引用 |
| `review_status` | `draft / in_review / confirmed / disputed / needs_review / withdrawn`；确认仅对审阅记录明确列出的版本生效 |
| `evidence_type` | `original_research / research_synthesis / consensus / expert_experience / athlete_story / synthetic / practice_inference / design_proposal / legacy_unclassified`；最后一项只表示历史混合内容尚未分类，不能当作研究等级 |
| `updated_at` | 当前修改日期，采用用户所在时区日期 |

`practice_inference` 表示有条件的实践迁移，不表示专家已经认可；`design_proposal` 表示产品或知识组织建议，不作为生理科学依据。研究与经验同时出现时应分清具体段落的来源，必要时拆单元，不能用“mixed”抹平区别。

历史迁移稿另有 `domain / sport / import_status / publication_status / source_document_id / source_revision`，用于组织和溯源。`reference_only` 表示需要专家核对的历史材料，`unpublished` 表示尚未进入正式检索；这些字段不是科学认可。完整迁移说明见 [2026-10-15 记录](migration-2026-10-15.md)。

当前结构工具读取单行标量形式的 YAML front matter；复杂嵌套元数据应先讨论契约再适配工具，不静默忽略字段。案例与题材标签不能替代具体适用条件。

这套样板元数据是候选约定，与 `skills/nuromova-coach-simulator/contracts/knowledge-unit.schema.json` 中原有枚举和字段不同，不能直接交给旧 schema 校验或上传旧导出流程。后续需要明确适配，当前未修改旧 skills 与其清单。

## 专家维护流程

1. 从 [模板](../../templates/README.md) 创建草稿，或直接修改已有单元；先搜索可复用知识，避免重复建卡。
2. 填写结论、适用条件、反例、行动与来源。专业未知写清楚；AI 可以整理，不能代替专家形成确认。
3. 将修改范围、单元 ID/版本、关键差异和待确认点写进审阅记录；可通过 PR 讨论，也可以先本地审阅。
4. 专家明确确认具体版本后，记录其确认原话/评论链接、审阅范围和时间。只审一个段落不能将全包标为已确认。
5. 后续发生实质修订，受影响单元回到 `needs_review`；争议保留双方条件与证据，不删除反例伪造一致。

当前 [HYROX 审阅记录](reviews/hyrox-prior-load-v0.1.0.md) 全部待填写，没有专家批准记录。

用户已明确由后续专家完成内容审阅，不要求用户逐条审查。对目录与迁移的认可只授权结构工作，当前全部专业稿继续待专家审阅。

## 正式检索资格

此仓库尚无正式发布清单或运行中的资格计算器。新草稿默认不进入正式检索，不手工写 `rag_eligible: true` 来绕过审阅。未来正式发布至少需要：明确的版本清单、来源核对、适用范围与边界、实际专家确认，以及运行系统自己的权限与安全检查。

`confirmed` 只说明指定范围的审阅结论，不会把专家经验变成研究结论，也不自动使研究卡适合所有个人用户。案例和交互设计单元的确认不应被当作生理证据资格。

## 引用与来源变化

使用稳定 ID 和相对链接关联单元，问题包同时列出所用版本。来源论文或原文版本变化时，定位受影响结论、判断、提问和行动，逐项复查；不要整库批量盖章或将旧来源内容直接覆盖新稿。

## 检查能力边界

文件存在、链接可达、元数据齐全和来源哈希一致属于结构检查。案例表格是人工走读素材；没有模型运行、真实检索与专家记录时，不称为问答测试通过、科学有效或已部署。
