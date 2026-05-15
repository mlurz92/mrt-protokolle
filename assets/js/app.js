'use strict';
const DATA = window.MYEXAM_PROTOCOL_DATABASE;
if (!DATA) throw new Error('MYEXAM_PROTOCOL_DATABASE wurde nicht geladen.');
const protocols = DATA.protocols;
const specs = DATA.specs;
const byPath = Object.fromEntries(protocols.map(p => [p.path, p]));
let selectedNode = { type: 'program', path: protocols[0].path };
let openFolders = new Set(['Kopf', 'Kopf > Standard', 'Wirbelsäule', 'Wirbelsäule > HWS']);
let activeView = 'patient';
const ZOOM_STEPS = [0.25,0.33,0.5,0.67,0.75,0.9,1,1.1,1.25,1.5,1.75,2,2.5,3];
let zoomLevel = 1;
const PERSON_SVG = '<svg class="seq-icon" viewBox="0 0 12 18" width="9" height="14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="6" cy="3" r="2.1" fill="currentColor"/><path d="M3.5 5.2 h5 l-0.7 5.3 H4.2 z" fill="currentColor"/></svg>';
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const splitPath = path => path ? path.split(' > ') : [];
const getParentPaths = path => { const p = splitPath(path), o=[]; for(let i=1;i<p.length;i++) o.push(p.slice(0,i).join(' > ')); return o; };
const ensurePathOpen = path => getParentPaths(path).forEach(p=>openFolders.add(p));
const formatDisplayPath = path => 'FLEET' + (path ? ' » ' + path.replace(/ > /g,' » ') : '');
const isProgramPath = path => Boolean(byPath[path]);
function applyZoom(){ const p=document.getElementById('program'); if(p) p.style.zoom=String(zoomLevel); const out=document.getElementById('zoomOut'); const zin=document.getElementById('zoomIn'); if(out) out.disabled=zoomLevel<=ZOOM_STEPS[0]; if(zin) zin.disabled=zoomLevel>=ZOOM_STEPS.at(-1); }
function zoom(delta){ const i=ZOOM_STEPS.reduce((b,z,idx)=>Math.abs(z-zoomLevel)<Math.abs(ZOOM_STEPS[b]-zoomLevel)?idx:b,0); const ni=Math.max(0,Math.min(ZOOM_STEPS.length-1,i+delta)); zoomLevel=ZOOM_STEPS[ni]; applyZoom(); }
const treeRoot={name:'FLEET',children:new Map()};
for(const p of protocols){ let n=treeRoot; const parts=p.path.split(' > '); parts.forEach((part,i)=>{const path=parts.slice(0,i+1).join(' > '); if(!n.children.has(part)) n.children.set(part,{name:part,path,children:new Map(),item:null}); n=n.children.get(part); if(i===parts.length-1) n.item=p;}); }
function getFolderChildren(path){const pre=path?`${path} > `:''; const d=path?splitPath(path).length:0; const m=new Map(); for(const p of protocols){ if(path && !p.path.startsWith(pre)) continue; const parts=splitPath(p.path); const name=parts[d]; if(!name) continue; const childPath=parts.slice(0,d+1).join(' > '); if(!m.has(childPath)) m.set(childPath,{type:parts.length===d+1?'program':'folder',name,path:childPath}); } return [...m.values()];}
function searchText(p){ const s=specs[p.path]||{}; return norm([p.path,p.name,JSON.stringify(s)].join(' ')); }
function renderTree(){ const q=norm(document.getElementById('search').value.trim()); const html=[];
 const rec=(node,level)=>{ for(const child of node.children.values()){ const item=!!child.item; const match=!q || (item?searchText(child.item).includes(q):norm(child.name).includes(q) || [...child.children.values()].some(c=>true)); if(!match) continue; const open=q || openFolders.has(child.path) || selectedNode.path===child.path || selectedNode.path.startsWith(child.path+' > ');
 if(item) html.push(`<div class="node item${selectedNode.type==='program'&&selectedNode.path===child.path?' selected':''}" style="--level:${level}" data-path="${esc(child.path)}"><span class="node-spacer"></span><span class="node-icon program-icon"></span><span class="node-label">${esc(child.name)}</span></div>`);
 else { html.push(`<div class="node folder${open?' open':''}${selectedNode.type==='folder'&&selectedNode.path===child.path?' selected':''}" style="--level:${level}" data-folder="${esc(child.path)}"><span class="node-expander"></span><span class="node-icon folder-icon"></span><span class="node-label">${esc(child.name)}</span></div>`); if(open) rec(child,level+1);} } };
 rec(treeRoot,0);
 const tree=document.getElementById('tree'); tree.innerHTML=html.join('')||'<div class="no-results">Keine Treffer.</div>';
 tree.querySelectorAll('.node.folder').forEach(el=>el.onclick=()=>{const p=el.dataset.folder; selectedNode={type:'folder',path:p}; openFolders.add(p); renderTree(); renderWorkspace();});
 tree.querySelectorAll('.node.item').forEach(el=>el.onclick=()=>{selectedNode={type:'program',path:el.dataset.path}; ensurePathOpen(el.dataset.path); renderTree(); renderWorkspace();});
}
function renderRow(b){ const blank=!b.name; return `<div class="row${blank?' blank':''}" title="${esc(blank?'':[b.name,b.time,b.pill].filter(Boolean).join(' · '))}"><div class="row-top"><span class="rname${blank?' rblank':''}">${esc(b.name||'')}</span>${b.time?`<span class="rtime">${esc(b.time)}</span>`:''}</div><div class="row-bot"><div class="ricons">${blank?'':PERSON_SVG}${b.badge?`<span class="badge">${esc(b.badge)}</span>`:''}</div>${b.pill?`<span class="pill">${esc(b.pill)}</span>`:''}</div></div>`; }
function renderBlock(b){ if(!b) return ''; if(b.t==='spacer') return `<div class="spacer" style="--spacer-rows:${Math.max(1,Number(b.n||1)||1)}"></div>`; if(b.t==='label') return `<div class="label${b.tone==='orange'?' orange':''}">${esc(b.text||'')}</div>`; if(b.t==='decision'){ const cols=b.cols||[]; return `<div class="decision-q"><div class="dq-top"><span class="qtext">${esc(b.q||'Decision')}</span></div><div class="dq-bot"><span class="dropdown">${esc(b.default||'Nein')}</span><span class="pill">Basic Decision</span></div></div><div class="decision-title">${esc(b.title||b.q||'Decision')}</div><div class="branch-grid" style="--bcols:${cols.length||1}">${cols.map(c=>`<div class="branch"><div class="branch-head">${esc(c.label||'')}</div>${(c.blocks||[]).map(renderBlock).join('')}</div>`).join('')}</div>`; }
 return renderRow(b); }
