'use strict';
const DATA = window.MYEXAM_PROTOCOL_DATABASE;
if (!DATA) throw new Error('MYEXAM_PROTOCOL_DATABASE wurde nicht geladen.');
const protocols = DATA.protocols;
const specs = DATA.specs;
const byPath = Object.fromEntries(protocols.map((p) => [p.path, p]));
const FLEET_ROOT_ORDER = ['Kopf','Wirbelsäule','Gelenke','Hals','Thorax','Abdomen','Becken','KM-Angiographie','NATIV-Angiographie','Kinder','Ganzkörper','Herz','Extremitäten','TEST','Studienprotokolle','Copy of Becken'];

let selectedNode = byPath['Kopf > Standard > Standard +/- KM'] ? { type: 'program', path: 'Kopf > Standard > Standard +/- KM' } : { type: 'program', path: protocols[0].path };
let focusedTreePath = selectedNode.path;
let activeView = 'patient';
let openFolders = new Set(['Kopf', 'Kopf > Standard', ...selectedNode.path.split(' > ').slice(0, -1).map((_, i, a) => selectedNode.path.split(' > ').slice(0, i + 1).join(' > '))]);
const ZOOM_STEPS = [0.25,0.33,0.5,0.67,0.75,0.9,1,1.1,1.25,1.5,1.75,2,2.5,3];
let zoomLevel = 1;
let isMenuOpen = false;

