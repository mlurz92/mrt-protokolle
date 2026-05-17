'use strict';

const DATA = window.MYEXAM_PROTOCOL_DATABASE;
if (!DATA) throw new Error('MYEXAM_PROTOCOL_DATABASE wurde nicht geladen.');

const protocols = DATA.protocols;
const specs = DATA.specs;
const byPath = Object.fromEntries(protocols.map((p) => [p.path, p]));

let selectedNode = { type: 'program', path: protocols[0].path };
let focusedTreePath = protocols[0].path;
let openFolders = new Set(['Kopf', 'Kopf > Standard', 'Wirbelsäule', 'Wirbelsäule > HWS']);
let activeView = 'patient';
let zoomLevel = 1;
let typeaheadBuffer = '';
let typeaheadTimer = null;
let searchCacheKey = null;
let searchCache = null;
let treeMenu = null;

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.1;
const PERSON_SVG = '<svg class="seq-icon" viewBox="0 0 12 18" width="9" height="14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="6" cy="3" r="2.1" fill="currentColor"/><path d="M3.5 5.2 h5 l-0.7 5.3 H4.2 z" fill="currentColor"/></svg>';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const normalizeBasic = (v) => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ');
const normalizeLoose = (v) => normalizeBasic(v).replace(/[\s\-_.\/]+/g, '');
const splitPath = (path) => (path ? path.split(' > ') : []);
const getParentPaths = (path) => { const parts = splitPath(path); const out = []; for (let i = 1; i < parts.length; i += 1) out.push(parts.slice(0, i).join(' > ')); return out; };
const ensurePathOpen = (path) => getParentPaths(path).forEach((p) => openFolders.add(p));
const formatDisplayPath = (path) => `FLEET${path ? ` » ${path.replace(/ > /g, ' » ')}` : ''}`;
const isProgramPath = (path) => Boolean(byPath[path]);

function buildLooseMap(text) {
  const original = String(text ?? '');
  const chars = [];
  const indexMap = [];
  [...original].forEach((ch, i) => {
    const normalized = normalizeBasic(ch).replace(/[\s\-_.\/]+/g, '');
    if (!normalized) return;
    chars.push(normalized);
    indexMap.push(i);
  });
  return { original, loose: chars.join(''), indexMap };
}

function mergeRanges(ranges) {
  if (!ranges.length) return ranges;
  ranges.sort((a, b) => a[0] - b[0]);
  const out = [ranges[0]];
  for (let i = 1; i < ranges.length; i += 1) {
    const prev = out[out.length - 1];
    const cur = ranges[i];
    if (cur[0] <= prev[1] + 1) prev[1] = Math.max(prev[1], cur[1]);
    else out.push(cur);
  }
  return out;
}

function highlightText(text, state) {
  const original = String(text ?? '');
  if (!state?.active || !state.loose) return esc(original);
  const map = buildLooseMap(original);
  if (!map.loose) return esc(original);
  const ranges = [];
  let idx = 0;
  while (idx <= map.loose.length - state.loose.length) {
    const pos = map.loose.indexOf(state.loose, idx);
    if (pos < 0) break;
    const start = map.indexMap[pos];
    const end = map.indexMap[pos + state.loose.length - 1];
    ranges.push([start, end]);
    idx = pos + 1;
  }
  if (!ranges.length) return esc(original);
  const merged = mergeRanges(ranges);
  let out = '';
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) out += esc(original.slice(cursor, start));
    out += `<mark>${esc(original.slice(start, end + 1))}</mark>`;
    cursor = end + 1;
  }
  if (cursor < original.length) out += esc(original.slice(cursor));
  return out;
}

const treeRoot = { name: 'FLEET', path: '', children: new Map(), item: null };
const allNodes = [];
for (const p of protocols) {
  let node = treeRoot;
  const parts = splitPath(p.path);
  parts.forEach((part, i) => {
    const path = parts.slice(0, i + 1).join(' > ');
    if (!node.children.has(part)) {
      node.children.set(part, { name: part, path, children: new Map(), item: null });
      allNodes.push(node.children.get(part));
    }
    node = node.children.get(part);
    if (i === parts.length - 1) node.item = p;
  });
}

