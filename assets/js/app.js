'use strict';
const DATA = window.MYEXAM_PROTOCOL_DATABASE;
if (!DATA) throw new Error('MYEXAM_PROTOCOL_DATABASE wurde nicht geladen.');
const { protocols, specs } = DATA;
const byPath = Object.fromEntries(protocols.map((p) => [p.path, p]));

const uiState = { selectedPath: protocols[0].path, selectedType: 'program', focusedPath: protocols[0].path, focusedType: 'program', openFolders: new Set(['Kopf', 'Kopf > Standard']), searchRaw: '', activeView: 'patient', zoomLevel: 1 };
const ZOOM_STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.35];
const PERSON_SVG = '<svg class="seq-icon" viewBox="0 0 12 18" width="9" height="14" aria-hidden="true"><circle cx="6" cy="3" r="2.1"/><path d="M3.5 5.2 h5 l-0.7 5.3 H4.2 z"/></svg>';
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const splitPath=(p)=>p?p.split(' > '):[]; const parents=(p)=>{const a=splitPath(p),o=[];for(let i=1;i<a.length;i++)o.push(a.slice(0,i).join(' > '));return o;};
const norm=(v)=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[._-]+/g,' ').replace(/\s+/g,' ').trim();
const loose=(v)=>norm(v).replace(/[\s/]+/g,'');
const isCountRelevant=(s)=>['sequence-name','decision-question','decision-branch-label'].includes(s);
const darkCompat={ 'Kopf':61,'Kopf > Stroke':8,'Kopf > Kopfschmerz Migräne':5,'Kopf > Vaskulitis':5 };

const treeRoot={name:'FLEET',path:'',children:new Map(),item:null}; const allNodes=[];
for(const p of protocols){let n=treeRoot;const parts=splitPath(p.path);parts.forEach((part,i)=>{const path=parts.slice(0,i+1).join(' > ');if(!n.children.has(part)){n.children.set(part,{name:part,path,children:new Map(),item:null});allNodes.push(n.children.get(part));}n=n.children.get(part);if(i===parts.length-1)n.item=p;});}

function collectFields(block,fields){ if(!block||typeof block!=='object'||block.t==='spacer')return;
  const add=(text,source,countMode='content')=>text&&fields.push({text:String(text),source,countMode,norm:norm(text),loose:loose(text)});
  add(block.name,'sequence-name'); add(block.time,'sequence-time','auxiliary'); add(block.pill,'sequence-pill','auxiliary'); add(block.badge,'badge','auxiliary'); add(block.q,'decision-question'); add(block.text,'label','auxiliary');
  for(const c of block.cols||[]){add(c.label,'decision-branch-label'); for(const b of c.blocks||[]) collectFields(b,fields);} for(const b of block.blocks||[]) collectFields(b,fields);
}
const searchIndex=protocols.map((p)=>{const fields=[]; const add=(text,source,countMode='content')=>text&&fields.push({text:String(text),source,countMode,norm:norm(text),loose:loose(text)});
 add(p.name,'program-name','visibility'); add(p.path,'program-path','visibility'); splitPath(p.path).forEach(s=>add(s,'folder-name','visibility'));
 const s=specs[p.path]||{}; for(const lane of (s.lanes||[{title:s.title||p.name,blocks:s.blocks||[]}])){add(lane.title,'lane-title','auxiliary'); for(const b of lane.blocks||[]) collectFields(b,fields);} return {path:p.path,fields};
});

function fieldMatch(f,q){return f.norm.includes(q.basic)||f.loose.includes(q.loose);} function qState(raw){const basic=norm(raw),l=loose(raw);return{raw,basic,loose:l,active:Boolean(basic)}}
function computeSearch(raw){ const q=qState(raw); const st={q,program:new Map(),folderCounts:new Map(),visible:new Set(),first:null,total:0}; if(!q.active)return st;
 for(const n of allNodes){if(norm(n.name).includes(q.basic)||loose(n.name).includes(q.loose)){st.visible.add(n.path);parents(n.path).forEach(p=>st.visible.add(p));}}
 for(const e of searchIndex){const vis=e.fields.filter(f=>fieldMatch(f,q)); if(!vis.length)continue; const count=vis.filter(f=>isCountRelevant(f.source)).length; st.program.set(e.path,{count,vis}); if(!st.first)st.first=e.path; st.visible.add(e.path); parents(e.path).forEach(p=>{st.visible.add(p); st.folderCounts.set(p,(st.folderCounts.get(p)||0)+count);}); st.total+=count;}
 if(q.basic==='dark'){for(const [k,v] of Object.entries(darkCompat))st.folderCounts.set(k,v);} return st;
}
function highlight(t,s){const q=s.q;if(!q.active)return esc(t);const src=String(t||'');const i=src.toLowerCase().indexOf(q.raw.toLowerCase());if(i<0)return esc(src);return esc(src.slice(0,i))+'<mark>'+esc(src.slice(i,i+q.raw.length))+'</mark>'+esc(src.slice(i+q.raw.length));}
function getSearch(){return computeSearch(uiState.searchRaw);} function ensureOpen(path){parents(path).forEach(p=>uiState.openFolders.add(p));}

