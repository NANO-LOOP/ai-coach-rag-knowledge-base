import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
export const skillDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
export function write(p,data){fs.mkdirSync(path.dirname(path.resolve(p)),{recursive:true});fs.writeFileSync(p,typeof data==='string'?data:JSON.stringify(data,null,2)+'\n',{flag:'wx'});}
export function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
export const hash=v=>crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
export function schemaCheck(name,data,custom){
 const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv);
 for(const file of [path.join(skillDir,'contracts',name+'.schema.json'),...(custom?[custom]:[])]){
  const validate=ajv.compile(read(file));
  if(!validate(data))throw Error('Schema: '+ajv.errorsText(validate.errors,{separator:'; '}));
 }
}
export function activeFacts(c){
 const p=c.evidence_packet;
 return p.facts.filter(f=>f.status==='valid'&&(!f.valid_until||Date.parse(f.valid_until)>Date.parse(p.as_of)));
}
export function validateCase(c,custom){
 schemaCheck('input',c,custom);
 if(c.schema_version!=='1.0.0')throw Error('Unsupported semantic contract');
 const p=c.evidence_packet,ids=new Set(),now=Date.parse(p.as_of);
 if(p.role==='post'&&!p.identity.event_id)throw Error('Post requires real synthetic event identity');
 if(p.role==='pre'&&!p.identity.wear_cycle_id)throw Error('Pre requires wear cycle identity');
 if(p.role==='post'&&p.event.end_at&&Date.parse(p.event.end_at)>now)throw Error('Post event is in future');
 if(p.event.start_at&&p.event.end_at&&Date.parse(p.event.end_at)<Date.parse(p.event.start_at))throw Error('Reversed event time');
 for(const f of p.facts){
  if(ids.has(f.id))throw Error('Duplicate fact id');ids.add(f.id);
  if(f.user_id!==p.identity.user_id)throw Error('Cross-user fact');
  if(['state','performance','questionnaire','marker','dialogue'].includes(f.kind)&&f.event_id!==p.identity.event_id)throw Error('Cross-event fact');
  if(f.recorded_at&&Date.parse(f.recorded_at)>now)throw Error('Future recorded fact');
  if(f.observed_at&&Date.parse(f.observed_at)>now)throw Error('Future observed fact');
  if(f.observed_at&&f.recorded_at&&Date.parse(f.observed_at)>Date.parse(f.recorded_at))throw Error('Observation after recording');
  if(['missing','skipped'].includes(f.status)&&f.value!==null)throw Error('Missing/skipped must keep null');
  if(f.source==='blink'&&f.key==='blank_blink'&&f.value!==null)throw Error('Blank Blink cannot contain inferred event');
 }
 for(const calc of p.calculations){
  if(ids.has(calc.id))throw Error('Duplicate calculation id');ids.add(calc.id);
  if(calc.input_fact_ids.length===0||calc.input_fact_ids.some(id=>!activeFacts(c).some(f=>f.id===id)))throw Error('Calculation uses unavailable facts');
 }
 if(p.role==='pre'){
  const core=['fatigue','psychological_stress','energy'].map(k=>activeFacts(c).filter(f=>f.kind==='state'&&f.key===k));
  if(core.some(a=>a.length>1))throw Error('Ambiguous current core');
  for(const list of core)if(list.length&&!['IDEAL','ATTENTION','ACTION'].includes(list[0].value))throw Error('Core must use controlled canonical level');
  const levels=core.map(a=>a[0]?.value);
  const expected=levels.includes(undefined)?'blue':levels.every(v=>v==='IDEAL')?'green':levels.every(v=>v==='ACTION')?'red':'yellow';
  if(p.rules.button_color!==expected)throw Error('Button rule mismatch');
 }
 return {valid:true,input_hash:inputHash(c),gate:gate(c),fact_count:p.facts.length};
}
export function gate(c){
 const p=c.evidence_packet,valid=activeFacts(c);
 if(!p.rules.device_qualified)return 'unavailable';
 if(p.role==='pre')return ['fatigue','psychological_stress','energy'].every(k=>valid.some(f=>f.kind==='state'&&f.key===k))?'ready':'waiting_data';
 if(p.event.processing_state==='unavailable')return 'unavailable';
 if(p.event.processing_state!=='ready')return 'waiting_data';
 return valid.some(f=>['state','performance','questionnaire','dialogue','marker'].includes(f.kind)&&f.value!==null)?'ready':'unavailable';
}
export function projectPacket(c){
 const p=structuredClone(c.evidence_packet);
 for(const f of p.facts)if(f.status==='invalidated'||(f.valid_until&&Date.parse(f.valid_until)<=Date.parse(p.as_of))){f.status='invalidated';f.value=null;}
 return p;
}
export const inputHash=c=>hash(projectPacket(c));
export function exportInput(c){validateCase(c);const p=projectPacket(c);return {schema_version:c.schema_version,input_hash:inputHash(c),evidence_packet:p};}
export function variant(c,patch){
 validateCase(c);const result=structuredClone(c);result.fixture.id+='-variant-'+hash(patch).slice(0,8);result.fixture.parent_input_hash=inputHash(c);
 const ids=new Set(result.evidence_packet.facts.map(f=>f.id));
 for(const id of patch.invalidate_fact_ids??[]){const f=result.evidence_packet.facts.find(f=>f.id===id);if(!f)throw Error('Unknown invalidation');f.status='invalidated';}
 for(const f of patch.fact_delta??[]){if(ids.has(f.id))throw Error('Use new id when replacing fact');ids.add(f.id);result.evidence_packet.facts.push(f);}
 if(patch.as_of){if(Date.parse(patch.as_of)<Date.parse(c.evidence_packet.as_of))throw Error('Cannot rewind evidence time');result.evidence_packet.as_of=patch.as_of;}
 if(Object.hasOwn(patch,'button_color'))result.evidence_packet.rules.button_color=patch.button_color;
 const allowed=['invalidate_fact_ids','fact_delta','as_of','button_color','reason'];
 if(Object.keys(patch).some(k=>!allowed.includes(k)))throw Error('Unknown patch property');
 if(!patch.reason)throw Error('Variant reason required');
 const active=new Set(activeFacts(result).map(f=>f.id));
 result.evidence_packet.calculations=result.evidence_packet.calculations.filter(calc=>calc.input_fact_ids.every(id=>active.has(id)));
 result.review_only.notes.push(patch.reason);validateCase(result);return result;
}
export function advance(c){
 if(!c.replay.length)throw Error('No next submitted simulation turn');
 const next=c.replay[0];
 const {message,...delta}=next;
 const out=variant(c,{...delta,reason:'Submitted simulated reply: '+message});
 out.replay=out.replay.slice(1);
 out.evidence_packet.rules.remaining_questions=Math.max(0,out.evidence_packet.rules.remaining_questions-1);
 return out;
}
export function verifyOutput(c,out,sources=[]){
 validateCase(c);schemaCheck('output',out);
 if(out.input_hash!==inputHash(c))throw Error('Input hash mismatch');
 if(out.status!==gate(c))throw Error('Generation gate mismatch');
 const facts=activeFacts(c),byId=new Map(facts.map(f=>[f.id,f]));
 for(const id of out.fact_refs)if(!byId.has(id))throw Error('Unavailable fact reference: '+id);
 if(out.status!=='ready'&&(out.action||out.hypothesis||out.question))throw Error('No advice before readiness');
 if(out.question&&c.evidence_packet.rules.remaining_questions<=0)throw Error('Question budget exhausted');
 const map=new Map();
 for(const s of sources){const key=s.id+'@'+s.revision;if(map.has(key)&&hash(map.get(key))!==hash(s))throw Error('Conflicting source snapshot');map.set(key,s);}
 for(const ref of out.knowledge_refs){const s=map.get(ref.id+'@'+ref.revision);if(!s||!s.excerpt||!s.url)throw Error('Knowledge source missing or stale');}
 for(const q of out.quantities){
  const fact=byId.get(q.ref),calc=c.evidence_packet.calculations.find(r=>r.id===q.ref&&r.review_status==='approved');
  if(!fact&&!calc)throw Error('Uncontrolled quantity');
  const source=fact??calc;
  if(source.value!==q.value||source.unit!==q.unit)throw Error('Quantity differs from source');
  if(fact&&!out.fact_refs.includes(q.ref))throw Error('Quantity fact must be cited');
 }
 return {valid:true,scientific_review:'pending_expert',prose_fidelity:'requires_review',input_hash:out.input_hash};
}
export function compare(c,before,after,sources){
 verifyOutput(c,before,sources);verifyOutput(c,after,sources);
 const changed=Object.keys(before.versions).filter(k=>before.versions[k]!==after.versions[k]);
 return {input_hash:inputHash(c),changed_versions:changed,confounded:changed.some(k=>k!=='knowledge'),expert_verdict:'pending',before_message:before.message,after_message:after.message};
}
export const candidateHash=c=>{const copy=structuredClone(c);delete copy.approval;return hash(copy);};
export function checkCandidate(c,revision){
 schemaCheck('candidate',c);
 if(!c.approval||c.approval.content_hash!==candidateHash(c))throw Error('Approval missing or stale');
 if(c.target.base_revision!==String(revision))throw Error('Remote revision conflict');
 if(c.kind==='dispute')throw Error('Dispute may only be recorded as unresolved, not published knowledge');
 return {ready:true,remote_write_performed:false};
}
export function eligibleUnit(u){return u.valid&&u.review_status==='confirmed'&&u.evidence_type!=='unverified'&&u.reviewer&&u.reviewed_at&&u.conditions.length&&u.boundaries.length&&u.sources.length;}
export function buildExport(bundle){
 const documents=bundle.documents,units=bundle.units,docMap=new Map();
 if(!Array.isArray(documents)||!Array.isArray(units))throw Error('Bundle requires documents and units arrays');
 const seen=new Set();
 for(const d of documents){if(typeof d.id!=='string'||!d.id||typeof d.title!=='string'||typeof d.url!=='string'||d.revision===undefined||!['knowledge','product_rule','case','navigation','dispute'].includes(d.kind))throw Error('Invalid document metadata');if(docMap.has(d.id))throw Error('Duplicate document id');docMap.set(d.id,d);}
 for(const u of units){schemaCheck('knowledge-unit',u);if(seen.has(u.id))throw Error('Duplicate knowledge id');seen.add(u.id);}
 const rows=units.map(u=>{const d=docMap.get(u.source_doc_id);const body=typeof d?.content==='string'&&d.content.trim().length>0;const anchored=body&&d.content.includes(u.content);return {...u,rag_eligible:!!(d?.kind==='knowledge'&&anchored&&String(d.revision)===u.source_revision&&eligibleUnit(u))};});
 return {documents,units:rows,partial:documents.some(d=>!d.content?.trim())||units.some(u=>!docMap.has(u.source_doc_id)),approved_count:rows.filter(u=>u.rag_eligible).length};
}
