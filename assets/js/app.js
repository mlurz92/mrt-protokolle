/* Application renderer. Requires data/protocol-database.js to be loaded before this file. */
const DATA = window.MYEXAM_PROTOCOL_DATABASE;
if (!DATA) { throw new Error('MYEXAM_PROTOCOL_DATABASE wurde nicht geladen.'); }

const protocols=DATA.protocols;
const specs=DATA.specs;
const byPath=Object.fromEntries(protocols.map(p=>[p.path,p]));
let selectedPath=protocols[0].path;
let openFolders=new Set(['Kopf','Kopf > Standard','Wirbelsäule','Wirbelsäule > HWS']);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function norm(s){return String(s??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function textOfBlocks(blocks){let out=[];(blocks||[]).forEach(b=>{out.push(b.name,b.text,b.q,b.default,b.title,b.label,b.time,b.pill,b.badge,b.note); if(b.cols) b.cols.forEach(c=>{out.push(c.label);out.push(textOfBlocks(c.blocks));});});return out.filter(Boolean).join(' ');}
function searchable(p){const s=specs[p.path]||{};return norm([p.path,p.name,p.group,p.source,p.notes,s.title,s.photo,s.notes,textOfBlocks((s.lanes||[]).flatMap(l=>l.blocks||[])),textOfBlocks(s.blocks||[])].join(' '));}
function buildTree(){
 const root={name:'FLEET',path:'',children:new Map(),item:null};
 protocols.forEach(p=>{let node=root; const parts=p.path.split(' > '); parts.forEach((part,i)=>{const full=parts.slice(0,i+1).join(' > '); if(!node.children.has(part)) node.children.set(part,{name:part,path:full,children:new Map(),item:null}); node=node.children.get(part); if(i===parts.length-1) node.item=p;});});
 return root;
}
const treeRoot=buildTree();
function branchMatches(node,q){
 if(!q) return true;
 if(node.item) return searchable(node.item).includes(q);
 for(const child of node.children.values()) if(branchMatches(child,q)) return true;
 return norm(node.name).includes(q);
}
function renderTree(){
 const q=norm(document.getElementById('search').value.trim());
 let hits=0;
 const html=[];
 function rec(node,level){
   for(const child of node.children.values()){
     const isItem=!!child.item; const match=branchMatches(child,q); if(!match) continue;
     const direct=q && (isItem?searchable(child.item).includes(q):norm(child.name).includes(q));
     const open=q || openFolders.has(child.path) || child.path===selectedPath || selectedPath.startsWith(child.path+' > ');
     if(isItem){hits++; html.push(`<div class="node item ${child.path===selectedPath?'selected ':''}${direct?'search-hit ':''}" style="--level:${level}" data-path="${esc(child.path)}">${esc(child.name)}</div>`);}
     else {html.push(`<div class="node folder ${open?'open ':''}${direct?'search-hit ':''}" style="--level:${level}" data-folder="${esc(child.path)}">${esc(child.name)}</div>`); if(open) rec(child,level+1);}
   }
 }
 rec(treeRoot,0);
 document.getElementById('tree').innerHTML=html.length?html.join(''):`<div class="no-results">Keine Treffer.<br>Suchbegriff prüfen oder zurücksetzen.</div>`;
 document.getElementById('searchCount').textContent=q?String(hits):String(protocols.length);
 document.querySelectorAll('.node.folder').forEach(el=>el.onclick=()=>{const p=el.dataset.folder; if(openFolders.has(p)) openFolders.delete(p); else openFolders.add(p); renderTree();});
 document.querySelectorAll('.node.item').forEach(el=>el.onclick=()=>{selectedPath=el.dataset.path; document.querySelectorAll('.node.item.selected').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); renderProgram();});
}
function fallbackSpec(p){
 const laneMap=new Map(); (p.rows||[]).forEach(r=>{const br=r[1]||p.name;if(!laneMap.has(br)) laneMap.set(br,[]); laneMap.get(br).push(rowFromArray(r));});
 if(laneMap.size>1) return {width:Math.min(1350,Math.max(360,laneMap.size*320)),layout:'lanes',title:p.name,lanes:[...laneMap.entries()].map(([title,blocks],i)=>({title,check:i===0,blocks}))};
 return {width:360,layout:'single',title:p.name,blocks:(p.rows||[]).map(rowFromArray)};
}
function rowFromArray(a){const [pos,branch,name,time,kind,note]=a; let pill=''; if(['MPR Assignment','MPR Planning','Basic Decision','AutoAlign Scout','Spine Scout','Spine Positioning','Spine Verification','Generic Views','Spectroscopy','Advanced Application','Morpho'].includes(kind)) pill=kind; return {t:'row',name,time:time||'',pill,note:note||branch||''};}
function normalizeSpec(spec,p){
 if(spec.lanes) return spec;
 if(spec.blocks) return {...spec,lanes:[{title:spec.title||p.name,check:true,blocks:spec.blocks}],width:spec.width||360};
 return fallbackSpec(p);
}
function renderProgram(){
 const p=byPath[selectedPath]||protocols[0]; selectedPath=p.path;
 const s=normalizeSpec(specs[p.path],p);
 const el=document.getElementById('program');
 const lanes=s.lanes||[]; const cols=lanes.map(l=>l.weight?l.weight+'fr':'1fr').join(' ');
 el.innerHTML=`<div class="pathline">FLEET » ${esc(p.path.replaceAll(' > ',' » '))} <span class="edit">✎</span></div><div class="program-frame" style="--pw:${s.width||Math.max(360,lanes.length*300)}px"><div class="viewtabs"><span>Patient View</span><span class="active">Basic Patient View</span></div><div class="lanes" style="--cols:${cols||'1fr'}">${lanes.map(renderLane).join('')}</div></div>`;
 const st=document.getElementById('status'); st.textContent=`Es wird gemessen 00:01:24 · ${p.path} · ${lanes.length} Spalte(n)`;
 document.querySelectorAll('.row').forEach(r=>{r.onmouseenter=()=>{st.textContent=`Sequenz: ${r.dataset.name||''} · ${r.dataset.time||''} · ${r.dataset.pill||''}`;};});
}
function renderLane(l){return `<section class="lane"><div class="lane-head">${l.check?'<span class="tick">✓</span>':''}${esc(l.title||'Standard')}</div><div class="flow">${renderBlocks(l.blocks||[])}</div></section>`;}
function renderBlocks(blocks){return (blocks||[]).map(renderBlock).join('');}
function renderBlock(b){
 if(!b) return '';
 if(b.t==='spacer') return `<div class="spacer" style="height:${(b.n||1)*39}px"></div>`;
 if(b.t==='label') return `<div class="label ${b.tone==='orange'||/^[_\-]*[A-ZÄÖÜa-zäöü].*\?$/.test(b.text||'')?'':'orange'}">${esc(b.text||'')}</div>`;
 if(b.t==='decision') return renderDecision(b);
 return renderRow(b);
}
function renderRow(b){const blank=!b.name; const pill=b.pill?`<span class="pill">${esc(b.pill)}</span>`:''; const badge=b.badge?`<span class="badge">${esc(b.badge)}</span>`:''; const name=blank?'·':esc(b.name); return `<div class="row ${blank?'blank':''}" data-name="${esc(b.name||'')}" data-time="${esc(b.time||'')}" data-pill="${esc(b.pill||'')}"><div class="rname">${name}</div>${b.time?`<div class="rtime">${esc(b.time)}</div>`:''}<div class="ricons"><span>♟</span>${badge}</div>${pill}</div>`;}
function renderDecision(d){
 const cols=d.cols||[]; const q=`<div class="decision-q"><div class="qtext">${esc(d.q||'Decision')}</div><span class="dropdown">${esc(d.default||'Nein')}</span><span class="pill">Basic Decision</span></div>`;
 const title=`<div class="decision-title">${esc(d.title||d.q||'Decision')}</div>`;
 const grid=cols.length?`<div class="branch-grid" style="--bcols:${cols.length}">${cols.map(c=>`<div class="branch"><div class="branch-head">${esc(c.label||'')}</div>${renderBlocks(c.blocks||[])}</div>`).join('')}</div>`:'';
 return q+title+grid;
}
document.getElementById('search').addEventListener('input',renderTree);
document.getElementById('search').addEventListener('keydown',e=>{if(e.key==='Enter'){const first=document.querySelector('.node.item'); if(first) first.click();}});
document.getElementById('clear').addEventListener('click',()=>{document.getElementById('search').value='';renderTree();document.getElementById('search').focus();});
renderTree(); renderProgram();
