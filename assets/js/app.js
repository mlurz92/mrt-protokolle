'use strict';

const DATA = window.MYEXAM_PROTOCOL_DATABASE;
if (!DATA) throw new Error('MYEXAM_PROTOCOL_DATABASE wurde nicht geladen.');

const protocols = DATA.protocols;
const specs = DATA.specs;
const byPath = Object.fromEntries(protocols.map((p) => [p.path, p]));

let selectedNode = { type: 'program', path: protocols[0].path };
let openFolders = new Set(['Kopf', 'Kopf > Standard', 'Wirbelsäule', 'Wirbelsäule > HWS']);
let activeView = 'patient';

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
let zoomLevel = 1;

const PERSON_SVG = '<svg class="seq-icon" viewBox="0 0 12 18" width="9" height="14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="6" cy="3" r="2.1" fill="currentColor"/><path d="M3.5 5.2 h5 l-0.7 5.3 H4.2 z" fill="currentColor"/></svg>';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escapeRegExp = (v) => String(v ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeBasic = (v) => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ');
const normalizeLoose = (v) => normalizeBasic(v).replace(/[\s\-_.\/]+/g, '');

const splitPath = (path) => (path ? path.split(' > ') : []);
const getParentPaths = (path) => { const parts = splitPath(path); const out = []; for (let i = 1; i < parts.length; i += 1) out.push(parts.slice(0, i).join(' > ')); return out; };
const getParentFolderPath = (path) => { const parts = splitPath(path); return parts.length > 1 ? parts.slice(0, -1).join(' > ') : ''; };
const ensurePathOpen = (path) => getParentPaths(path).forEach((p) => openFolders.add(p));
const formatDisplayPath = (path) => `FLEET${path ? ` » ${path.replace(/ > /g, ' » ')}` : ''}`;
const isProgramPath = (path) => Boolean(byPath[path]);
const isDescendantProgram = (programPath, folderPath) => !folderPath || programPath.startsWith(`${folderPath} > `);

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

const searchIndex = protocols.map((p, order) => buildProgramSearchIndex(p, order));
let lastSearchRaw = null;
let lastSearchState = null;

function getFolderChildren(path) {
  const prefix = path ? `${path} > ` : '';
  const depth = path ? splitPath(path).length : 0;
  const map = new Map();
  for (const p of protocols) {
    if (path && !p.path.startsWith(prefix)) continue;
    const parts = splitPath(p.path);
    const name = parts[depth];
    if (!name) continue;
    const childPath = parts.slice(0, depth + 1).join(' > ');
    if (!map.has(childPath)) map.set(childPath, { type: parts.length === depth + 1 ? 'program' : 'folder', name, path: childPath });
  }
  return [...map.values()];
}

function collectBlockSearchFields(block, fields) {
  if (!block || typeof block !== 'object') return;
  if (block.t === 'spacer') return;
  [['name', 'sequence-name'], ['time', 'row-time'], ['pill', 'row-pill'], ['badge', 'row-badge'], ['text', 'label-text'], ['q', 'decision-question'], ['title', 'decision-title'], ['default', 'decision-default']].forEach(([k, src]) => {
    if (typeof block[k] === 'string' && block[k].trim()) fields.push({ source: src, text: block[k] });
  });
  for (const col of block.cols || []) {
    [['label', 'decision-branch-label'], ['title', 'decision-branch-title'], ['text', 'decision-branch-text']].forEach(([k, src]) => {
      if (typeof col[k] === 'string' && col[k].trim()) fields.push({ source: src, text: col[k] });
    });
    for (const sub of col.blocks || []) collectBlockSearchFields(sub, fields);
  }
  for (const child of block.blocks || []) collectBlockSearchFields(child, fields);
  for (const child of block.children || []) collectBlockSearchFields(child, fields);
}

function buildProgramSearchIndex(protocol, order) {
  const spec = specs[protocol.path] || {};
  const fields = [
    { source: 'program-name', text: protocol.name },
    { source: 'path', text: protocol.path },
    ...splitPath(protocol.path).map((s) => ({ source: 'path-segment', text: s }))
  ];
  const lanes = spec.lanes || [{ title: spec.title || protocol.name, blocks: spec.blocks || [] }];
  for (const lane of lanes) {
    if (lane.title) fields.push({ source: 'lane-title', text: lane.title });
    for (const block of lane.blocks || []) collectBlockSearchFields(block, fields);
  }
  return { protocol, path: protocol.path, name: protocol.name, order, fields };
}

function fieldMatches(text, state) {
  const basic = normalizeBasic(text);
  const loose = normalizeLoose(text);
  return basic.includes(state.basic) || loose.includes(state.loose);
}

function buildSearchState(raw) {
  const display = String(raw ?? '').trim();
  const basic = normalizeBasic(display);
  const loose = normalizeLoose(display);
  const active = Boolean(basic);
  const state = { raw, display, basic, loose, active, programs: new Map(), programCounts: new Map(), folderCounts: new Map(), folderDirectMatches: new Map(), visiblePaths: new Set(), totalHits: 0, firstProgramPath: null };
  if (!active) return state;

  for (const node of allNodes) {
    const cnt = normalizeBasic(node.name).includes(basic) || normalizeLoose(node.name).includes(loose) ? 1 : 0;
    if (cnt) { state.folderDirectMatches.set(node.path, cnt); state.visiblePaths.add(node.path); getParentPaths(node.path).forEach((p)=>state.visiblePaths.add(p)); }
  }

  for (const entry of searchIndex) {
    let count = 0;
    const hits = [];
    for (const field of entry.fields) {
      if (!field.text) continue;
      if (fieldMatches(field.text, state)) { count += 1; hits.push(field); }
    }
    if (!count) continue;
    state.programs.set(entry.path, { ...entry, hitCount: count, hits });
    state.programCounts.set(entry.path, count);
    state.visiblePaths.add(entry.path);
    state.totalHits += count;
    if (!state.firstProgramPath) state.firstProgramPath = entry.path;
    for (const parent of getParentPaths(entry.path)) {
      state.folderCounts.set(parent, (state.folderCounts.get(parent) || 0) + count);
      state.visiblePaths.add(parent);
    }
  }
  return state;
}

function getCurrentSearchState() {
  const raw = document.getElementById('search')?.value ?? '';
  if (raw === lastSearchRaw && lastSearchState) return lastSearchState;
  lastSearchRaw = raw;
  lastSearchState = buildSearchState(raw);
  return lastSearchState;
}
function invalidateSearchCache() { lastSearchRaw = null; lastSearchState = null; }

function highlightText(text, state) {
  const original = String(text ?? '');
  if (!state?.active || !state.display) return esc(original);
  const escapedQ = escapeRegExp(state.display).replace(/\s+/g, '[\\s_\\-./]*');
  const re = new RegExp(escapedQ, 'ig');
  let out = ''; let last = 0; let match;
  while ((match = re.exec(original)) !== null) {
    if (match.index > last) out += esc(original.slice(last, match.index));
    out += `<mark>${esc(match[0])}</mark>`;
    last = match.index + match[0].length;
    if (match[0].length === 0) re.lastIndex += 1;
  }
  if (!out) return esc(original);
  if (last < original.length) out += esc(original.slice(last));
  return out;
}

function reconcileSelectionWithSearch(state) {
  if (!state.active) return;
  if (selectedNode.type === 'program' && state.programs.has(selectedNode.path)) return;
  if (selectedNode.type === 'folder' && ((state.folderCounts.get(selectedNode.path) || 0) > 0 || state.folderDirectMatches.has(selectedNode.path))) return;
  if (state.firstProgramPath) {
    ensurePathOpen(state.firstProgramPath);
    selectedNode = { type: 'program', path: state.firstProgramPath };
  }
}

function getDisplayCount(path, state, isFolder) {
  if (!state.active) return 0;
  const base = isFolder ? (state.folderCounts.get(path) || 0) : (state.programCounts.get(path) || 0);
  return base || (state.folderDirectMatches.get(path) || 0);
}

function applyZoom() { const p = document.getElementById('program'); if (p) p.style.zoom = String(zoomLevel); const out = document.getElementById('zoomOut'); const zin = document.getElementById('zoomIn'); if (out) out.disabled = zoomLevel <= ZOOM_STEPS[0]; if (zin) zin.disabled = zoomLevel >= ZOOM_STEPS.at(-1); }
function zoom(delta) { const i = ZOOM_STEPS.reduce((b, z, idx) => (Math.abs(z - zoomLevel) < Math.abs(ZOOM_STEPS[b] - zoomLevel) ? idx : b), 0); zoomLevel = ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, i + delta))]; applyZoom(); }

