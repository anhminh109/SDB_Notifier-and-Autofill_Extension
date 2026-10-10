
export const norm = s => String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').trim().toLowerCase().replace(/\s+/g,' ');
export const sbd = s => String(s??'').normalize('NFKC').trim().toUpperCase();
export function csv(text) {
 const rows=[];let row=[],cell='',quote=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){cell+='"';i++;}else if(quote||!cell)quote=!quote;else cell+=c;}else if(c===','&&!quote){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}
 if(quote)throw Error('CSV bị thiếu dấu đóng ngoặc kép.');
 if(cell||row.length){row.push(cell);rows.push(row);}if(rows[0]?.[0])rows[0][0]=rows[0][0].replace(/^\uFEFF/,'');return rows;
}
export function sheetLink(raw){let u;try{u=new URL(raw);}catch{throw Error('Link sheet không hợp lệ.');}const m=u.pathname.match(/^\/spreadsheets\/d\/([A-Za-z0-9_-]+)\//);if(u.protocol!=='https:'||u.hostname!=='docs.google.com'||!m)throw Error('Cần link Google Sheets dạng docs.google.com/spreadsheets/d/.../edit#gid=...');const gid=new URLSearchParams(u.hash.slice(1)).get('gid')||u.searchParams.get('gid');if(!gid||!/^\d+$/.test(gid))throw Error('Link thiếu gid. Hãy mở đúng tab bên dưới sheet rồi copy link trên thanh địa chỉ.');return {id:m[1],gid,authuser:u.searchParams.get('authuser')||'',url:`https://docs.google.com/spreadsheets/d/${m[1]}/edit${u.searchParams.get('authuser')?'?authuser='+encodeURIComponent(u.searchParams.get('authuser')):''}#gid=${gid}`};}
const aliases=new Set(['sbd','so bao danh','candidate number','candidate number (so bao danh)','candidate number / so bao danh']);
export function column(rows, override='', header=''){
 let ri=header?Number(header)-1:null; if(ri!==null&&(!Number.isInteger(ri)||ri<0||ri>=rows.length))throw Error('Dòng tiêu đề không hợp lệ.');
 let ci=null;if(override){if(!/^[A-Z]+$/i.test(override.trim()))throw Error('Cột thủ công phải là chữ, ví dụ H.');ci=0;for(const c of override.trim().toUpperCase())ci=ci*26+c.charCodeAt(0)-64;ci--;}
 const found=[];for(let r=0;r<Math.min(rows.length,50);r++){if(ri!==null&&r!==ri)continue;rows[r].forEach((v,c)=>{if(aliases.has(norm(v)))found.push({r,c});});}
 if(ci===null){if(found.length!==1)throw Error(found.length?'Có nhiều cột SBD. Nhập cột và dòng tiêu đề thủ công.':'Không tìm thấy tiêu đề SBD trong 50 dòng đầu. Nhập cột và dòng tiêu đề thủ công.');ci=found[0].c;ri=found[0].r;}
 else if(ri===null){const f=found.filter(x=>x.c===ci);if(f.length!==1)throw Error('Khi chọn cột thủ công, hãy nhập thêm dòng tiêu đề.');ri=f[0].r;}
 if(ci>=rows[ri].length)throw Error('Cột SBD vượt quá số cột của sheet.');
 const times=rows[ri].map(norm);const ti=times.findIndex(v=>['dau thoi gian','timestamp','thoi gian nop','submission time'].includes(v));
 return {ri,ci,ti};
}
export function extract(rows,col){return rows.slice(col.ri+1).map((r,i)=>({sbd:sbd(r[col.ci]),time:col.ti>=0?String(r[col.ti]??'').trim():'',row:col.ri+2+i})).filter(r=>r.sbd);}
export function diff(entries, roster, seen={}, baseline=false){const counts=Object.create(null),fresh=[];for(const r of entries){const k=JSON.stringify([r.sbd,r.time]);counts[k]=(counts[k]||0)+1;if(!baseline&&counts[k]>(seen[k]||0)&&roster.has(r.sbd))fresh.push(r);}const next={...seen};for(const [k,v]of Object.entries(counts))next[k]=Math.max(next[k]||0,v);return {seen:next,fresh};}

export function zoomColumn(rows,col,override=''){
 let ci;if(override){if(!/^[A-Z]+$/i.test(override.trim()))throw Error('Cột Zoom thủ công phải là chữ, ví dụ B.');ci=0;for(const c of override.trim().toUpperCase())ci=ci*26+c.charCodeAt(0)-64;ci--;}else{const found=[];rows[col.ri].forEach((v,i)=>{if(norm(v)==='zoom')found.push(i);});if(found.length!==1)throw Error('Không xác định được duy nhất cột ZOOM. Chọn cột Zoom thủ công.');ci=found[0];}
 if(ci===col.ci)throw Error('Cột Zoom không được trùng cột SBD.');if(ci>=rows[col.ri].length)throw Error('Cột Zoom nằm ngoài dữ liệu sheet.');return ci;
}
export function zoomValue(value){
 const x=norm(String(value??'').normalize('NFKC')).replace(/^zoom\s*[:#-]?\s*/, '').trim();
 return /^\d+$/.test(x)?x.replace(/^0+(?=\d)/,''):x;
}
export function isZoom52(value){return zoomValue(value)==='52';}
export function zoomRoster(rows,col,zoomCi,wanted='52'){const z=zoomValue(wanted);if(!z)throw Error('Nhập Zoom cần theo dõi.');return new Set(rows.slice(col.ri+1).filter(r=>zoomValue(r[zoomCi])===z).map(r=>sbd(r[col.ci])).filter(Boolean));}
