const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Ajv=require('ajv');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const validate=new Ajv({allErrors:true,strict:false}).compile(read('coach-input.schema.json'));
const defaults=stage=>read(`defaults/${stage}.json`);
const source={kind:'synthetic',reference:'unit-test',simulated_source:'user_report'};
const fill=(x,l,k,data)=>Object.assign(x.layers[l][k],{availability:'available',reason:null,data});
const valid=x=>assert.equal(validate(x),true,JSON.stringify(validate.errors));
const invalid=x=>assert.equal(validate(x),false);
for(const stage of ['T0','T1','T2'])test(`${stage} defaults preserve all layers with no invented data`,()=>{
 const x=defaults(stage);valid(x);assert.equal(Object.keys(x.layers).length,7);
 const profile=read(`profiles/${stage}.json`);
 for(const [layer,slots] of Object.entries(x.layers))for(const [k,v]of Object.entries(slots)){
  assert.equal(v.data,null);assert.notEqual(v.availability,'available');
  assert.equal(v.capability,profile.capabilities[layer+'.'+k]);
 }
});
test('partial synthetic example accepts missing optional fields and unknown safety',()=>valid(read('examples/T0-hyrox-partial.json')));
test('T0 cannot fabricate execution tracking',()=>{const x=defaults('T0');fill(x,'L5','execution_tracking',[]);invalid(x)});
test('T1 may record partial execution without claiming a result',()=>{const x=defaults('T1');fill(x,'L5','execution_tracking',[{id:'E1',plan_id:'P1',plan_version:'1',completed:'partial',confirmed_at:null,source}]);valid(x)});
test('T1 cannot enable IZNP by changing the capability flag',()=>{const x=defaults('T1');x.layers.L1.iznp.capability='supported';invalid(x)});
test('T2 does not silently enable an unspecified HRV adapter',()=>{const x=defaults('T2');x.layers.L3.hrv.capability='supported';fill(x,'L3','hrv',[]);invalid(x)});
function analysis(k){return {k_stage:k,progress:'active',pending_question:null,asked_question_ids:[],hypotheses:[],correction_fact_ids:[],lifecycle_status:'OPEN',end_reason:null,summary_revision:null,latest_summary:null};}
test('T0 rejects K6 even with otherwise valid analysis',()=>{const x=defaults('T0');fill(x,'L2','analysis',analysis('K6'));invalid(x)});
test('T1 accepts the K6 state vocabulary',()=>{const x=defaults('T1');fill(x,'L2','analysis',analysis('K6'));valid(x)});
test('T2 K3 requires comparable upstream IZNP',()=>{
 const x=defaults('T2');fill(x,'L2','analysis',analysis('K3'));invalid(x);
 fill(x,'L1','iznp',{eligibility:'building',sport_id:'running',context:'training',model_version:null,comparison_event_id:'E1',support_refs:[],ranges:[],source});invalid(x);
 x.layers.L1.iznp.data.eligibility='comparable';valid(x);
});
test('future answers and expected outputs are not accepted as model input',()=>{const x=defaults('T0');x.expected_output='diagnosis';invalid(x)});
test('missing data cannot be a fabricated zero',()=>{const x=defaults('T0');x.layers.L3.hrv.data=0;invalid(x)});
test('unknown fact cannot contain an asserted value; denial remains a real answer',()=>{
 const x=defaults('T0');const f={id:'F1',key:'trained_yesterday',value:false,unit:null,epistemic:'unknown',availability:'available',reason:null,occurred_at:null,recorded_at:null,time_precision:'unknown',source,replaces_fact_ids:[],conflict_fact_ids:[]};
 fill(x,'L1','profile',[f]);invalid(x);f.epistemic='denied';valid(x);
});
test('confirmed empty history differs from missing history',()=>{const x=defaults('T0');fill(x,'L5','history',[]);valid(x);assert.equal(defaults('T0').layers.L5.history.data,null)});
test('effectiveness cannot be inferred from partial execution',()=>{
 const x=defaults('T1');const o={id:'O1',plan_id:'P1',plan_version:'1',original_event_id:'E1',validation_event_id:'E2',same_sport_valid_event:true,execution:'partial',comparable:'yes',user_performance:'improved',judgment:'helped',rechecked_at:null,fact_refs:[],source};fill(x,'L5','outcomes',[o]);invalid(x);o.judgment='not_assessed';valid(x);
});
test('T2 memory cannot claim improvement without confirmation',()=>{
 const x=defaults('T2');const m={id:'M1',sport_id:'running',outcome_refs:['O1'],plan_id:'P1',execution_confirmed:true,comparability_confirmed:true,performance_improvement_confirmed:false,claim_scope:'helped_once',success_count:1,le_candidate:true,source};fill(x,'L6','experience_memory',[m]);invalid(x);m.performance_improvement_confirmed=true;valid(x);m.claim_scope='repeated_comparable_success';invalid(x);
});
test('wear approval cannot contradict the hardware gate',()=>{const x=read('examples/T0-hyrox-partial.json');x.layers.L0.controls.data.hardware_wear='failed';invalid(x)});
