/* ============================================================
   myExam Cockpit Explorer – Application Logic
   Siemens MAGNETOM Prisma Fit · UI-Nachbildung
   Requires: data/protocol-database.js loaded before this file.
   ============================================================ */

'use strict';

/* ---- Daten-Initialisierung -------------------------------- */

const DATA = window.MYEXAM_PROTOCOL_DATABASE;
if (!DATA) throw new Error('MYEXAM_PROTOCOL_DATABASE wurde nicht geladen.');

const protocols  = DATA.protocols;
const specs      = DATA.specs;
const byPath     = Object.fromEntries(protocols.map(p => [p.path, p]));

let selectedPath = protocols[0].path;
let openFolders  = new Set(['Kopf', 'Kopf > Standard', 'Wirbelsäule', 'Wirbelsäule > HWS']);
let activeView   = 'basic'; // 'patient' | 'basic'

/* ---- Zoom ------------------------------------------------- */

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
let zoomLevel = 1.0;

function _zoomIndex() {
  let best = 0, minD = Infinity;
  ZOOM_STEPS.forEach((z, i) => { const d = Math.abs(z - zoomLevel); if (d < minD) { minD = d; best = i; } });
  return best;
}

function applyZoom() {
  document.getElementById('program').style.zoom = String(zoomLevel);
  document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100) + '%';
  // en/disable buttons
  document.getElementById('zoomOut').disabled = zoomLevel <= ZOOM_STEPS[0];
  document.getElementById('zoomIn').disabled  = zoomLevel >= ZOOM_STEPS[ZOOM_STEPS.length - 1];
}

function zoomIn()    { const i = _zoomIndex(); if (i < ZOOM_STEPS.length - 1) { zoomLevel = ZOOM_STEPS[i + 1]; applyZoom(); } }
function zoomOut()   { const i = _zoomIndex(); if (i > 0)                     { zoomLevel = ZOOM_STEPS[i - 1]; applyZoom(); } }
function resetZoom() { zoomLevel = 1.0; applyZoom(); }

/* ---- Hilfsfunktionen -------------------------------------- */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
  ));
}