function collectBlockSearchFields(block, fields) { if (!block || typeof block !== 'object') return; if (block.t === 'spacer') return; ['name', 'time', 'pill', 'badge', 'text', 'q', 'title', 'default'].forEach((k) => block[k] && fields.push(String(block[k]))); (block.cols || []).forEach((c) => { ['label', 'title', 'text'].forEach((k) => c[k] && fields.push(String(c[k]))); (c.blocks || []).forEach((x) => collectBlockSearchFields(x, fields)); }); (block.blocks || []).forEach((x) => collectBlockSearchFields(x, fields)); (block.children || []).forEach((x) => collectBlockSearchFields(x, fields)); }
const searchIndex = protocols.map((p, order) => { const s = specs[p.path] || {}; const fields = [p.name, p.path, ...splitPath(p.path)]; (s.lanes || [{ title: s.title || p.name, blocks: s.blocks || [] }]).forEach((l) => { l.title && fields.push(l.title); (l.blocks || []).forEach((b) => collectBlockSearchFields(b, fields)); }); return { p, order, fields }; });

function buildSearchState(raw) {
  const display = String(raw ?? '').trim();
  const basic = normalizeBasic(display);
  const loose = normalizeLoose(display);
  const state = { active: Boolean(basic), display, basic, loose, visiblePaths: new Set(), programContentCounts: new Map(), programMetaCounts: new Map(), folderRecursiveContentCounts: new Map(), folderDirectMatches: new Map(), firstProgramPath: null, totalHits: 0 };
  if (!state.active) return state;

  for (const n of allNodes) {
    const hit = normalizeLoose(n.name).includes(loose) ? 1 : 0;
    if (hit) { state.folderDirectMatches.set(n.path, hit); state.visiblePaths.add(n.path); getParentPaths(n.path).forEach((p) => state.visiblePaths.add(p)); }
  }

  for (const entry of searchIndex) {
    let content = 0; let meta = 0;
    entry.fields.forEach((f, i) => {
      const ok = normalizeLoose(f).includes(loose) || normalizeBasic(f).includes(basic);
      if (!ok) return;
      if (i < 3) meta += 1; else content += 1;
    });
    if (!content && !meta) return;
    state.programContentCounts.set(entry.p.path, content);
    state.programMetaCounts.set(entry.p.path, meta);
    state.visiblePaths.add(entry.p.path);
    if (!state.firstProgramPath) state.firstProgramPath = entry.p.path;
    getParentPaths(entry.p.path).forEach((parent) => {
      state.visiblePaths.add(parent);
      state.folderRecursiveContentCounts.set(parent, (state.folderRecursiveContentCounts.get(parent) || 0) + content);
    });
    state.totalHits += (content + meta);
  }
  return state;
}

function getSearchState() { const raw = document.getElementById('search')?.value ?? ''; if (raw === searchCacheKey && searchCache) return searchCache; searchCacheKey = raw; searchCache = buildSearchState(raw); return searchCache; }
function invalidateSearchCache() { searchCacheKey = null; searchCache = null; }
function getDisplayCount(path, st, isFolder) { if (!st.active) return 0; if (isFolder) return (st.folderRecursiveContentCounts.get(path) || 0) + (st.folderDirectMatches.get(path) || 0); return (st.programContentCounts.get(path) || 0); }

function getFolderChildren(path) { const prefix = path ? `${path} > ` : ''; const depth = path ? splitPath(path).length : 0; const map = new Map(); for (const p of protocols) { if (path && !p.path.startsWith(prefix)) continue; const parts = splitPath(p.path); const name = parts[depth]; if (!name) continue; const childPath = parts.slice(0, depth + 1).join(' > '); if (!map.has(childPath)) map.set(childPath, { type: parts.length === depth + 1 ? 'program' : 'folder', name, path: childPath }); } return [...map.values()]; }
function getVisibleTreeNodes() { return [...document.querySelectorAll('#tree .node')]; }