function renderTree() {
  const state = getCurrentSearchState();
  const tree = document.getElementById('tree');
  const html = [];
  const rec = (node, level) => {
    for (const child of node.children.values()) {
      const isItem = Boolean(child.item);
      const count = getDisplayCount(child.path, state, !isItem);
      const visible = !state.active || state.visiblePaths.has(child.path) || count > 0 || (isItem ? false : state.folderDirectMatches.has(child.path));
      if (!visible) continue;
      const open = state.active ? (state.folderCounts.get(child.path) || 0) > 0 || selectedNode.path.startsWith(`${child.path} > `) : openFolders.has(child.path) || selectedNode.path.startsWith(`${child.path} > `);
      const label = highlightText(child.name, state);
      const countHtml = state.active && count > 0 ? `<span class="search-count">[${count}]</span>` : '';
      if (isItem) html.push(`<div class="node item${selectedNode.type === 'program' && selectedNode.path === child.path ? ' selected' : ''}" role="treeitem" aria-selected="${selectedNode.type === 'program' && selectedNode.path === child.path}" tabindex="0" style="--level:${level}" data-path="${esc(child.path)}"><span class="node-spacer"></span><span class="node-icon program-icon"></span><span class="node-label">${label}</span>${countHtml}</div>`);
      else {
        html.push(`<div class="node folder${open ? ' open' : ''}${selectedNode.type === 'folder' && selectedNode.path === child.path ? ' selected' : ''}" role="treeitem" aria-expanded="${open}" aria-selected="${selectedNode.type === 'folder' && selectedNode.path === child.path}" tabindex="0" style="--level:${level}" data-folder="${esc(child.path)}"><span class="node-expander"></span><span class="node-icon folder-icon"></span><span class="node-label">${label}</span>${countHtml}</div>`);
        if (open) rec(child, level + 1);
      }
    }
  };
  rec(treeRoot, 0);
  tree.innerHTML = html.join('') || '<div class="no-results">Keine Treffer.</div>';
  tree.querySelectorAll('.node.folder').forEach((el) => { el.onclick = () => { const p = el.dataset.folder; selectedNode = { type: 'folder', path: p }; if (!state.active) { if (openFolders.has(p)) openFolders.delete(p); else openFolders.add(p); } renderTree(); renderWorkspace(); }; });
  tree.querySelectorAll('.node.item').forEach((el) => { el.onclick = () => { selectedNode = { type: 'program', path: el.dataset.path }; ensurePathOpen(el.dataset.path); renderTree(); renderWorkspace(); }; });
}

