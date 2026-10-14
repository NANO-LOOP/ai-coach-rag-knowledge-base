# 共享工具
Node.js 20+。在此 Skill 目录执行 npm ci --ignore-scripts（仅首次或依赖变化），再执行 npm test。
四个 Skill 须作为同级目录安装。将下述 KIT 换为本 Skill 的 scripts/coach-kit.mjs 绝对路径；命令中路径可有空格，需按所用 shell 正确引用。
工具不调用 LLM、不读凭据、不写飞书。写 --out 时目标必须不存在，避免覆盖输入。

## 案例
node KIT list
node KIT case-generate --scenario badminton-pre --seed 42 --out case.json
node KIT case-validate --file case.json
node KIT export-input --file case.json --out input.json
node KIT render --file case.json --out card.txt
node KIT variant --file case.json --patch patch.json --out variant.json
node KIT advance --file case.json --out next.json
node KIT import-legacy --file coach-demo-fixtures-v1.3.json --id HYROX-DEMO-01 --out imported.json
case-generate 的种子控制确定性身份，不按随机数猜生理指标；改情境编辑 fixtures/scenarios.json 或使用 variant。
patch 包含 reason，及可选 invalidate_fact_ids/fact_delta/as_of/button_color；新事实须完整符合 fact schema，禁止覆盖原 ID。
advance 只推进下一个被选中的模拟用户回复，移除已消费 replay 项，并消耗一条产品普通问题预算。不代表专家真实作答。

## 复验
node KIT verify-output --file case.json --output reply.json --sources sources.json
node KIT compare --file case.json --before before.json --after after.json --sources sources.json
output.schema.json 定义字段；实际检验需要由模型生成 reply，工具不会伪造一个通过评测的回复。
若专家会话已看到完整答案，只能作演示；要作盲测，使用独立模型请求，仅传 export-input 与允许的知识/规则。当前包未配置模型 API。

## 连续记录
node KIT session-show --root WORKSPACE
node KIT session-start --root WORKSPACE
node KIT session-note --root WORKSPACE --file note.json
可用 --id 读取历史批次。note 最少含 kind/topic_id/summary，可追加 next_question、article_revision、candidate_ids。记录无自动删除；分享包不含 review-data。
node KIT select-topic --file topics.json
topics 是含 id/status/revision/reviewed_revision/impact/times_discussed/snoozed 的数组；优先级是显式策划输入，不是医学风险分。工具给出候选，Agent 结合当前谈话自然选择，不被排序锁死。

## 候选
node KIT candidate-seal --file candidate.json --approval approval.json --out approved.json
node KIT candidate-check --file approved.json --current-revision 6
approval 文件含真实 quote/message_ref/approved_at，仅在专家已经明确确认后记录。target.base_revision 必须为刚读取的文档版本；新稿变更会使旧 hash 失效。
通过只说明本地前置检查通过，飞书写入与读回由知识维护 Skill 执行，不能标为已写入。

## 导出
node KIT export-kb --file bundle.json --out handoff-NEW
bundle 含 documents 和 units；documents 每项至少 id/title/url/revision/kind/content，kind=knowledge/product_rule/case/navigation/dispute。
生成 Markdown 正文、manifest.json、knowledge-units.jsonl。正式检索筛选 rag_eligible=true；未确认、争议、版本不符和正文缺失不会进入。
生产导出需保留每个文章的访问范围与来源；工具只使用本地快照，不复制飞书访问权限。研发须实现用户权限过滤。