function renderTree() {
  const state = getSearchState(); const tree = document.getElementById('tree'); const html = [];
  const rec = (node, level) => { for (const child of node.children.values()) { const isItem = Boolean(child.item); const count = getDisplayCount(child.path, state, !isItem); const visible = !state.active || state.visiblePaths.has(child.path) || count > 0; if (!visible) continue; const open = state.active ? state.visiblePaths.has(child.path) : (openFolders.has(child.path) || selectedNode.path.startsWith(`${child.path} > `)); const isSel = selectedNode.path === child.path && ((isItem && selectedNode.type === 'program') || (!isItem && selectedNode.type === 'folder')); const tab = focusedTreePath === child.path ? '0' : '-1';
      html.push(`<div class="node ${isItem ? 'item' : 'folder'}${open ? ' open' : ''}${isSel ? ' selected' : ''}" role="treeitem" ${isItem ? '' : `aria-expanded="${open}"`} aria-selected="${isSel}" tabindex="${tab}" data-type="${isItem ? 'program' : 'folder'}" data-path="${esc(child.path)}" style="--level:${level}"><span class="node-expander"></span><span class="node-icon ${isItem ? 'program-icon' : 'folder-icon'}"></span><span class="node-label">${highlightText(child.name, state)}</span>${state.active && count > 0 ? `<span class="search-count">[${count}]</span>` : ''}</div>`);
      if (!isItem && open) rec(child, level + 1);
    } };
  rec(treeRoot, 0);
  tree.innerHTML = html.join('') || '<div class="no-results">Keine Treffer.</div>';
}
function renderRow(b, st) { const blank = !b.name; return `<div class="row${blank ? ' blank' : ''}"><div class="row-top"><span class="rname${blank ? ' rblank' : ''}">${highlightText(b.name || '', st)}</span>${b.time ? `<span class="rtime">${highlightText(b.time, st)}</span>` : ''}</div><div class="row-bot"><div class="ricons">${blank ? '' : PERSON_SVG}${b.badge ? `<span class="badge">${highlightText(b.badge, st)}</span>` : ''}</div>${b.pill ? `<span class="pill">${highlightText(b.pill, st)}</span>` : ''}</div></div>`; }
function renderBlock(b, st) { if (!b) return ''; if (b.t === 'spacer') return `<div class="spacer" style="--spacer-rows:${Math.max(1, Number(b.n || 1) || 1)}"></div>`; if (b.t === 'label') return `<div class="label${b.tone === 'orange' ? ' orange' : ''}">${highlightText(b.text || '', st)}</div>`; if (b.t === 'decision') { const cols = b.cols || []; return `<div class="decision-q"><div class="dq-top"><span class="qtext">${highlightText(b.q || 'Decision', st)}</span></div><div class="dq-bot"><span class="dropdown">${highlightText(b.default || 'Nein', st)}</span><span class="pill">Basic Decision</span></div></div><div class="decision-title">${highlightText(b.title || b.q || 'Decision', st)}</div><div class="branch-grid" style="--bcols:${cols.length || 1}">${cols.map((c) => `<div class="branch"><div class="branch-head">${highlightText(c.label || '', st)}</div>${(c.blocks || []).map((x) => renderBlock(x, st)).join('')}</div>`).join('')}</div>`; } return renderRow(b, st); }

function renderProgram(st) { const p = byPath[selectedNode.path] || protocols[0]; selectedNode = { type: 'program', path: p.path }; const s = specs[p.path] || {}; const lanes = s.lanes || [{ title: s.title || p.name, blocks: s.blocks || [] }]; const w = s.width || 380; const cols = lanes.map((l) => (l.weight ? `${l.weight}fr` : '1fr')).join(' '); document.getElementById('program').innerHTML = `<div class="pathline"><span class="path-text">${highlightText(formatDisplayPath(p.path), st)}</span><button class="edit" disabled title="Bearbeiten nicht verfügbar" aria-label="Bearbeiten nicht verfügbar">✎</button></div><div class="program-frame" style="--pw:${w}px"><div class="viewtabs" role="tablist"><button data-view="patient" class="${activeView === 'patient' ? 'active' : ''}">Patient View</button><button data-view="basic" class="${activeView === 'basic' ? 'active' : ''}">Basic Patient View</button></div><div class="lanes" style="--cols:${cols}">${lanes.map((l) => `<section class="lane"><div class="lane-head">${l.check ? '<span class="tick">✓</span>' : ''}${highlightText(l.title || 'Standard', st)}</div><div class="flow">${(l.blocks || []).map((b) => renderBlock(b, st)).join('')}</div></section>`).join('')}</div></div>`; applyZoom(); }

function renderFolderContent(path, st) { const children = getFolderChildren(path); document.getElementById('program').innerHTML = `<div class="pathline"><span class="path-text">${highlightText(formatDisplayPath(path), st)}</span><button class="edit" disabled title="Bearbeiten nicht verfügbar" aria-label="Bearbeiten nicht verfügbar">✎</button></div><div class="folder-content-view"><div class="folder-list">${children.map((c) => { const hit = getDisplayCount(c.path, st, c.type === 'folder'); return `<div class="folder-content-row${st.active && hit === 0 ? ' dim-in-search' : ''}" data-type="${c.type}" data-path="${esc(c.path)}" tabindex="0"><span class="folder-content-icon ${c.type}"></span><span class="folder-content-name">${highlightText(c.name, st)}</span>${st.active && hit > 0 ? `<span class="search-count">[${hit}]</span>` : ''}</div>`; }).join('')}</div></div>`; }
function renderSearchEmpty(st) { document.getElementById('program').innerHTML = `<div class="pathline"><span class="path-text">${esc(formatDisplayPath(''))}</span></div><div class="search-empty">Keine Treffer für „${esc(st.display)}“.</div>`; }
function renderWorkspace() { const st = getSearchState(); if (st.active && st.totalHits === 0) return renderSearchEmpty(st); if (selectedNode.type === 'folder' && !isProgramPath(selectedNode.path)) return renderFolderContent(selectedNode.path, st); return renderProgram(st); }

