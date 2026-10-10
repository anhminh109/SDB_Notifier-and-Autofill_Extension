
import {norm,sbd,column} from './core.js';
export function submitColumn(rows,headerRow,override='') {
 if(override){let i=0;if(!/^[A-Z]+$/i.test(override.trim()))throw Error('Cột Nộp bài phải là chữ, ví dụ E.');for(const c of override.trim().toUpperCase())i=i*26+c.charCodeAt(0)-64;i--;if(i>=rows[headerRow].length)throw Error('Cột Nộp bài nằm ngoài dữ liệu.');return i;}
 const cols=[];rows[headerRow].forEach((v,i)=>{if(['nop bai','submitted','submission','bai nop'].includes(norm(v)))cols.push(i);});if(cols.length!==1)throw Error('Không xác định được duy nhất cột Nộp bài. Hãy chọn cột thủ công.');return cols[0];
}
export function planWrites(sourceRows,sourceCol,targetRows,targetCol,cells,submitCol,sheetId,allowedRoster=null){
 if(submitCol===targetCol.ci)throw Error('Cột Nộp bài không được trùng cột SBD.');
 const latest=new Map();for(let i=sourceCol.ri+1;i<sourceRows.length;i++){const id=sbd(sourceRows[i][sourceCol.ci]);if(id)latest.set(id,{values:sourceRows[i],row:i+1,time:sourceCol.ti>=0?String(sourceRows[i][sourceCol.ti]??''):''});}
 const dest=new Map();for(let i=targetCol.ri+1;i<targetRows.length;i++){const id=sbd(targetRows[i][targetCol.ci]);if(id){if(!dest.has(id))dest.set(id,[]);dest.get(id).push(i);}}
 const operations=[],skipped=[],completed=[];for(const [id,submission]of latest){if(allowedRoster&&!allowedRoster.has(id))continue;const indexes=dest.get(id);if(!indexes)continue;if(indexes.length!==1){skipped.push({sbd:id,reason:'SBD trùng nhiều dòng điểm danh'});continue;}
 const ri=indexes[0],cell=cells[ri]?.[submitCol]||{},value=String(targetRows[ri]?.[submitCol]??'').trim(),note=String(cell.note||'');
 const vals=[...submission.values];while(vals.length&&String(vals.at(-1)??'')==='')vals.pop();const content=vals.map(v=>String(v??'')).join('\t');if(!content.trim())continue;
 if(cell.userEnteredValue?.formulaValue){skipped.push({sbd:id,reason:'Ô Nộp bài có công thức'});continue;}
 if(note){if(value.toLowerCase()==='x'&&note===content)completed.push({sbd:id,sourceRow:submission.row,targetRow:ri+1});else skipped.push({sbd:id,reason:'Giữ ghi chú đã có; không ghi đè'});continue;}
 if(value&&value.toLowerCase()!=='x'){skipped.push({sbd:id,reason:'Ô Nộp bài có giá trị khác x'});continue;}
 if(cell.dataValidation){skipped.push({sbd:id,reason:'Ô có checkbox/kiểm tra dữ liệu, cần xử lý thủ công'});continue;}
 operations.push({sbd:id,targetRow:ri+1,sourceRow:submission.row,time:submission.time,request:{updateCells:{start:{sheetId,rowIndex:ri,columnIndex:submitCol},rows:[{values:[{userEnteredValue:{stringValue:'x'},note:content}]}],fields:'userEnteredValue,note'}}});
 }return {operations,skipped,completed};
}
export function sameTarget(a,b){return JSON.stringify(a)===JSON.stringify(b);}
