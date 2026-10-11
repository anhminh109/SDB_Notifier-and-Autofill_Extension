import {paginateIssues} from './review.js';

const host=document.getElementById('skipped');
const controls=document.createElement('div');
controls.className='review-controls';
const search=document.createElement('input');
search.type='search';search.placeholder='Tìm SBD…';search.setAttribute('aria-label','Tìm SBD cần kiểm tra');
const pager=document.createElement('div');pager.className='review-pager';
const previous=document.createElement('button');previous.type='button';previous.className='secondary';previous.textContent='← Trước';
const status=document.createElement('span');
const next=document.createElement('button');next.type='button';next.className='secondary';next.textContent='Sau →';
pager.append(previous,status,next);controls.append(search,pager);host.before(controls);

let issues=[],page=0,painting=false;
const observer=new MutationObserver(()=>{if(!painting)queueMicrotask(refresh);});
observer.observe(host,{childList:true});

function paint(){
 const result=paginateIssues(issues,search.value,page);page=result.page;painting=true;observer.disconnect();host.replaceChildren();
 if(!result.items.length)host.textContent=search.value.trim()?'Không tìm thấy SBD.':'Chưa có.';
 for(const item of result.items){const row=document.createElement('p');row.textContent=`${item.sbd||item.sourceSbd||'(trống)'} — ${item.reason}`;host.append(row);}
 status.textContent=`Trang ${result.page+1}/${result.pageCount} · ${result.total} SBD`;
 previous.disabled=result.page===0;next.disabled=result.page>=result.pageCount-1;pager.hidden=result.total<=10;
 observer.observe(host,{childList:true});painting=false;
}

async function refresh(){issues=(await chrome.storage.local.get('skipped')).skipped||[];paint();}
search.addEventListener('input',()=>{page=0;paint();});
previous.addEventListener('click',()=>{page--;paint();});
next.addEventListener('click',()=>{page++;paint();});
chrome.storage.onChanged.addListener(changes=>{if(changes.skipped)refresh();});
await refresh();