function clampZoom(v) { return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(v * 100) / 100)); }
function setZoom(nextZoom, anchor = null) { const workspace = document.getElementById('workspace'); const program = document.getElementById('program'); if (!workspace || !program) return; const oldZoom = zoomLevel; const z = clampZoom(nextZoom); const rect = workspace.getBoundingClientRect(); const anchorX = anchor?.x ?? rect.left + rect.width / 2; const anchorY = anchor?.y ?? rect.top + rect.height / 2; const contentX = (workspace.scrollLeft + (anchorX - rect.left)) / oldZoom; const contentY = (workspace.scrollTop + (anchorY - rect.top)) / oldZoom; zoomLevel = z; program.style.zoom = String(zoomLevel); workspace.scrollLeft = contentX * zoomLevel - (anchorX - rect.left); workspace.scrollTop = contentY * zoomLevel - (anchorY - rect.top); updateZoomButtons(); document.getElementById('zoomReset').textContent = `${Math.round(zoomLevel * 100)}%`; }
function applyZoom() { const p = document.getElementById('program'); if (p) p.style.zoom = String(zoomLevel); updateZoomButtons(); }
function updateZoomButtons() { document.getElementById('zoomOut').disabled = zoomLevel <= ZOOM_MIN; document.getElementById('zoomIn').disabled = zoomLevel >= ZOOM_MAX; }

function closeContextMenu() { treeMenu?.classList.remove('open'); }
function showContextMenu(x, y) { if (!treeMenu) return; treeMenu.classList.add('open'); treeMenu.style.left = `${x}px`; treeMenu.style.top = `${y}px`; const rect = treeMenu.getBoundingClientRect(); treeMenu.style.left = `${Math.max(4, Math.min(x, window.innerWidth - rect.width - 4))}px`; treeMenu.style.top = `${Math.max(4, Math.min(y, window.innerHeight - rect.height - 4))}px`; }

function updateAndRender({ keepFocus = false } = {}) { invalidateSearchCache(); const st = getSearchState(); if (st.active && selectedNode.type === 'program' && !st.visiblePaths.has(selectedNode.path) && st.firstProgramPath) { selectedNode = { type: 'program', path: st.firstProgramPath }; focusedTreePath = st.firstProgramPath; ensurePathOpen(st.firstProgramPath); } renderTree(); renderWorkspace(); if (keepFocus) document.getElementById('search')?.focus(); }
function activateNode(type, path) { selectedNode = { type, path }; focusedTreePath = path; ensurePathOpen(path); renderTree(); renderWorkspace(); closeContextMenu(); }

function handleTreeClick(e) { const node = e.target.closest('.node'); if (!node) return; const path = node.dataset.path; const type = node.dataset.type; if (type === 'folder' && e.target.closest('.node-expander')) { if (openFolders.has(path)) openFolders.delete(path); else openFolders.add(path); focusedTreePath = path; renderTree(); return; } if (type === 'folder') openFolders.add(path); activateNode(type, path); }
function handleWorkspaceClick(e) { const tab = e.target.closest('.viewtabs [data-view]'); if (tab) { activeView = tab.dataset.view; renderWorkspace(); return; } const row = e.target.closest('.folder-content-row[data-path]'); if (row) { const type = row.dataset.type; activateNode(type, row.dataset.path); if (type === 'folder') openFolders.add(row.dataset.path); } }
function handleTreeContextMenu(e) { const node = e.target.closest('.node'); if (!node) return; e.preventDefault(); focusedTreePath = node.dataset.path; activateNode(node.dataset.type, node.dataset.path); showContextMenu(e.clientX, e.clientY); }
function handleSearchKeydown(e) { const input = e.currentTarget; if (e.key === 'Escape') { e.preventDefault(); if (input.value.trim()) { input.value = ''; updateAndRender({ keepFocus: true }); } else input.blur(); } if (e.key === 'Enter') { e.preventDefault(); const st = getSearchState(); if (st.firstProgramPath) activateNode('program', st.firstProgramPath); } }