function norm(s) {
  return String(s ?? '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function textOfBlocks(blocks) {
  const out = [];
  (blocks || []).forEach(b => {
    out.push(b.name, b.text, b.q, b.default, b.title, b.label, b.time, b.pill, b.badge, b.note);
    if (b.cols) b.cols.forEach(c => { out.push(c.label); out.push(textOfBlocks(c.blocks)); });
  });
  return out.filter(Boolean).join(' ');
}

function searchable(p) {
  const s = specs[p.path] || {};
  return norm([
    p.path, p.name, p.group, p.source, p.notes,
    s.title, s.photo, s.notes,
    textOfBlocks((s.lanes || []).flatMap(l => l.blocks || [])),
    textOfBlocks(s.blocks || [])
  ].join(' '));
}

/* ---- SVG: Patienten-Icon ---------------------------------- */

const PERSON_SVG =
  '<svg class="seq-icon" viewBox="0 0 12 18" width="10" height="15" ' +
  'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  // Kopf
  '<circle cx="6" cy="3" r="2.1" fill="currentColor"/>' +
  // Körper
  '<path d="M3.5 5.2 h5 l-0.7 5.3 H4.2 z" fill="currentColor"/>' +
  // Arme
  '<line x1="3.5" y1="7" x2="1" y2="9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
  '<line x1="8.5" y1="7" x2="11" y2="9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
  // Beine
  '<line x1="4.2" y1="10.5" x2="3" y2="16.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
  '<line x1="7.8" y1="10.5" x2="9" y2="16.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
  '</svg>';

/* ---- Baum ------------------------------------------------- */

function buildTree() {
  const root = { name: 'FLEET', path: '', children: new Map(), item: null };
  protocols.forEach(p => {
    let node = root;
    const parts = p.path.split(' > ');
    parts.forEach((part, i) => {
      const full = parts.slice(0, i + 1).join(' > ');
      if (!node.children.has(part))
        node.children.set(part, { name: part, path: full, children: new Map(), item: null });
      node = node.children.get(part);
      if (i === parts.length - 1) node.item = p;
    });
  });
  return root;
}
const treeRoot = buildTree();

function branchMatches(node, q) {
  if (!q) return true;
  if (node.item) return searchable(node.item).includes(q);
  for (const child of node.children.values()) if (branchMatches(child, q)) return true;
  return norm(node.name).includes(q);
}

function renderTree() {
  const searchEl = document.getElementById('search');
  const q = norm(searchEl.value.trim());
  let hits = 0;
  const html = [];

  function rec(node, level) {
    for (const child of node.children.values()) {
      const isItem = !!child.item;
      if (!branchMatches(child, q)) continue;
      const direct = q && (
        isItem ? searchable(child.item).includes(q) : norm(child.name).includes(q)
      );
      const open = q
        || openFolders.has(child.path)
        || child.path === selectedPath
        || selectedPath.startsWith(child.path + ' > ');

      if (isItem) {
        hits++;
        html.push(
          `<div class="node item${child.path === selectedPath ? ' selected' : ''}${direct ? ' search-hit' : ''}" ` +
          `style="--level:${level}" data-path="${esc(child.path)}">${esc(child.name)}</div>`
        );
      } else {
        html.push(
          `<div class="node folder${open ? ' open' : ''}${direct ? ' search-hit' : ''}" ` +
          `style="--level:${level}" data-folder="${esc(child.path)}">${esc(child.name)}</div>`
        );
        if (open) rec(child, level + 1);
      }
    }
  }
  rec(treeRoot, 0);

  const treeEl = document.getElementById('tree');
  treeEl.innerHTML = html.length
    ? html.join('')
    : '<div class="no-results">Keine Treffer.<br>Suchbegriff prüfen oder zurücksetzen.</div>';

  document.getElementById('searchCount').textContent = q
    ? String(hits)
    : String(protocols.length);

  // Events: Ordner auf/zu
  treeEl.querySelectorAll('.node.folder').forEach(el => {
    el.addEventListener('click', () => {
      const p = el.dataset.folder;
      if (openFolders.has(p)) openFolders.delete(p); else openFolders.add(p);
      renderTree();
    });
  });

  // Events: Protokoll auswählen
  treeEl.querySelectorAll('.node.item').forEach(el => {
    el.addEventListener('click', () => {
      selectedPath = el.dataset.path;
      treeEl.querySelectorAll('.node.item.selected').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      el.scrollIntoView({ block: 'nearest' });
      renderProgram();
    });
  });
}

/* ---- Spec-Normalisierung ---------------------------------- */

const PILL_KINDS = new Set([
  'MPR Assignment', 'MPR Planning', 'Basic Decision', 'AutoAlign Scout',
  'Spine Scout', 'Spine Positioning', 'Spine Verification', 'Generic Views',
  'Spectroscopy', 'Advanced Application', 'Morpho'
]);

function rowFromArray(a) {
  const [, , name, time, kind, note] = a;
  return {
    t: 'row',
    name,
    time: time || '',
    pill: PILL_KINDS.has(kind) ? kind : '',
    note: note || ''
  };
}

function fallbackSpec(p) {
  const laneMap = new Map();
  (p.rows || []).forEach(r => {
    const br = r[1] || p.name;
    if (!laneMap.has(br)) laneMap.set(br, []);
    laneMap.get(br).push(rowFromArray(r));
  });
  if (laneMap.size > 1) return {
    width: Math.min(1400, Math.max(400, laneMap.size * 340)),
    layout: 'lanes',
    title: p.name,
    lanes: [...laneMap.entries()].map(([title, blocks], i) => ({ title, check: i === 0, blocks }))
  };
  return {
    width: 380,
    layout: 'single',
    title: p.name,
    blocks: (p.rows || []).map(rowFromArray)
  };
}

function normalizeSpec(spec, p) {
  if (!spec) return fallbackSpec(p);
  if (spec.lanes) return spec;
  if (spec.blocks) return {
    ...spec,
    lanes: [{ title: spec.title || p.name, check: true, blocks: spec.blocks }],
    width: spec.width || 380
  };
  return fallbackSpec(p);
}

/* ---- Programm-Rendering ----------------------------------- */

function renderProgram() {
  const p = byPath[selectedPath] || protocols[0];
  selectedPath = p.path;
  const s = normalizeSpec(specs[p.path], p);
  const el = document.getElementById('program');
  const lanes = s.lanes || [];
  const frameWidth = s.width || Math.max(380, lanes.length * 320);

  // Spalten-Template: weights oder gleichmäßige fr-Anteile
  const cols = lanes.length
    ? lanes.map(l => l.weight ? l.weight + 'fr' : '1fr').join(' ')
    : '1fr';

  // Breadcrumb-Pfad
  const pathText = 'FLEET » ' + p.path.replace(/ > /g, ' » ');

  el.innerHTML =
    `<div class="pathline">` +
      `<span class="path-text">${esc(pathText)}</span>` +
      `<span class="edit" title="Bearbeiten">✎</span>` +
    `</div>` +
    `<div class="program-frame" style="--pw:${frameWidth}px">` +
      `<div class="viewtabs">` +
        `<span data-view="patient"${activeView === 'patient' ? ' class="active"' : ''}>Patient View</span>` +
        `<span data-view="basic"${activeView === 'basic'   ? ' class="active"' : ''}>Basic Patient View</span>` +
      `</div>` +
      `<div class="lanes" style="--cols:${cols}">` +
        lanes.map(renderLane).join('') +
      `</div>` +
    `</div>`;

  // Tab-Wechsel
  el.querySelectorAll('.viewtabs span').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.viewtabs span').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeView = tab.dataset.view;
    });
  });

  // Statuszeile bei Hover
  const st = document.getElementById('status');
  const baseStatus = `${p.path} · ${lanes.length} Spalte${lanes.length !== 1 ? 'n' : ''}`;

  el.querySelectorAll('.row').forEach(r => {
    r.addEventListener('mouseenter', () => {
      const parts = [r.dataset.name, r.dataset.time, r.dataset.pill].filter(Boolean);
      st.textContent = parts.length ? 'Sequenz: ' + parts.join(' · ') : baseStatus;
    });
    r.addEventListener('mouseleave', () => { st.textContent = baseStatus; });
  });

  st.textContent = baseStatus;
  applyZoom(); // Zoom neu anwenden nach DOM-Update
}