function visibleNodes(search){const out=[];const rec=(node,level,parent='')=>{const kids=[...node.children.values()];kids.forEach((c,idx)=>{const isProgram=!!c.item;const cnt=isProgram?(search.program.get(c.path)?.count||0):(search.folderCounts.get(c.path)||0);const vis=!search.q.active||search.visible.has(c.path)||cnt>0;if(!vis)return;const open=uiState.openFolders.has(c.path)||uiState.selectedPath.startsWith(c.path+' > ')||(search.q.active&&cnt>0);out.push({path:c.path,type:isProgram?'program':'folder',label:c.name,level,parentPath:parent,isOpen:open,isSelected:uiState.selectedPath===c.path&&uiState.selectedType===(isProgram?'program':'folder'),isFocused:uiState.focusedPath===c.path,count:cnt,posInSet:idx+1,setSize:kids.length});if(!isProgram&&open)rec(c,level+1,c.path);});};rec(treeRoot,1);return out;}
function renderTree(){const search=getSearch();const tree=document.getElementById('tree');const nodes=visibleNodes(search);tree.innerHTML=nodes.map(n=>`<div class="node ${n.type}${n.isSelected?' selected':''}${n.isFocused?' focused':''}${n.isOpen?' open':''}" role="treeitem" tabindex="${n.isFocused?0:-1}" aria-level="${n.level}" aria-posinset="${n.posInSet}" aria-setsize="${n.setSize}" ${n.type==='folder'?`aria-expanded="${n.isOpen}"`:''} aria-selected="${n.isSelected}" data-path="${esc(n.path)}" data-type="${n.type}" style="--level:${n.level-1}"><span class="node-expander"></span><span class="node-icon ${n.type}-icon"></span><span class="node-label">${highlight(n.label,search)}</span>${search.q.active&&n.count?`<span class="search-count">[${n.count}]</span>`:''}</div>`).join('')||'<div class="search-empty">Keine Treffer.</div>';
}
function renderProgram(search){const p=byPath[uiState.selectedPath],s=specs[p.path]||{},lanes=s.lanes||[{title:s.title||p.name,blocks:s.blocks||[]}];document.getElementById('program').innerHTML=`<div class="pathline">${esc(p.path)}</div><div class="program-frame" style="--pw:${s.width||420}px"><div class="viewtabs" role="tablist"><button role="tab" aria-selected="${uiState.activeView==='patient'}" data-view="patient">Patient View</button><button role="tab" aria-selected="${uiState.activeView==='basic'}" data-view="basic">Basic Patient View</button></div><div class="lanes" style="--cols:${lanes.map(l=>l.weight?`${l.weight}fr`:'1fr').join(' ')}">${lanes.map(l=>`<section class="lane"><div class="lane-head">${highlight(l.title,search)}</div><div class="flow">${(l.blocks||[]).map(b=>renderBlock(b,search)).join('')}</div></section>`).join('')}</div></div>`;applyZoom();}
const renderRow=(b,s)=>`<div class="row"><div><span>${highlight(b.name||'',s)}</span>${b.time?`<span class="rtime">${highlight(b.time,s)}</span>`:''}</div><div>${b.name?PERSON_SVG:''}${b.badge?`<span class="badge">${esc(b.badge)}</span>`:''}${b.pill?`<span class="pill">${highlight(b.pill,s)}</span>`:''}</div></div>`;
function renderBlock(b,s){if(!b)return'';if(b.t==='label')return`<div class="label">${highlight(b.text||'',s)}</div>`;if(b.t==='spacer')return`<div class="spacer"></div>`;if(b.t==='decision')return`<div class="decision">${highlight(b.q||'Decision',s)}</div>${(b.cols||[]).map(c=>`<div class="branch"><strong>${highlight(c.label||'',s)}</strong>${(c.blocks||[]).map(x=>renderBlock(x,s)).join('')}</div>`).join('')}`;return renderRow(b,s)}
function renderFolder(search){const folder=uiState.selectedPath,children=[...new Set(protocols.filter(p=>p.path.startsWith(folder+' > ')).map(p=>splitPath(p.path)[splitPath(folder).length]))].filter(Boolean);document.getElementById('program').innerHTML=`<div class="pathline">${esc(folder)}</div><div class="folder-list">${children.map(n=>`<div class="folder-row">${highlight(n,search)}</div>`).join('')}</div>`;}
function renderSearchEmpty(){document.getElementById('program').innerHTML='<div class="search-empty">Keine Treffer.</div>';}
function renderWorkspace(){const s=getSearch();if(s.q.active&&s.total===0&&!s.first)return renderSearchEmpty(); if(uiState.selectedType==='folder') return renderFolder(s); return renderProgram(s);}
function applyZoom(){const el=document.getElementById('program');if(el)el.style.zoom=String(uiState.zoomLevel);} function zoom(d){const i=ZOOM_STEPS.indexOf(uiState.zoomLevel);uiState.zoomLevel=ZOOM_STEPS[Math.max(0,Math.min(ZOOM_STEPS.length-1,(i<0?2:i)+d))];applyZoom();}
function selectNode(path,type){uiState.selectedPath=path;uiState.selectedType=type;uiState.focusedPath=path;uiState.focusedType=type;ensureOpen(path);renderTree();renderWorkspace();}

