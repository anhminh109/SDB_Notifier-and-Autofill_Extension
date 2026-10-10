import {norm,sbd,zoomValue} from './core.js';
export function nameColumn(rows,header,override='') {
 if(override.trim()) {
  if(!/^[A-Z]+$/i.test(override.trim()))throw Error('Cột tên phải là chữ, ví dụ D.');
  let ci=0;for(const c of override.trim().toUpperCase())ci=ci*26+c.charCodeAt(0)-64;
  if(ci>rows[header].length)throw Error('Cột tên nằm ngoài dữ liệu.');
  return ci-1;
 }
 const aliases=new Set(['ho va ten','ho ten','ten thi sinh','ho va ten thi sinh','ho ten thi sinh','full name','candidate name','candidate full name','name','ten']);
 const matches=[];rows[header].forEach((v,i)=>{const n=norm(v).replace(/[:*]/g,'').trim();if(aliases.has(n)||/^(?:full name|candidate name)\s*\((?:ho va ten|ho ten)\)$/.test(n))matches.push(i);});
 return matches.length===1?matches[0]:-1;
}
export function submissionList(entries,rows,col,zoomCi,wanted,nameCi,previous=[],now=Date.now(),initial=false){
 const names=new Map();
 for(const r of rows.slice(col.ri+1))if(zoomValue(r[zoomCi])===zoomValue(wanted)){
  const id=sbd(r[col.ci]),name=nameCi>=0?String(r[nameCi]??'').trim():'';
  if(id){if(!names.has(id))names.set(id,new Set());if(name)names.get(id).add(name);}
 }
 const key=x=>JSON.stringify([x.sbd,x.time,x.row]);
 const old=new Map(previous.map(x=>[key(x),x]));
 return entries.filter(x=>names.has(x.sbd)).map(x=>{
  const before=old.get(key(x)),ns=[...names.get(x.sbd)];
  return {...x,name:ns.length===1?ns[0]:'',nameAmbiguous:ns.length>1,detected:before?.detected||now,existing:before?.existing??initial};
 }).reverse();
}
