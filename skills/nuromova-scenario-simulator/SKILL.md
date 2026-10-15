---
name: nuromova-scenario-simulator
description: 为内部专家构造 AI Coach 测试场景和结构化输入，覆盖已知、未知、否定及冲突；用于生成或调整运动案例，不生成 Coach 的预定答案。
---

启动时先读 [仓库协议](../nuromova-expert-coach/references/repository.md)，定位并实际读取当前项目 Markdown。

# 场景与结构化输入

先读 [L0–L6 输入模型](../../agent/input-model.md)，使用其阶段配置、JSON Schema 和缺省模板；未指定阶段时默认 T0。读取相关问题包的输入、问题、判断和行动卡；遵守 [会话数据约定](../nuromova-expert-coach/references/session-contract.md)。专家未给主题时使用当前 HYROX 问题包，未指定运动阶段时从包内情境推导并说明。

1. 明确本例要检验的判断分支，例如“昨天加练是否影响今天关键课”。不要先把假设设为事实。
2. 从 `agent/contracts/defaults/<阶段>.json` 复制生成 `initial_input.json`，按 schema 补齐 L0–L6 的允许字段，mode=synthetic。阶段支持、数据可用性和事实真伪分开；不支持或未接入的字段保留带原因的 null。T1 增加执行/复评，T2 才有 IZNP 比较与长期经验；外部接口未确认时仍不可用。每条事实保留来源及发生/记录时间。
3. `scenario.md` 只作 JSON 的专家阅读摘要；session_id、scenario_id、scenario_version、构造说明和测试目的保存到 `simulation_meta.json`，不将测试预期混入 Coach 输入。用 contracts/scripts/check-input.cjs 校验 JSON；依赖不可用时说明未校验，不虚报通过。
4. 区分 Coach 起始可见信息和后续回答。起始事实不透露隐藏原因；尚未回答的信息保持 unknown。模拟用户由专家扮演是默认方式。需要预设角色信息时单独保存 `athlete-role.md`，不混入 Coach 输入。
5. 标注数值为构造值，检查单位、事件顺序和身份一致性，不将构造阈值变为知识结论。不同变式显式改变相关事实，不只改随机种子或案例名称。
6. 输出简短场景和起始结构化输入，交给 Coach 模拟。不得在本步骤预先输出“正确诊断”。

比较分支时从同一基线复制并增加版本，记录改动字段；至少可覆盖支持、否定、记不清及信息冲突。专家调整事实后创建新版本，保留原始记录。

如果同一会话已读到角色隐藏信息，后续只能称为带上下文的演示；要验证信息隔离，需要另行运行只接收可见输入的模型环境，并记录实际运行方式。不得仅凭“忽略上文”声称隔离成功。

场景也用于 [Agent 行为验证](../../agent/evaluation.md)。生成时说明要观察的行为，例如“已有记录时跳过重复提问”，并保留支持与反例版本。预期行为记录在专家侧，不向 Coach 输入泄露预定结论。