function handleTreeKeydown(e) {
  const nodes = getVisibleTreeNodes(); const idx = nodes.findIndex((n) => n.dataset.path === focusedTreePath); if (idx < 0) return;
  const focusNode = (n) => { focusedTreePath = n.dataset.path; renderTree(); document.querySelector(`.node[data-path="${CSS.escape(focusedTreePath)}"]`)?.focus(); };
  const current = nodes[idx];
  if (e.key === 'ArrowDown' && nodes[idx + 1]) { e.preventDefault(); focusNode(nodes[idx + 1]); return; }
  if (e.key === 'ArrowUp' && nodes[idx - 1]) { e.preventDefault(); focusNode(nodes[idx - 1]); return; }
  if (e.key === 'Home') { e.preventDefault(); focusNode(nodes[0]); return; }
  if (e.key === 'End') { e.preventDefault(); focusNode(nodes[nodes.length - 1]); return; }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateNode(current.dataset.type, current.dataset.path); return; }
if (e.key === 'ArrowRight') { e.preventDefault(); if (current.dataset.type === 'folder') { if (!openFolders.has(current.dataset.path)) { openFolders.add(current.dataset.path); renderTree(); } else { const currentLevel = Number(current.style.getPropertyValue('--level')); const next = getVisibleTreeNodes().find((n, i) => i > idx && Number(n.style.getPropertyValue('--level')) > currentLevel); if (next) focusNode(next); } } return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); if (current.dataset.type === 'folder' && openFolders.has(current.dataset.path)) { openFolders.delete(current.dataset.path); renderTree(); return; } const parent = getParentPaths(current.dataset.path).at(-1); if (parent) { const pn = document.querySelector(`.node[data-path="${CSS.escape(parent)}"]`); if (pn) focusNode(pn); } return; }
  if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    typeaheadBuffer += normalizeBasic(e.key); clearTimeout(typeaheadTimer); typeaheadTimer = setTimeout(() => { typeaheadBuffer = ''; }, 700);
    const start = (idx + 1) % nodes.length;
    for (let i = 0; i < nodes.length; i += 1) {
      const n = nodes[(start + i) % nodes.length];
      const label = normalizeBasic(n.querySelector('.node-label')?.textContent || '');
      if (label.startsWith(typeaheadBuffer)) { e.preventDefault(); focusNode(n); break; }
    }
  }
}

document.getElementById('tree').addEventListener('click', handleTreeClick);
document.getElementById('tree').addEventListener('keydown', handleTreeKeydown);
document.getElementById('tree').addEventListener('contextmenu', handleTreeContextMenu);
document.getElementById('program').addEventListener('click', handleWorkspaceClick);
document.getElementById('search').addEventListener('input', () => updateAndRender());
document.getElementById('search').addEventListener('keydown', handleSearchKeydown);
document.getElementById('clear').addEventListener('click', () => { document.getElementById('search').value = ''; updateAndRender({ keepFocus: true }); });
document.getElementById('collapseAll').addEventListener('click', () => { openFolders.clear(); ensurePathOpen(selectedNode.path); renderTree(); });
document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoomLevel + ZOOM_STEP));
document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoomLevel - ZOOM_STEP));
document.getElementById('zoomReset').addEventListener('click', () => setZoom(1));
document.getElementById('workspace').addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); setZoom(zoomLevel + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), { x: e.clientX, y: e.clientY }); }, { passive: false });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeContextMenu(); if (e.ctrlKey && (e.key === '+' || e.key === '=')) { e.preventDefault(); setZoom(zoomLevel + ZOOM_STEP); } if (e.ctrlKey && e.key === '-') { e.preventDefault(); setZoom(zoomLevel - ZOOM_STEP); } if (e.ctrlKey && e.key === '0') { e.preventDefault(); setZoom(1); } if (e.ctrlKey && e.key.toLowerCase() === 'f') { e.preventDefault(); const s = document.getElementById('search'); s.focus(); s.select(); } });
window.addEventListener('resize', closeContextMenu);
document.getElementById('workspace').addEventListener('scroll', closeContextMenu);
document.addEventListener('click', (e) => { if (!e.target.closest('#tree-context-menu')) closeContextMenu(); });

treeMenu = document.getElementById('tree-context-menu');
if (treeMenu) {
  treeMenu.addEventListener('click', (e) => { const item = e.target.closest('button[data-action]'); if (!item || item.disabled) return; if (item.dataset.action === 'find') { closeContextMenu(); const s = document.getElementById('search'); s.focus(); s.select(); } });
}

ensurePathOpen(selectedNode.path);
renderTree();
renderWorkspace();
setZoom(1);