function renderRow(b, state) { const blank = !b.name; return `<div class="row${blank ? ' blank' : ''}" title="${esc(blank ? '' : [b.name, b.time, b.pill].filter(Boolean).join(' · '))}"><div class="row-top"><span class="rname${blank ? ' rblank' : ''}">${highlightText(b.name || '', state)}</span>${b.time ? `<span class="rtime">${highlightText(b.time, state)}</span>` : ''}</div><div class="row-bot"><div class="ricons">${blank ? '' : PERSON_SVG}${b.badge ? `<span class="badge">${highlightText(b.badge, state)}</span>` : ''}</div>${b.pill ? `<span class="pill">${highlightText(b.pill, state)}</span>` : ''}</div></div>`; }
function renderBlock(b, state) { if (!b) return ''; if (b.t === 'spacer') return `<div class="spacer" style="--spacer-rows:${Math.max(1, Number(b.n || 1) || 1)}"></div>`; if (b.t === 'label') return `<div class="label${b.tone === 'orange' ? ' orange' : ''}">${highlightText(b.text || '', state)}</div>`; if (b.t === 'decision') { const cols = b.cols || []; return `<div class="decision-q"><div class="dq-top"><span class="qtext">${highlightText(b.q || 'Decision', state)}</span></div><div class="dq-bot"><span class="dropdown">${highlightText(b.default || 'Nein', state)}</span><span class="pill">Basic Decision</span></div></div><div class="decision-title">${highlightText(b.title || b.q || 'Decision', state)}</div><div class="branch-grid" style="--bcols:${cols.length || 1}">${cols.map((c) => `<div class="branch"><div class="branch-head">${highlightText(c.label || '', state)}</div>${(c.blocks || []).map((x) => renderBlock(x, state)).join('')}</div>`).join('')}</div>`; } return renderRow(b, state); }

function renderProgram(state = getCurrentSearchState()) { const p = byPath[selectedNode.path] || protocols[0]; selectedNode = { type: 'program', path: p.path }; const s = specs[p.path]; const lanes = (s?.lanes) || [{ title: s?.title || p.name, check: true, blocks: s?.blocks || [] }]; const w = s?.width || 380; const cols = lanes.map((l) => (l.weight ? `${l.weight}fr` : '1fr')).join(' ');
  document.getElementById('program').innerHTML = `<div class="pathline"><span class="path-text">${highlightText(formatDisplayPath(p.path), state)}</span><span class="edit is-disabled" aria-disabled="true" title="Bearbeiten nicht verfügbar (Read-only)">✎</span></div><div class="program-frame" style="--pw:${w}px"><div class="viewtabs"><span data-view="patient" class="${activeView === 'patient' ? 'active' : ''}">Patient View</span><span data-view="basic" class="${activeView === 'basic' ? 'active' : ''}">Basic Patient View</span></div><div class="lanes" style="--cols:${cols}">${lanes.map((l) => `<section class="lane"><div class="lane-head">${l.check ? '<span class="tick">✓</span>' : ''}${highlightText(l.title || 'Standard', state)}</div><div class="flow">${(l.blocks || []).map((b) => renderBlock(b, state)).join('')}</div></section>`).join('')}</div></div>`;
  applyZoom(); }