/* ---- Lane ------------------------------------------------- */

function renderLane(l) {
  return (
    `<section class="lane">` +
      `<div class="lane-head">` +
        (l.check ? '<span class="tick">✓</span>' : '') +
        esc(l.title || 'Standard') +
      `</div>` +
      `<div class="flow">${renderBlocks(l.blocks || [])}</div>` +
    `</section>`
  );
}

/* ---- Blöcke ----------------------------------------------- */

function renderBlocks(blocks) {
  return (blocks || []).map(renderBlock).join('');
}

function renderBlock(b) {
  if (!b) return '';

  switch (b.t) {
    case 'spacer':
      return `<div class="spacer" style="height:${(b.n || 1) * 39}px"></div>`;

    case 'label':
      // orange: explizit gesetzt oder tone-Feld
      return `<div class="label${b.tone === 'orange' ? ' orange' : ''}">${esc(b.text || '')}</div>`;

    case 'decision':
      return renderDecision(b);

    default:
      return renderRow(b);
  }
}

/* ---- Sequenzzeile ----------------------------------------- */

function renderRow(b) {
  const blank  = !b.name;
  const pill   = b.pill   ? `<span class="pill">${esc(b.pill)}</span>`   : '';
  const badge  = b.badge  ? `<span class="badge">${esc(b.badge)}</span>` : '';
  const name   = blank ? '' : esc(b.name);
  const title  = [b.name, b.time, b.pill, b.note].filter(Boolean).join(' · ');

  return (
    `<div class="row${blank ? ' blank' : ''}" ` +
      `data-name="${esc(b.name || '')}" ` +
      `data-time="${esc(b.time || '')}" ` +
      `data-pill="${esc(b.pill || '')}" ` +
      `title="${esc(title)}">` +
      `<div class="row-top">` +
        `<span class="rname${blank ? ' rblank' : ''}">${name}</span>` +
        (b.time ? `<span class="rtime">${esc(b.time)}</span>` : '') +
      `</div>` +
      `<div class="row-bot">` +
        `<div class="ricons">${PERSON_SVG}${badge}</div>` +
        pill +
      `</div>` +
    `</div>`
  );
}

