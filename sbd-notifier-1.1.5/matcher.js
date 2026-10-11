import {norm,sbd,zoomValue} from './core.js';

export const identityFields=['name','gender','birth','school','province'];
const requiredIdentityFields=['name','birth','school','province'];

const aliases={
 name:['ho va ten','ho ten','ten thi sinh','ho va ten thi sinh','ho ten thi sinh','full name','full name ho va ten thi sinh','candidate name','candidate full name','name','ten'],
 gender:['gioi tinh','gender','gender gioi tinh','sex'],
 birth:['ngay sinh','ngay thang nam sinh','nam sinh','date of birth','date of birth ngay thang nam sinh','birth date','birth year','dob'],
 school:['truong','truong hoc','ten truong','school','school truong','school name'],
 province:['tinh','tinh thanh','tinh thanh pho','province','province tinh','city','province city']
};

function columnIndex(value,label){
 const text=String(value??'').trim();if(!text)return -1;
 if(!/^[A-Z]+$/i.test(text))throw Error(`Cột ${label} phải là chữ, ví dụ D.`);
 let index=0;for(const char of text.toUpperCase())index=index*26+char.charCodeAt(0)-64;
 return index-1;
}

function normalizedHeader(value){return norm(value).replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}

export function identityColumn(rows,header,field,override=''){
 const manual=columnIndex(override,aliases[field]?.[0]||field);
 if(manual>=0){if(manual>=rows[header].length)throw Error(`Cột ${aliases[field][0]} nằm ngoài dữ liệu.`);return manual;}
 const accepted=new Set(aliases[field]);
 const found=[];rows[header].forEach((value,index)=>{if(accepted.has(normalizedHeader(value)))found.push(index);});
 return found.length===1?found[0]:-1;
}

export function identityColumns(rows,header){
 return Object.fromEntries(identityFields.map(field=>[field,identityColumn(rows,header,field)]));
}

function year(value){
 const text=String(value??'').normalize('NFKC').trim();if(!text)return '';
 const match=text.match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/);return match?.[1]||'';
}

function gender(value){
 const text=norm(value).replace(/[^a-z0-9]+/g,' ').trim();
 if(['nam','male','m','boy'].includes(text))return 'male';
 if(['nu','female','f','girl'].includes(text))return 'female';
 return text;
}

function text(value){return norm(value).replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}

export function identityValue(field,value){return field==='birth'?year(value):field==='gender'?gender(value):text(value);}

function identityOf(row,columns,fields){return fields.map(field=>identityValue(field,row[columns[field]]));}
function identityKey(values){return values.every(Boolean)?JSON.stringify(values):'';}

export function resolveSubmissions(sourceRows,sourceCol,targetRows,targetCol,zoomCi,wanted,config={}){
 const sourceColumns=identityColumns(sourceRows,sourceCol.ri);
 const targetColumns=identityColumns(targetRows,targetCol.ri);
 const missingSource=requiredIdentityFields.filter(field=>sourceColumns[field]<0);
 const missingTarget=requiredIdentityFields.filter(field=>targetColumns[field]<0);
 const missing=[...new Set([...missingSource,...missingTarget])];
 const compareFields=[...requiredIdentityFields];
 if(sourceColumns.gender>=0&&targetColumns.gender>=0)compareFields.splice(1,0,'gender');
 const warning=[
  missingSource.length?`Sheet nộp bài thiếu cột: ${missingSource.map(field=>aliases[field][0]).join(', ')}`:'',
  missingTarget.length?`Sheet điểm danh thiếu cột: ${missingTarget.map(field=>aliases[field][0]).join(', ')}`:''
 ].filter(Boolean).join(' · ');
 const wantedZoom=zoomValue(wanted),targetBySbd=new Map(),targetByIdentity=new Map();
 for(let index=targetCol.ri+1;index<targetRows.length;index++){
  const row=targetRows[index];if(zoomValue(row[zoomCi])!==wantedZoom)continue;
  const id=sbd(row[targetCol.ci]);if(id){if(!targetBySbd.has(id))targetBySbd.set(id,[]);targetBySbd.get(id).push(index);}
  if(!missing.length){const key=identityKey(identityOf(row,targetColumns,compareFields));if(key){if(!targetByIdentity.has(key))targetByIdentity.set(key,[]);targetByIdentity.get(key).push(index);}}
 }
 const entries=[],issues=[];
 for(let index=sourceCol.ri+1;index<sourceRows.length;index++){
  const row=sourceRows[index];if(!row.some(value=>String(value??'').trim()))continue;
  const sourceSbd=sbd(row[sourceCol.ci]),direct=sourceSbd?targetBySbd.get(sourceSbd):null;
  let targetIndex=-1,matchMethod='';
  if(direct?.length===1){targetIndex=direct[0];matchMethod='sbd';}
  else if(direct?.length>1){issues.push({sbd:sourceSbd,sourceSbd,sourceRow:index+1,reason:'SBD trùng nhiều dòng điểm danh'});continue;}
  else if(missing.length){issues.push({sbd:sourceSbd||'(trống)',sourceSbd,sourceRow:index+1,reason:'SBD không khớp và chưa xác định đủ cột tên, ngày sinh, trường, tỉnh'});continue;}
  else{
   const values=identityOf(row,sourceColumns,compareFields),key=identityKey(values);
   if(!key){issues.push({sbd:sourceSbd||'(trống)',sourceSbd,sourceRow:index+1,reason:'SBD không khớp và thiếu thông tin tên, ngày sinh, trường hoặc tỉnh'});continue;}
   const matches=targetByIdentity.get(key)||[];
   if(matches.length!==1){issues.push({sbd:sourceSbd||'(trống)',sourceSbd,sourceRow:index+1,reason:matches.length?'Có nhiều thí sinh trùng thông tin nhận diện':'Không tìm thấy thí sinh trùng thông tin nhận diện'});continue;}
   targetIndex=matches[0];matchMethod='identity';
  }
  const id=sbd(targetRows[targetIndex][targetCol.ci]);
  entries.push({sbd:id,sourceSbd,matchMethod,targetIndex,values:row,row:index+1,time:sourceCol.ti>=0?String(row[sourceCol.ti]??'').trim():''});
 }
 return {entries,issues,sourceColumns,targetColumns,compareFields,warning};
}
