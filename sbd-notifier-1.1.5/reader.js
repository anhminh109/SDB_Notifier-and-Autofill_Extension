import {csv} from './core.js';

export function endpoints(link, account='') {
 const base=`https://docs.google.com/spreadsheets/d/${link.id}`;
 const q=new URLSearchParams({gid:link.gid, _:String(Date.now())});
 if(account) q.set('authuser',account);
 return [`${base}/gviz/tq?${q}&tqx=out:csv&headers=0`, `${base}/export?${q}&format=csv`];
}

export function decode(result) {
 if(!result || !result.ok || /text\/html/i.test(result.type||'') || /^\s*(?:<!doctype|<html)/i.test(result.text||'')) {
  throw Error(`Google không trả CSV (HTTP ${result?.status||'không rõ'}).`);
 }
 if(/^\s*(?:<|\{)|google\.visualization\.Query/i.test(result.text||'')) throw Error('Google trả dữ liệu khác CSV.');
 const rows=csv(result.text||'');
 if(!rows.length) throw Error('Google trả dữ liệu trống.');
 return rows;
}

// Serialized by Chrome: all dependencies must live inside this function.
export async function pageRead(urls) {
 const errors=[];
 for(const url of urls) {
  try {
   const r=await fetch(url,{credentials:'include',cache:'no-store',signal:AbortSignal.timeout(12000)});
   const text=await r.text(),type=r.headers.get('content-type')||'';
   if(r.ok && !/text\/html/i.test(type) && !/^\s*(?:<!doctype|<html|<|\{)|google\.visualization\.Query/i.test(text) && text.trim())
    return {ok:true,status:r.status,type,text};
   errors.push(`HTTP ${r.status}${/text\/html/i.test(type)?' · trang đăng nhập/quyền truy cập':''}`);
  }catch(e){errors.push(e.name==='TimeoutError'?'Hết thời gian chờ':e.message);}
 }
 return {ok:false,error:errors.join('; ')};
}

export async function readSheet(link,label) {
 const errors=[];
 const tabs=await chrome.tabs.query({url:`https://docs.google.com/spreadsheets/d/${link.id}/*`});
 for(const tab of tabs) {
  try {
   const u=new URL(tab.url),account=u.searchParams.get('authuser')||link.authuser||'';
   const results=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:pageRead,args:[endpoints(link,account)]});
   const result=results[0]?.result;
   if(result?.ok)return decode(result);
   errors.push(result?.error||'Không đọc được qua tab sheet.');
  }catch(e){errors.push(e.message);}
 }
 const result=await pageRead(endpoints(link,link.authuser||''));
 if(result.ok)return decode(result);
 errors.push(result.error);
 throw Error(`${label}: Không đọc được dữ liệu. Mở đúng sheet trong Chrome bằng tài khoản có quyền xem, giữ tab đó mở rồi bấm Kiểm tra ngay. Nếu vẫn lỗi, kiểm tra quyền tải xuống của sheet. Chi tiết: ${errors.join(' | ')}`);
}
