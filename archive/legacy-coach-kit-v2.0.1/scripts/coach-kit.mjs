#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {read,write,hash,skillDir,activeFacts,validateCase,exportInput,variant,advance,verifyOutput,compare,candidateHash,checkCandidate,schemaCheck,buildExport} from './lib.mjs';
export function generate(name,seed=1){
 const scenarios=read(path.join(skillDir,'fixtures/scenarios.json'));
 const s=scenarios.find(s=>s.id===name);if(!s)throw Error('Unknown scenario');
 if(!Number.isSafeInteger(seed))throw Error('Seed must be integer');
 const id='SIM-'+name+'-'+seed,user='SIM-USER-'+seed,event=s.role==='pre'?null:id+'-EVENT';
 const when='2026-09-01T12:00:00+08:00';
 const facts=s.facts.map((f,i)=>({id:id+'-F'+(i+1),user_id:user,event_id:['background','profile','history'].includes(f.kind)?null:event,kind:f.kind,key:f.key,value:f.value,unit:f.unit??null,source:f.source,status:f.status??'valid',observed_at:f.observed_at??null,recorded_at:when,valid_until:null,time_label:f.time_label??null}));
 const p={identity:{user_id:user,event_id:event,wear_cycle_id:s.role==='pre'?id+'-WEAR':null},role:s.role,as_of:when,event:{sport:s.sport,goal:s.goal,start_at:s.role==='pre'?'2026-09-01T13:00:00+08:00':'2026-09-01T10:00:00+08:00',end_at:s.role==='pre'?null:'2026-09-01T11:00:00+08:00',processing_state:s.role==='pre'?'planned':'ready'},facts,calculations:[],rules:{device_qualified:true,remaining_questions:3,button_color:s.role==='pre'?s.button_color:null}};
 const c={schema_version:'1.0.0',fixture:{id,synthetic:true,scenario:name,seed,parent_input_hash:null},evidence_packet:p,replay:[],review_only:{topic:s.topic,notes:['构造演示，非实际算法或用户记录；日期为可重复测试时钟。种子控制身份，不用于编造生理差异。']}};
 validateCase(c);return c;
}
export function sessionStart(root){
 const dir=path.join(path.resolve(root),'review-data'),id=new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex');
 const session={id,created_at:new Date().toISOString(),events:[]};write(path.join(dir,id,'session.json'),session);
 fs.mkdirSync(dir,{recursive:true});const pointer=path.join(dir,'active-'+crypto.randomUUID()+'.tmp');write(pointer,{id});fs.renameSync(pointer,path.join(dir,'active.json'));return session;
}
export function sessionShow(root,id){
 const dir=path.join(path.resolve(root),'review-data');
 if(!id){if(!fs.existsSync(path.join(dir,'active.json')))return null;id=read(path.join(dir,'active.json')).id;}
 if(!/^[a-zA-Z0-9_-]+$/.test(id))throw Error('Unsafe session id');
 const session=read(path.join(dir,id,'session.json'));
 if(session.id!==id||!Array.isArray(session.events))throw Error('Corrupt session identity or events');
 return session;
}
export function sessionNote(root,note,id){
 const session=sessionShow(root,id);if(!session)throw Error('Start a session first');
 if(!note.kind||!note.topic_id||!note.summary)throw Error('Note requires kind, topic_id, summary');
 const dir=path.join(path.resolve(root),'review-data',session.id);
 const lock=path.join(dir,'.lock');const fd=fs.openSync(lock,'wx');
 try{
  const current=read(path.join(dir,'session.json'));
  current.events.push({...note,recorded_at:new Date().toISOString()});
  const tmp=path.join(dir,'session-'+crypto.randomUUID()+'.tmp');write(tmp,current);
  fs.renameSync(tmp,path.join(dir,'session.json'));return current;
 }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
export function selectTopic(topics){
 return [...topics].filter(t=>!t.snoozed&&(!['confirmed','written'].includes(t.status)||t.revision!==t.reviewed_revision)).sort((a,b)=>{
  const rank=t=>t.revision!==t.reviewed_revision&&t.reviewed_revision?4:t.status==='disputed'?3:t.status==='unreviewed'?2:t.status==='in_progress'?1:0;
  return (b.impact??0)-(a.impact??0)||rank(b)-rank(a)||(a.times_discussed??0)-(b.times_discussed??0)||String(a.id).localeCompare(String(b.id));
 })[0]??null;
}
export function importLegacy(raw,caseId){
 const selected=raw.cases?raw.cases.find(x=>x.case_id===caseId):raw;if(!selected)throw Error('Legacy case not found');
 const initial=selected.initial_input??selected;const sport=initial.current_event?.sport;
 const sportText=typeof sport==='string'?sport:sport?.value??'未知项目';
 const skeleton=generate('badminton-post',1),uid='LEGACY-USER',eventId=selected.identity?.event_id??initial.current_event?.event_id??initial.current_event?.setup?.event_id??'LEGACY-EVENT';
 skeleton.fixture={id:selected.case_id??initial.case_id??'LEGACY',synthetic:true,scenario:'legacy-import',seed:0,parent_input_hash:null};
 const p=skeleton.evidence_packet;p.identity={user_id:uid,event_id:eventId,wear_cycle_id:null};p.event={sport:sportText,goal:initial.athlete_context?.current_goal??'复盘本场',start_at:null,end_at:null,processing_state:'ready'};p.facts=[];
 // Preserve relative-time semantics. The as_of timestamp is a synthetic review clock, not an inferred event date.
 const add=(kind,key,value,source,ev=eventId)=>p.facts.push({id:'LEGACY-F'+(p.facts.length+1),user_id:uid,event_id:ev,kind,key,value:value??null,unit:null,source,status:value===null||value===undefined?'missing':'valid',observed_at:null,recorded_at:null,valid_until:null,time_label:'原始附件相对时间；未映射真实日期'});
 const n1=initial.n1_evidence??{};
 for(const [i,segment] of (n1.segments??[]).entries())for(const key of ['fatigue','focus','psychological_stress'])if(segment[key]!==undefined)add('state',key+'_segment_'+i,segment[key],'algorithm');
 for(const key of ['heart_rate','power'])if(n1[key]!==undefined)add('state',key,n1[key],'device');
 const emotion=n1.emotion_algorithm_output;
 if(emotion)add('state','emotion',(emotion.available===false||emotion.available_for_demo===false)?null:emotion.summary??null,'algorithm');
 const q=initial.post_sport_questionnaire??{};
 for(const key of ['srpe','srpe_0_to_10','performance_choice','training_performance_choice','feeling_bubbles'])if(q[key]!==undefined)add('questionnaire',key,q[key],'questionnaire');
 if(initial.personal_review?.text)add('performance','personal_review',initial.personal_review.text,'user');
 for(const [k,v] of Object.entries(initial.before_and_after_context??{}))add('background',k,v&&typeof v==='object'&&Object.hasOwn(v,'records')?v.records:v,'user',null);
 for(const mark of initial.in_session_markers??[])add('marker',mark.type==='blink_timestamp'&&!mark.text?'blank_blink':mark.type,mark.text??null,mark.type==='blink_timestamp'?'blink':'note');
 for(const f of p.facts)if(f.key==='blank_blink')f.status='valid';
 skeleton.replay=[];skeleton.review_only={topic:'历史附件适配',notes:['仅导入 initial_input；replay、expected_output、audit_only 完全排除。','原附件可能混合来源，需人工核对后才能作为生产映射。','没有推造真实日期、canonical 程度或问答。']};
 validateCase(skeleton);return skeleton;
}
const HELP='Commands: list, case-generate, case-validate, export-input, render, variant, advance, import-legacy, verify-output, compare, session-start, session-show, session-note, select-topic, candidate-seal, candidate-check, export-kb. Options: --file --out --scenario --seed --root --id --patch --output --sources --before --after --approval --current-revision --schema.';
export async function main(argv){
 const [command,...rest]=argv,opts={};
 for(let i=0;i<rest.length;i+=2){if(!rest[i].startsWith('--')||rest[i+1]===undefined)throw Error('Options require values');opts[rest[i].slice(2)]=rest[i+1];}
 const need=k=>{if(!opts[k])throw Error('Missing --'+k);return opts[k];};
 let result;
 switch(command){
 case 'list':result=read(path.join(skillDir,'fixtures/scenarios.json')).map(({id,sport,role,topic})=>({id,sport,role,topic}));break;
 case 'case-generate':result=generate(need('scenario'),Number(opts.seed??1));break;
 case 'case-validate':result=validateCase(read(need('file')),opts.schema);break;
 case 'export-input':result=exportInput(read(need('file')));break;
 case 'variant':result=variant(read(need('file')),read(need('patch')));break;
 case 'advance':result=advance(read(need('file')));break;
 case 'import-legacy':result=importLegacy(read(need('file')),opts.id);break;
 case 'render':{
  const c=read(need('file'));validateCase(c);
  result='构造演示｜'+c.evidence_packet.event.sport+'｜'+(c.evidence_packet.role==='pre'?'运动前':'运动后')+'\n\n'+activeFacts(c).map(f=>'- '+f.key+'：'+(typeof f.value==='object'?JSON.stringify(f.value):f.value)+(f.unit?' '+f.unit:'')).join('\n')+'\n\n仅数据摘要；Coach 建议须结合已读取知识生成。';break;
 }
 case 'verify-output':result=verifyOutput(read(need('file')),read(need('output')),read(need('sources')));break;
 case 'compare':result=compare(read(need('file')),read(need('before')),read(need('after')),read(need('sources')));break;
 case 'session-start':result=sessionStart(need('root'));break;
 case 'session-show':result=sessionShow(need('root'),opts.id);break;
 case 'session-note':result=sessionNote(need('root'),read(need('file')),opts.id);break;
 case 'select-topic':result=selectTopic(read(need('file')));break;
 case 'candidate-seal':{
  const c=read(need('file')),a=read(need('approval'));schemaCheck('candidate',c);
  c.approval={content_hash:candidateHash(c),quote:a.quote,message_ref:a.message_ref,approved_at:a.approved_at};schemaCheck('candidate',c);result=c;break;
 }
 case 'candidate-check':result=checkCandidate(read(need('file')),need('current-revision'));break;
 case 'export-kb':{
  result=buildExport(read(need('file')));
  const dir=path.resolve(need('out'));if(fs.existsSync(dir))throw Error('Export directory already exists');
  fs.mkdirSync(dir,{recursive:true});
  result.documents.forEach(d=>{if(d.content?.trim())write(path.join(dir,'articles',hash(d.id).slice(0,16)+'.md'),d.content);});
  write(path.join(dir,'knowledge-units.jsonl'),result.units.map(u=>JSON.stringify(u)).join('\n')+'\n');
  write(path.join(dir,'manifest.json'),{schema_version:'1.0.0',exported_at:new Date().toISOString(),partial:result.partial,approved_count:result.approved_count,documents:result.documents.map(({content,...d})=>({...d,path:content?.trim()?'articles/'+hash(d.id).slice(0,16)+'.md':null,content_hash:content?.trim()?hash(content):null}))});
  console.log(JSON.stringify({exported:dir,partial:result.partial,documents:result.documents.length,approved_count:result.approved_count}));return;
 }
 default:console.log(HELP);return;
 }
 if(opts.out){write(opts.out,result);console.log(JSON.stringify({saved:opts.out}));}
 else console.log(typeof result==='string'?result:JSON.stringify(result,null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
