
import {norm,sbd} from './core.js';
import {resolveSubmissions} from './matcher.js';
export function submitColumn(rows,headerRow,override='') {
 if(override){let i=0;if(!/^[A-Z]+$/i.test(override.trim()))throw Error('Cột Nộp bài phải là chữ, ví dụ E.');for(const c of override.trim().toUpperCase())i=i*26+c.charCodeAt(0)-64;i--;if(i>=rows[headerRow].length)throw Error('Cột Nộp bài nằm ngoài dữ liệu.');return i;}
 const cols=[];rows[headerRow].forEach((v,i)=>{if(['nop bai','submitted','submission','bai nop'].includes(norm(v)))cols.push(i);});if(cols.length!==1)throw Error('Không xác định được duy nhất cột Nộp bài. Hãy chọn cột thủ công.');return cols[0];
}
export function appendWrongSbd(value){const text=String(value??'');if(/(?:^|\s)sai sbd(?:\s|$)/i.test(text))return text;return text+(text&&!text.endsWith('\n')?'\n':'')+'sai sbd';}
export function planWrites(sourceRows,sourceCol,targetRows,targetCol,cells,submitCol,sheetId,allowedRoster=null,options=null){
 if(submitCol===targetCol.ci)throw Error('Cột Nộp bài không được trùng cột SBD.');
 let entries,skipped=[],identityCols=[];
 if(options){const resolution=resolveSubmissions(sourceRows,sourceCol,targetRows,targetCol,options.zoomCi,options.zoomValue,options.config);entries=resolution.entries;skipped=[...resolution.issues];identityCols=Object.values(resolution.targetColumns).filter(i=>i>=0);}
 else{const dest=new Map();for(let i=targetCol.ri+1;i<targetRows.length;i++){const id=sbd(targetRows[i][targetCol.ci]);if(id){if(!dest.has(id))dest.set(id,[]);dest.get(id).push(i);}}entries=[];for(let i=sourceCol.ri+1;i<sourceRows.length;i++){const id=sbd(sourceRows[i][sourceCol.ci]),indexes=dest.get(id);if(!id||allowedRoster&&!allowedRoster.has(id)||!indexes)continue;if(indexes.length!==1){skipped.push({sbd:id,reason:'SBD trùng nhiều dòng điểm danh'});continue;}entries.push({sbd:id,sourceSbd:id,matchMethod:'sbd',targetIndex:indexes[0],values:sourceRows[i],row:i+1,time:sourceCol.ti>=0?String(sourceRows[i][sourceCol.ti]??''):''});}}
 if(identityCols.includes(submitCol))throw Error('Cột Nộp Bài không được trùng cột thông tin thí sinh.');
 const latest=new Map();for(const entry of entries)latest.set(entry.sbd,entry);
 const operations=[],completed=[];for(const [id,submission]of latest){if(allowedRoster&&!allowedRoster.has(id))continue;
 const ri=submission.targetIndex,cell=cells[ri]?.[submitCol]||{},value=String(targetRows[ri]?.[submitCol]??'').trim(),note=String(cell.note||'');
 const vals=[...submission.values];while(vals.length&&String(vals.at(-1)??'')==='')vals.pop();const content=vals.map(v=>String(v??'')).join('\t');if(!content.trim())continue;
 const info={sbd:id,sourceSbd:submission.sourceSbd,matchMethod:submission.matchMethod,targetRow:ri+1,sourceRow:submission.row,time:submission.time,wrongSbd:submission.matchMethod==='identity'};
 if(cell.userEnteredValue?.formulaValue){skipped.push({...info,reason:'Ô Nộp bài có công thức'});continue;}
 if(note&&!(value.toLowerCase()==='x'&&note===content)){skipped.push({...info,reason:'Giữ ghi chú đã có; không ghi đè'});continue;}
 if(value&&value.toLowerCase()!=='x'){skipped.push({...info,reason:'Ô Nộp bài có giá trị khác x'});continue;}
 if(cell.dataValidation){skipped.push({...info,reason:'Ô có checkbox/kiểm tra dữ liệu, cần xử lý thủ công'});continue;}
 const requests=[];
 if(!note)requests.push({updateCells:{start:{sheetId,rowIndex:ri,columnIndex:submitCol},rows:[{values:[{userEnteredValue:{stringValue:'x'},note:content}]}],fields:'userEnteredValue,note'}});
 if(info.wrongSbd){const remarkCi=submitCol+1,remark=cells[ri]?.[remarkCi]||{};if(remarkCi===targetCol.ci||remarkCi===options.zoomCi||identityCols.includes(remarkCi)){skipped.push({...info,reason:'Cột bên phải Nộp Bài trùng cột thông tin; kiểm tra cấu hình'});continue;}if(remark.userEnteredValue?.formulaValue||remark.dataValidation){skipped.push({...info,reason:'Ô Ghi chú có công thức/kiểm tra dữ liệu; không tự nối chữ'});continue;}const old=String(targetRows[ri]?.[remarkCi]??''),next=appendWrongSbd(old);if(next!==old)requests.push({updateCells:{start:{sheetId,rowIndex:ri,columnIndex:remarkCi},rows:[{values:[{userEnteredValue:{stringValue:next}}]}],fields:'userEnteredValue'}});}
 if(requests.length)operations.push({...info,requests});else completed.push(info);
 }return {operations,skipped,completed};
}
export function sameTarget(a,b){return JSON.stringify(a)===JSON.stringify(b);}