function renderFolderContent(path, state = getCurrentSearchState()) {
  const children = getFolderChildren(path);
  document.getElementById('program').innerHTML = `<div class="pathline"><span class="path-text">${highlightText(formatDisplayPath(path), state)}</span><span class="edit is-disabled" aria-disabled="true" title="Bearbeiten nicht verfügbar (Read-only)">✎</span></div><div class="folder-content-view${state.active ? ' search-active' : ''}"><div class="folder-list">${children.map((c) => { const hitCount = getDisplayCount(c.path, state, c.type === 'folder'); const dim = state.active && hitCount === 0 ? ' dim-in-search' : ''; return `<div class="folder-content-row${dim}" data-type="${c.type}" data-path="${esc(c.path)}" tabindex="0"><span class="folder-content-icon ${c.type}"></span><span class="folder-content-name">${highlightText(c.name, state)}${state.active && hitCount > 0 ? ` <span class="search-count">[${hitCount}]</span>` : ''}</span></div>`; }).join('')}</div></div>`;
  document.querySelectorAll('.folder-content-row').forEach((r) => { const open = () => { const type = r.dataset.type; const pathValue = r.dataset.path; selectedNode = { type, path: pathValue }; if (type === 'folder') openFolders.add(pathValue); ensurePathOpen(pathValue); renderTree(); renderWorkspace(); }; r.onclick = open; r.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }; });
}

function renderSearchEmpty(state) { document.getElementById('program').innerHTML = `<div class="pathline"><span class="path-text">${esc(formatDisplayPath(''))}</span></div><div class="search-empty">Keine Treffer für „${esc(state.display)}“.</div>`; }
function renderWorkspace() { const state = getCurrentSearchState(); if (state.active && state.totalHits === 0) return renderSearchEmpty(state); if (selectedNode.type === 'folder' && !isProgramPath(selectedNode.path)) return renderFolderContent(selectedNode.path, state); return renderProgram(state); }

function updateSearchUIAfterQueryChange({ keepFocus = false } = {}) {
  const input = document.getElementById('search');
  document.querySelector('.search-box')?.classList.toggle('has-text', Boolean(input?.value.trim()));
  invalidateSearchCache();
  const state = getCurrentSearchState();
  reconcileSelectionWithSearch(state);
  renderTree();
  renderWorkspace();
  if (keepFocus) input?.focus();
}

function selectFirstSearchResult() {
  const state = getCurrentSearchState();
  if (!state.active || !state.firstProgramPath) return false;
  selectedNode = { type: 'program', path: state.firstProgramPath };
  ensurePathOpen(state.firstProgramPath);
  renderTree();
  renderWorkspace();
  return true;
}

document.getElementById('zoomIn')?.addEventListener('click', () => zoom(1));
document.getElementById('zoomOut')?.addEventListener('click', () => zoom(-1));
document.getElementById('search').addEventListener('input', () => updateSearchUIAfterQueryChange({ keepFocus: false }));
document.getElementById('clear').addEventListener('click', () => { const s = document.getElementById('search'); s.value = ''; updateSearchUIAfterQueryChange({ keepFocus: true }); });
document.getElementById('collapseAll')?.addEventListener('click', () => { openFolders.clear(); ensurePathOpen(selectedNode.path); renderTree(); });

document.addEventListener('keydown', (e) => {
  const se = document.getElementById('search');
  const on = document.activeElement === se;
  if (e.ctrlKey && (e.key === '+' || e.key === '=')) { e.preventDefault(); zoom(1); }
  if (e.ctrlKey && e.key === '-') { e.preventDefault(); zoom(-1); }
  if (e.ctrlKey && e.key === '0') { e.preventDefault(); zoomLevel = 1; applyZoom(); }
  if (e.ctrlKey && (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'e')) { e.preventDefault(); se.focus(); se.select(); }
  if (e.key === 'Escape' && on) { e.preventDefault(); if (se.value.trim()) { se.value = ''; updateSearchUIAfterQueryChange({ keepFocus: true }); } else se.blur(); }
  if (e.key === 'Enter' && on) { e.preventDefault(); selectFirstSearchResult(); }
});

document.getElementById('workspace').addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); zoom(e.deltaY < 0 ? 1 : -1); }, { passive: false });

ensurePathOpen(selectedNode.path);
renderTree();
renderWorkspace();