const treeRoot = { name: 'FLEET', path: '', children: new Map(), item: null };
const allNodes = [];
const splitPath = (path) => (path ? path.split(' > ') : []);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escapeRegExp = (v) => String(v ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm=(v)=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const formatDisplayPath=(path)=>`FLEET${path?` » ${path.replace(/ > /g,' » ')}`:''}`;

function ensureFolderPath(path){ let node=treeRoot; const parts=splitPath(path); parts.forEach((part,i)=>{const current=parts.slice(0,i+1).join(' > '); if(!node.children.has(part)){const child={name:part,path:current,children:new Map(),item:null}; node.children.set(part,child); if(!allNodes.some((n)=>n.path===current)) allNodes.push(child);} node=node.children.get(part);}); }
FLEET_ROOT_ORDER.forEach(ensureFolderPath);
protocols.forEach((p)=>{ensureFolderPath(p.path); let node=treeRoot; splitPath(p.path).forEach((part,i,a)=>{node=node.children.get(part); if(i===a.length-1) node.item=p;});});

function orderedChildren(node){const c=[...node.children.values()]; if(!node.path){return c.sort((a,b)=>{const ia=FLEET_ROOT_ORDER.indexOf(a.name),ib=FLEET_ROOT_ORDER.indexOf(b.name); return (ia===-1?999:ia)-(ib===-1?999:ib)||a.name.localeCompare(b.name,'de');});} return c;}

function getSearchState(){ const raw=document.getElementById('search')?.value||''; const q=norm(raw).trim(); const active=!!q; const visible=new Set(); const counts=new Map(); if(active){ for(const n of allNodes){if(norm(n.name).includes(q)){visible.add(n.path);} } protocols.forEach((p)=>{const blob=JSON.stringify([p,specs[p.path]||{}]).toLowerCase(); if(blob.includes(q)){visible.add(p.path); splitPath(p.path).forEach((_,i,a)=>visible.add(a.slice(0,i+1).join(' > '))); counts.set(p.path,(counts.get(p.path)||0)+1);} }); } return {raw,q,active,visible,counts}; }
function highlight(t,state){const s=String(t??''); if(!state.active||!state.raw.trim()) return esc(s); const re=new RegExp(escapeRegExp(state.raw.trim()).replace(/\s+/g,'[\\s_\-./]*'),'ig'); return esc(s).replace(re,(m)=>`<mark>${m}</mark>`);}

function getVisibleTreeNodes(state){const out=[]; const walk=(node,d,parent='')=>{orderedChildren(node).forEach((child,idx,arr)=>{const isFolder=!!child.children.size&&!child.item; const show=!state.active||state.visible.has(child.path)||[...state.visible].some((v)=>v.startsWith(`${child.path} > `)); if(!show) return; const open=openFolders.has(child.path)||selectedNode.path.startsWith(`${child.path} > `); out.push({node:child,path:child.path,depth:d,isFolder,open,parentPath:parent,posinset:idx+1,setsize:arr.length}); if(isFolder&&open) walk(child,d+1,child.path);});}; walk(treeRoot,1,''); return out; }

function renderTree(){ const state=getSearchState(); const tree=document.getElementById('tree'); const visible=getVisibleTreeNodes(state); if(!visible.some((n)=>n.path===focusedTreePath)) focusedTreePath=visible[0]?.path||''; tree.innerHTML=visible.map((v)=>`<div class="node ${v.isFolder?'folder':'item'} ${selectedNode.path===v.path?'is-selected':''} ${focusedTreePath===v.path?'is-focused':''} ${v.open?'open':''}" role="treeitem" aria-level="${v.depth}" ${v.isFolder?`aria-expanded="${v.open}"`:''} aria-selected="${selectedNode.path===v.path}" tabindex="${focusedTreePath===v.path?'0':'-1'}" data-tree-path="${esc(v.path)}" data-node-type="${v.isFolder?'folder':'program'}" style="--level:${v.depth-1}"><span class="node-expander" data-expander="1"></span><span class="node-label">${highlight(v.node.name,state)}</span></div>`).join('')||'<div class="no-results">Keine Treffer.</div>'; }

function renderWorkspace(){ const state=getSearchState(); const p=document.getElementById('program'); const breadcrumb=`<div class="workspace-head"><div class="pathline"><span class="path-text">${highlight(formatDisplayPath(selectedNode.path),state)}</span><span class="edit is-disabled" aria-disabled="true" title="Bearbeiten nicht verfügbar (Read-only)">✎</span></div><div class="workspace-zoom-controls"><button class="zoom-btn" data-zoom-step="-1" id="zoomOut" type="button" aria-label="Verkleinern">−</button><span id="zoomLevel" class="zoom-level">100%</span><button class="zoom-btn" data-zoom-step="1" id="zoomIn" type="button" aria-label="Vergrößern">+</button></div></div>`;
 if(selectedNode.type==='folder'){ const folder=allNodes.find((n)=>n.path===selectedNode.path)||treeRoot; const children=orderedChildren(folder); const list=children.length?children.map((c)=>`<button class="folder-content-row" data-path="${esc(c.path)}" data-type="${c.item?'program':'folder'}"><span class="folder-content-name">${highlight(c.name,state)}</span></button>`).join(''):'<div class="folder-empty">Keine Programme in diesem Ordner.</div>'; p.innerHTML=`${breadcrumb}<div class="folder-content-view">${list}</div>`; }
 else { const protocol=byPath[selectedNode.path]; const spec=specs[protocol.path]||{}; const lanes=spec.lanes||[{title:spec.title||protocol.name,blocks:spec.blocks||[]}]; p.innerHTML=`${breadcrumb}<div class="program-frame" style="--pw:${spec.width||380}px"><div class="viewtabs" role="tablist" aria-label="Programmansichten"><span data-view="patient" role="tab" tabindex="${activeView==='patient'?'0':'-1'}" aria-selected="${activeView==='patient'}" class="${activeView==='patient'?'active':''}">Patient View</span><span data-view="basic" role="tab" tabindex="${activeView==='basic'?'0':'-1'}" aria-selected="${activeView==='basic'}" class="${activeView==='basic'?'active':''}">Basic Patient View</span></div><div class="lanes">${lanes.map((l)=>`<section class="lane"><div class="lane-head">${esc(l.title||'')}</div><div class="flow">${(l.blocks||[]).map((b)=>renderBlock(b,state)).join('')}</div></section>`).join('')}</div></div>`; }
 applyZoom(); }
function renderBlock(b,state){ if(!b)return''; if(b.t==='row') return `<div class="row"><span>${highlight(b.name||'',state)}</span></div>`; if(b.t==='label') return `<div class="label">${highlight(b.text||'',state)}</div>`; if(b.t==='spacer') return '<div class="spacer"></div>'; if(b.t==='decision'){ const note=b.note?`<div class="decision-note">${highlight(b.note,state)}</div>`:''; return `<div class="decision-q">${highlight(b.q||'Decision',state)}</div>${note}`;} return ''; }

function applyZoom(){ const pr=document.getElementById('program'); if(pr) pr.style.zoom=String(zoomLevel); const idx=ZOOM_STEPS.indexOf(zoomLevel); const out=document.getElementById('zoomOut'),inn=document.getElementById('zoomIn'),lvl=document.getElementById('zoomLevel'); if(lvl) lvl.textContent=`${Math.round(zoomLevel*100)}%`; if(out) out.disabled=idx<=0; if(inn) inn.disabled=idx>=ZOOM_STEPS.length-1; }
function stepZoom(d){const i=ZOOM_STEPS.indexOf(zoomLevel); zoomLevel=ZOOM_STEPS[Math.max(0,Math.min(ZOOM_STEPS.length-1,i+d))]; applyZoom();}

function renderMenu(){const items=['Baum erstellen...','Baum duplizieren...','Baum umbenennen...','Baum importieren...','Baum löschen...','Passwortschutz...','sep','Drucken...','Exportieren...','Änderungen hervorheben...','Zeige inkonsistente Einträge']; const m=document.getElementById('toolbarMenu'); m.innerHTML=items.map((i)=>i==='sep'?'<div class="context-menu-separator" role="separator"></div>':`<div class="context-menu-item is-disabled" role="menuitem" aria-disabled="true">${i}</div>`).join('');}
function toggleMenu(){const b=document.getElementById('treeMenuButton'),m=document.getElementById('toolbarMenu'); isMenuOpen=!isMenuOpen; m.hidden=!isMenuOpen; b.setAttribute('aria-expanded',String(isMenuOpen)); if(isMenuOpen){const r=b.getBoundingClientRect(); m.style.left=`${r.left}px`; m.style.top=`${r.bottom+1}px`;}}

document.getElementById('tree').addEventListener('click',(e)=>{const item=e.target.closest('.node'); if(!item)return; const path=item.dataset.treePath; const type=item.dataset.nodeType; const exp=e.target.closest('[data-expander]'); focusedTreePath=path; if(exp&&type==='folder'){openFolders.has(path)?openFolders.delete(path):openFolders.add(path);} else selectedNode={type,path}; renderTree(); renderWorkspace();});

document.getElementById('tree').addEventListener('keydown',(e)=>{const st=getSearchState(); const vis=getVisibleTreeNodes(st); const idx=vis.findIndex((n)=>n.path===focusedTreePath); if(idx<0)return; const cur=vis[idx]; const set=(n)=>{focusedTreePath=n.path; if(['Enter',' '].includes(e.key)) selectedNode={type:n.isFolder?'folder':'program',path:n.path}; renderTree(); if(['Enter',' '].includes(e.key)) renderWorkspace();}; if(e.key==='ArrowDown'){e.preventDefault(); if(vis[idx+1]) set(vis[idx+1]);} if(e.key==='ArrowUp'){e.preventDefault(); if(vis[idx-1]) set(vis[idx-1]);} if(e.key==='Home'){e.preventDefault(); set(vis[0]);} if(e.key==='End'){e.preventDefault(); set(vis[vis.length-1]);} if(e.key==='ArrowRight'&&cur.isFolder){e.preventDefault(); if(!cur.open){openFolders.add(cur.path); renderTree();} else if(vis[idx+1]) set(vis[idx+1]);} if(e.key==='ArrowLeft'&&cur.isFolder){e.preventDefault(); if(cur.open){openFolders.delete(cur.path); renderTree();} } if(e.key==='Enter'||e.key===' '){e.preventDefault(); set(cur);} });

document.getElementById('workspace').addEventListener('click',(e)=>{const z=e.target.closest('[data-zoom-step]'); if(z){stepZoom(Number(z.dataset.zoomStep)); return;} const tab=e.target.closest('.viewtabs span[data-view]'); if(tab){activeView=tab.dataset.view; renderWorkspace(); return;} const row=e.target.closest('.folder-content-row'); if(row){selectedNode={type:row.dataset.type,path:row.dataset.path}; openFolders.add(splitPath(row.dataset.path).slice(0,-1).join(' > ')); renderTree(); renderWorkspace();}});
document.getElementById('workspace').addEventListener('keydown',(e)=>{const tab=e.target.closest('.viewtabs span[data-view]'); if(tab&&(e.key==='Enter'||e.key===' ')){e.preventDefault(); activeView=tab.dataset.view; renderWorkspace();}});

document.getElementById('search').addEventListener('input',()=>{renderTree(); renderWorkspace();});
document.getElementById('clear').addEventListener('click',()=>{document.getElementById('search').value=''; renderTree(); renderWorkspace();});
document.getElementById('collapseAll').addEventListener('click',()=>{openFolders.clear(); renderTree();});
document.getElementById('treeMenuButton').addEventListener('click',toggleMenu);
document.addEventListener('click',(e)=>{if(isMenuOpen&&!e.target.closest('#treeMenuButton')&&!e.target.closest('#toolbarMenu')) toggleMenu();});
document.addEventListener('keydown',(e)=>{if(e.ctrlKey&&(e.key==='+'||e.key==='=')){e.preventDefault();stepZoom(1);} if(e.ctrlKey&&e.key==='-'){e.preventDefault();stepZoom(-1);} if(e.ctrlKey&&e.key==='0'){e.preventDefault();zoomLevel=1;applyZoom();} if(e.key==='Escape'){if(isMenuOpen) toggleMenu(); const s=document.getElementById('search'); if(document.activeElement===s&&s.value){s.value=''; renderTree(); renderWorkspace();}} if(e.ctrlKey&&e.key.toLowerCase()==='f'){e.preventDefault();document.getElementById('search').focus();}});
renderMenu(); renderTree(); renderWorkspace();