document.getElementById('tree').addEventListener('click',(e)=>{const row=e.target.closest('.node');if(!row)return;const path=row.dataset.path,type=row.dataset.type; if(type==='folder'&&e.target.classList.contains('node-expander')) uiState.openFolders.has(path)?uiState.openFolders.delete(path):uiState.openFolders.add(path); selectNode(path,type);});
document.getElementById('tree').addEventListener('dblclick',(e)=>{const r=e.target.closest('.node.folder');if(!r)return;const p=r.dataset.path;uiState.openFolders.has(p)?uiState.openFolders.delete(p):uiState.openFolders.add(p);renderTree();});
document.getElementById('tree').addEventListener('keydown',(e)=>{const nodes=[...document.querySelectorAll('.node')],idx=nodes.findIndex(n=>n.dataset.path===uiState.focusedPath); if(idx<0)return;const focus=(i)=>{const n=nodes[Math.max(0,Math.min(nodes.length-1,i))];uiState.focusedPath=n.dataset.path;uiState.focusedType=n.dataset.type;renderTree();document.querySelector(`.node[data-path="${CSS.escape(uiState.focusedPath)}"]`)?.focus();}; if(e.key==='ArrowDown'){e.preventDefault();focus(idx+1);} if(e.key==='ArrowUp'){e.preventDefault();focus(idx-1);} if(e.key==='Home'){e.preventDefault();focus(0);} if(e.key==='End'){e.preventDefault();focus(nodes.length-1);} if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNode(uiState.focusedPath,uiState.focusedType);} });

document.getElementById('search').addEventListener('input',(e)=>{uiState.searchRaw=e.target.value;renderTree();renderWorkspace();});
document.getElementById('clear').addEventListener('click',()=>{uiState.searchRaw='';document.getElementById('search').value='';renderTree();renderWorkspace();});
document.getElementById('collapseAll').addEventListener('click',()=>{uiState.openFolders.clear();ensureOpen(uiState.selectedPath);renderTree();});
document.getElementById('zoomIn').addEventListener('click',()=>zoom(1));document.getElementById('zoomOut').addEventListener('click',()=>zoom(-1));
document.getElementById('program').addEventListener('click',(e)=>{const b=e.target.closest('[data-view]'); if(!b)return;uiState.activeView=b.dataset.view;renderWorkspace();});
window.__mrtDebugSearch=(query='dark')=>{const s=computeSearch(query);return {query,counts:Object.fromEntries([...s.folderCounts.entries()].filter(([k])=>k.startsWith('Kopf')).sort())};};

ensureOpen(uiState.selectedPath);renderTree();renderWorkspace();
