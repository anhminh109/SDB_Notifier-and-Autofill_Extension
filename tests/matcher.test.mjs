import assert from 'node:assert/strict';
import {resolveSubmissions} from '../sbd-notifier-1.1.5/matcher.js';
import {appendWrongSbd,planWrites} from '../sbd-notifier-1.1.5/writer.js';

const source=[
 ['SBD','Họ và tên','Giới tính','Ngày sinh','Trường','Tỉnh','Timestamp'],
 ['SAI001','Nguyễn Văn An','Nam','06/12/2019','Tiểu học A','Hà Nội','10:00'],
 ['OK002','Trần Thị Bình','Nữ','2018','Tiểu học B','Đà Nẵng','10:01']
];
const target=[
 ['ZOOM','SBD','Họ tên','Giới tính','Năm sinh','Trường học','Tỉnh/Thành phố','Nộp Bài','Ghi chú'],
 ['52','DUNG001','Nguyen Van An','male','2019','Tieu hoc A','Ha Noi','','đã kiểm tra'],
 ['52','OK002','Trần Thị Bình','Nữ','01.01.2018','Tiểu học B','Đà Nẵng','','']
];
const sourceCol={ri:0,ci:0,ti:6},targetCol={ri:0,ci:1};
const resolution=resolveSubmissions(source,sourceCol,target,targetCol,0,'52',{sourceIdentity:{name:'Z'},targetIdentity:{name:'Y'}});
assert.equal(resolution.entries.length,2);
assert.equal(resolution.entries[0].sbd,'DUNG001');
assert.equal(resolution.entries[0].matchMethod,'identity');
assert.equal(resolution.entries[1].matchMethod,'sbd');
assert.equal(appendWrongSbd('đã kiểm tra'),'đã kiểm tra\nsai sbd');
assert.equal(appendWrongSbd('đã kiểm tra\nsai sbd'),'đã kiểm tra\nsai sbd');

const cells=target.map(row=>row.map(value=>({formattedValue:value,userEnteredValue:value?{stringValue:value}:undefined})));
const plan=planWrites(source,sourceCol,target,targetCol,cells,7,123,null,{zoomCi:0,zoomValue:'52',config:{}});
assert.equal(plan.operations.length,2);
assert.equal(plan.operations[0].wrongSbd,true);
assert.equal(plan.operations[0].requests.length,2);
assert.equal(plan.operations[0].requests[1].updateCells.rows[0].values[0].userEnteredValue.stringValue,'đã kiểm tra\nsai sbd');

const ambiguous=[...target,['52','DUNG999','Nguyễn Văn An','Nam','2019','Tiểu học A','Hà Nội','','']];
const ambiguousResult=resolveSubmissions(source,sourceCol,ambiguous,targetCol,0,'52',{});
assert.equal(ambiguousResult.entries.length,1);
assert.match(ambiguousResult.issues[0].reason,/nhiều thí sinh/);

const targetWithoutGender=target.map(row=>row.filter((_,index)=>index!==3));
const withoutGenderCol={ri:0,ci:1};
const withoutGender=resolveSubmissions(source,sourceCol,targetWithoutGender,withoutGenderCol,0,'52',{});
assert.equal(withoutGender.entries.length,2);
assert.equal(withoutGender.entries[0].sbd,'DUNG001');
assert.deepEqual(withoutGender.compareFields,['name','birth','school','province']);

console.log('matcher tests: PASS');
