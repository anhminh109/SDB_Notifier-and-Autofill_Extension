import {token,api,sourceData,targetData} from './google.js';
import {submitColumn,planWrites,sameTarget} from './writer.js';
import {nameColumn,submissionList} from './list.js';
import {readSheet as read} from './reader.js';

import {csv,sheetLink,column,extract,diff,zoomColumn,zoomRoster,zoomValue} from './core.js';
let busy=false;
async function notify(items,config){const last=items.at(-1);const text=items.length===1?`SBD: ${last.sbd} vừa nộp bài${last.name?' · '+last.name:''}`:items.length+' lượt nộp mới: '+items.slice(0,8).map(x=>x.sbd).join(', ')+(items.length>8?'…':'');
 let toasted=false;if(config.toast){try{const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});if(tab?.id){const a=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(text,url)=>{if(document.visibilityState!=='visible')return false;let box=document.getElementById('__sbd_notify_host');if(!box){box=document.createElement('div');box.id='__sbd_notify_host';box.style.cssText='position:fixed!important;right:20px!important;bottom:20px!important;z-index:2147483647!important;';box.attachShadow({mode:'open'});document.documentElement.append(box);}const root=box.shadowRoot;const card=document.createElement('div');card.style.cssText='box-sizing:border-box;background:#22203d;color:white;width:330px;max-width:85vw;padding:18px;margin-top:8px;border-radius:12px;box-shadow:0 8px 32px #0005;font:15px/1.5 Arial;';const msg=document.createElement('div');msg.textContent=text;const open=document.createElement('a');open.textContent='Mở sheet nộp bài ↗';open.href=url;open.target='_blank';open.rel='noopener noreferrer';open.style.cssText='color:#c5b9ff;display:block;margin-top:10px';const close=document.createElement('button');close.textContent='Đóng';close.style.cssText='float:right;margin:8px 0 0 8px;cursor:pointer';close.onclick=()=>card.remove();card.append(msg,close,open);root.append(card);while(root.children.length>3)root.firstChild.remove();setTimeout(()=>card.remove(),15000);return true;},args:[text,config.source.url]});toasted=a.some(x=>x.result===true);}}catch{}}
 if(!toasted)try{await chrome.notifications.create('submission-'+Date.now(),{type:'basic',iconUrl:'icon.png',title:`Zoom ${config.zoomValue||'52'} — Thí sinh vừa nộp bài`,message:text});}catch(e){await chrome.storage.local.set({notificationError:'Thông báo hệ thống bị lỗi: '+e.message});}
}
async function check(force=false){
 if(busy)return;busy=true;
 try{
  const st=await chrome.storage.local.get(['config','seen','initialized','history','lastAttempt']);const c=st.config;if(!c?.enabled)return;
  if(!force&&Date.now()-(st.lastAttempt||0)<4500)return;
  await chrome.storage.local.set({lastAttempt:Date.now()});
  if(c.source.id===c.target.id&&c.source.gid===c.target.gid)throw Error('Hai link không được trỏ cùng một tab.');
  const [source,target]=await Promise.all([read(c.source,'Sheet nộp bài'),read(c.target,'Sheet điểm danh')]);
  const sc=column(source,c.sourceColumn,c.sourceHeader),tc=column(target,c.targetColumn,c.targetHeader),zc=zoomColumn(target,tc,c.zoomColumn),zoom=c.zoomValue||'52';
  const entries=extract(source,sc),roster=zoomRoster(target,tc,zc,zoom);
  if(!roster.size)throw Error(`Không có SBD thuộc Zoom ${zoom}. Kiểm tra cột ZOOM và tab điểm danh.`);
  const d=diff(entries,roster,st.seen||{},!st.initialized),nc=nameColumn(target,tc.ri,c.nameColumn||'');
  const history=submissionList(entries,target,tc,zc,zoom,nc,st.history||[],Date.now(),!st.initialized);
  let written=[],skipped=[],completed=[],writeError='',pending=0;
  if(c.autoWrite){try{
   const [ws,wt]=await Promise.all([sourceData(c.source),targetData(c.target)]);
   const wsc=column(ws,c.sourceColumn,c.sourceHeader),wtc=column(wt.rows,c.targetColumn,c.targetHeader),wzc=zoomColumn(wt.rows,wtc,c.zoomColumn),wr=zoomRoster(wt.rows,wtc,wzc,zoom),dc=submitColumn(wt.rows,wtc.ri,c.submitColumn||'');
   if(dc===wzc||dc===nameColumn(wt.rows,wtc.ri,c.nameColumn||''))throw Error('Cột Nộp Bài không được trùng cột Zoom hoặc họ tên.');
   const plan=planWrites(ws,wsc,wt.rows,wtc,wt.cells,dc,Number(c.target.gid),wr);skipped=plan.skipped;completed=plan.completed;
   if(plan.operations.length){
    const fresh=await targetData(c.target);
    if(!sameTarget(wt,fresh))throw Error('Sheet điểm danh vừa đổi trong lúc đối chiếu; sẽ thử ghi lại lần sau.');
    const selected=plan.operations.slice(0,40);
    await api(c.target.id,':batchUpdate',{method:'POST',body:JSON.stringify({requests:selected.map(x=>x.request)})});
    written=selected;completed=completed.concat(written);pending=plan.operations.length-selected.length;
   }
  }catch(e){writeError=e.message;}}
  for(const h of history){
   const done=completed.find(x=>x.sbd===h.sbd&&x.sourceRow===h.row);
   const skip=skipped.find(x=>x.sbd===h.sbd);
   h.action=done?'Đã điền x + ghi chú':skip?'Cần kiểm tra: '+skip.reason:c.autoWrite?(writeError?'Chưa ghi: '+writeError:'Chờ cập nhật / lượt nộp trước'):'Chưa bật tự ghi';
   if(done)h.targetRow=done.targetRow;
  }
  const alerts=d.fresh.map(x=>({...x,name:history.find(h=>h.sbd===x.sbd)?.name||''}));
  const message=writeError?`Vẫn theo dõi Zoom ${zoom}; chưa tự ghi được: ${writeError}`:c.autoWrite?`Zoom ${zoom} · Tự ghi: lần này ${written.length} ô · ${pending} ô chờ · ${skipped.length} SBD cần kiểm tra`:`Đang theo dõi Zoom ${zoom} · Chưa bật tự ghi`;
  await chrome.storage.local.set({seen:d.seen,initialized:true,history,skipped,status:{ok:!writeError,at:Date.now(),sourceCount:entries.length,targetCount:roster.size,zoom,message,nameWarning:nc<0?'Chưa tìm được cột họ tên; chọn cột thủ công.':''}});
  await chrome.action.setBadgeText({text:writeError?'!':''});if(writeError)await chrome.action.setBadgeBackgroundColor({color:'#bd3030'});
  if(alerts.length)await notify(alerts,c);
 }catch(e){const {status:prev}=await chrome.storage.local.get('status');await chrome.storage.local.set({status:{...prev,ok:false,at:Date.now(),message:e.message}});await chrome.action.setBadgeText({text:'!'});}
 finally{busy=false;}
}
async function alarm(){if(!await chrome.alarms.get('poll'))await chrome.alarms.create('poll',{periodInMinutes:0.5});}
chrome.runtime.onInstalled.addListener(alarm);chrome.runtime.onStartup.addListener(alarm);chrome.alarms.onAlarm.addListener(a=>{if(a.name==='poll')check();});
chrome.action.onClicked.addListener(async()=>{const url=chrome.runtime.getURL('monitor.html');const tabs=await chrome.tabs.query({url});if(tabs.length)await chrome.tabs.update(tabs[0].id,{active:true});else await chrome.tabs.create({url});});
chrome.notifications.onClicked.addListener(async()=>{const {config}=await chrome.storage.local.get('config');if(config)chrome.tabs.create({url:config.source.url});});
chrome.runtime.onMessage.addListener((m,s,respond)=>{if(s.id!==chrome.runtime.id||s.tab&&!s.url?.startsWith(chrome.runtime.getURL('')))return;if(m.type==='auth'){token(true).then(()=>respond({ok:true}),e=>respond({error:e.message}));return true;}if(m.type==='pause'){(async()=>{if(busy)throw Error('Đang xử lý; thử lại sau vài giây.');const {config}=await chrome.storage.local.get('config');if(config){config.enabled=!config.enabled;await chrome.storage.local.set({config});}return {ok:true};})().then(respond,e=>respond({error:e.message}));return true;}if(m.type==='check'){check(m.force).then(()=>respond({ok:true}));return true;}if(m.type==='save'){(async()=>{if(busy)throw Error('Đang kiểm tra dữ liệu, thử lưu lại sau vài giây.');busy=true;try{const x=m.config;const c={source:sheetLink(x.sourceURL),target:sheetLink(x.targetURL),sourceColumn:x.sourceColumn.trim(),targetColumn:x.targetColumn.trim(),sourceHeader:x.sourceHeader.trim(),targetHeader:x.targetHeader.trim(),autoWrite:!!x.autoWrite,submitColumn:(x.submitColumn||'').trim(),zoomColumn:x.zoomColumn.trim(),nameColumn:(x.nameColumn||'').trim(),zoomValue:zoomValue(x.zoomValue??'52'),toast:!!x.toast,enabled:true};if(c.source.id===c.target.id&&c.source.gid===c.target.gid)throw Error('Hai link không được trỏ cùng một tab.');if(!c.zoomValue)throw Error('Nhập Zoom cần theo dõi.');await chrome.storage.local.set({config:c,seen:{},initialized:false,history:[],status:{ok:true,message:'Đang kết nối…'},lastAttempt:0});await alarm();}finally{busy=false;}await check(true);return {ok:true};})().then(respond,e=>respond({error:e.message}));return true;}});