/* ---- Decision-Block --------------------------------------- */

function renderDecision(d) {
  const cols = d.cols || [];

  const qRow =
    `<div class="decision-q">` +
      `<div class="dq-top"><span class="qtext">${esc(d.q || 'Decision')}</span></div>` +
      `<div class="dq-bot">` +
        `<span class="dropdown">${esc(d.default || 'Nein')}</span>` +
        `<span class="pill">Basic Decision</span>` +
      `</div>` +
    `</div>`;

  const titleBar =
    `<div class="decision-title">${esc(d.title || d.q || 'Decision')}</div>`;

  const branchGrid = cols.length
    ? `<div class="branch-grid" style="--bcols:${cols.length}">` +
        cols.map(c =>
          `<div class="branch">` +
            `<div class="branch-head">${esc(c.label || '')}</div>` +
            renderBlocks(c.blocks || []) +
          `</div>`
        ).join('') +
      `</div>`
    : '';

  return qRow + titleBar + branchGrid;
}

/* ---- Tastaturkürzel --------------------------------------- */

document.addEventListener('keydown', e => {
  const searchEl = document.getElementById('search');
  const onSearch = document.activeElement === searchEl;

  // Strg++ / Strg+= → Zoom in
  if (e.ctrlKey && (e.key === '+' || e.key === '=' || e.key === 'Add')) {
    e.preventDefault(); zoomIn(); return;
  }
  // Strg+- → Zoom out
  if (e.ctrlKey && (e.key === '-' || e.key === 'Subtract')) {
    e.preventDefault(); zoomOut(); return;
  }
  // Strg+0 → Zoom reset
  if (e.ctrlKey && e.key === '0') {
    e.preventDefault(); resetZoom(); return;
  }
  // Strg+F → Suche fokussieren
  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault(); searchEl.focus(); searchEl.select(); return;
  }
  // Escape → Suche leeren / Fokus weg
  if (e.key === 'Escape') {
    if (onSearch && searchEl.value) { searchEl.value = ''; renderTree(); }
    else searchEl.blur();
    return;
  }
  // Enter im Suchfeld → erstes Ergebnis auswählen
  if (e.key === 'Enter' && onSearch) {
    const first = document.querySelector('.node.item');
    if (first) first.click();
    return;
  }
});

// Strg+Scroll im Workspace → Zoom
document.getElementById('workspace').addEventListener('wheel', e => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  if (e.deltaY < 0) zoomIn(); else zoomOut();
}, { passive: false });

/* ---- Button-Events ---------------------------------------- */

document.getElementById('zoomIn').addEventListener('click', zoomIn);
document.getElementById('zoomOut').addEventListener('click', zoomOut);
document.getElementById('zoomLevel').addEventListener('dblclick', resetZoom);

document.getElementById('search').addEventListener('input', renderTree);

document.getElementById('clear').addEventListener('click', () => {
  document.getElementById('search').value = '';
  renderTree();
  document.getElementById('search').focus();
});

/* ---- Start ------------------------------------------------ */

renderTree();
renderProgram();
