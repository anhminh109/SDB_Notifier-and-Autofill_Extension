export function paginateIssues(items,query='',page=0,pageSize=10){
 const needle=String(query).trim().toUpperCase();
 const filtered=needle?items.filter(item=>[item.sbd,item.sourceSbd].some(value=>String(value??'').toUpperCase().includes(needle))):[...items];
 const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));
 const currentPage=Math.min(Math.max(0,Number(page)||0),pageCount-1);
 return {items:filtered.slice(currentPage*pageSize,(currentPage+1)*pageSize),total:filtered.length,page:currentPage,pageCount};
}