function renderProgram(){ const p=byPath[selectedNode.path]||protocols[0]; selectedNode={type:'program',path:p.path}; const s=specs[p.path]; const lanes=(s?.lanes)||[{title:s?.title||p.name,check:true,blocks:s?.blocks||[]}]; const w=s?.width||380; const cols=lanes.map(l=>l.weight?`${l.weight}fr`:'1fr').join(' ');
 document.getElementById('program').innerHTML=`<div class="pathline"><span class="path-text">${esc(formatDisplayPath(p.path))}</span><span class="edit is-disabled" aria-disabled="true" title="Bearbeiten nicht verfügbar (Read-only)">✎</span></div><div class="program-frame" style="--pw:${w}px"><div class="viewtabs"><span data-view="patient" class="${activeView==='patient'?'active':''}">Patient View</span><span data-view="basic" class="${activeView==='basic'?'active':''}">Basic Patient View</span></div><div class="lanes" style="--cols:${cols}">${lanes.map(l=>`<section class="lane"><div class="lane-head">${l.check?'<span class="tick">✓</span>':''}${esc(l.title||'Standard')}</div><div class="flow">${(l.blocks||[]).map(renderBlock).join('')}</div></section>`).join('')}</div></div>`;
 applyZoom();
}
function renderFolderContent(path){ const children=getFolderChildren(path); document.getElementById('program').innerHTML=`<div class="pathline"><span class="path-text">${esc(formatDisplayPath(path))}</span><span class="edit is-disabled" aria-disabled="true" title="Bearbeiten nicht verfügbar (Read-only)">✎</span></div><div class="folder-content-view"><div class="folder-list">${children.map(c=>`<div class="folder-content-row" data-type="${c.type}" data-path="${esc(c.path)}" tabindex="0"><span class="folder-content-icon ${c.type}"></span><span class="folder-content-name">${esc(c.name)}</span></div>`).join('')}</div></div>`;
 document.querySelectorAll('.folder-content-row').forEach(r=>{const open=()=>{const type=r.dataset.type,path=r.dataset.path; selectedNode={type,path}; if(type==='folder') openFolders.add(path); ensurePathOpen(path); renderTree(); renderWorkspace();}; r.onclick=open; r.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}}});
}
function renderWorkspace(){ if(selectedNode.type==='folder'&&!isProgramPath(selectedNode.path)) renderFolderContent(selectedNode.path); else renderProgram(); }

document.getElementById('zoomIn')?.addEventListener('click',()=>zoom(1));
document.getElementById('zoomOut')?.addEventListener('click',()=>zoom(-1));
document.getElementById('search').addEventListener('input',()=>{document.querySelector('.search-box')?.classList.toggle('has-text',!!document.getElementById('search').value.trim()); renderTree();});
document.getElementById('clear').addEventListener('click',()=>{const s=document.getElementById('search'); s.value=''; document.querySelector('.search-box')?.classList.remove('has-text'); renderTree(); s.focus();});
document.getElementById('collapseAll')?.addEventListener('click',()=>{openFolders.clear(); ensurePathOpen(selectedNode.path); renderTree();});
document.addEventListener('keydown',e=>{const se=document.getElementById('search'); const on=document.activeElement===se; if(e.ctrlKey&&(e.key==='+'||e.key==='=')){e.preventDefault();zoom(1);} if(e.ctrlKey&&e.key==='-'){e.preventDefault();zoom(-1);} if(e.ctrlKey&&e.key==='0'){e.preventDefault();zoomLevel=1;applyZoom();} if(e.ctrlKey&&e.key==='f'){e.preventDefault();se.focus();se.select();} if(e.key==='Escape'){if(on&&se.value){se.value='';renderTree();}else se.blur();} if(e.key==='Enter'&&on){document.querySelector('.node.item')?.click();}});
document.getElementById('workspace').addEventListener('wheel',e=>{if(!e.ctrlKey)return; e.preventDefault(); zoom(e.deltaY<0?1:-1);},{passive:false});
ensurePathOpen(selectedNode.path); renderTree(); renderWorkspace();
