import assert from 'node:assert/strict';
import {paginateIssues} from '../sbd-notifier-1.1.5/review.js';

const issues=Array.from({length:25},(_,index)=>({sbd:`T${String(index+1).padStart(6,'0')}`,reason:'Cần kiểm tra'}));
const first=paginateIssues(issues);
assert.equal(first.items.length,10);assert.equal(first.page,0);assert.equal(first.pageCount,3);assert.equal(first.total,25);
const last=paginateIssues(issues,'',2);
assert.equal(last.items.length,5);assert.equal(last.items[0].sbd,'T000021');
const search=paginateIssues(issues,'t000012',4);
assert.equal(search.total,1);assert.equal(search.page,0);assert.equal(search.items[0].sbd,'T000012');
console.log('review pagination tests: PASS');
