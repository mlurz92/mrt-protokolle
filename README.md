# mrt-protokolle – vollständige Anwendungsdokumentation

## 1) Produktzweck
`mrt-protokolle` ist eine statische Web-Anwendung, die eine Siemens-myExam-Cockpit-/FLEET-ähnliche Explorations- und Suchbedienung für MRT-Protokolle emuliert. Der Schwerpunkt liegt nicht auf „modernem Webdesign“, sondern auf einer dichten, funktionalen Workstation-UX: schnelle Navigation, präzise Trefferkontexte, visuelle Stabilität und reproduzierbares Bedienverhalten.

## 2) Leitprinzipien der UX
- **Kompakte technische Darstellung** (kleine Zeilen, klare Raster, geringe Abstände).
- **Persistenter Suchmodus** statt temporärem Filter-Overlay.
- **Hierarchischer Kontext bleibt erhalten** (Tree mit Parent-Pfaden, rekursiven Counts, selektionssicherem Verhalten).
- **Sichtbare und nachvollziehbare Treffer** (gelbe Inline-Highlights + gelbe `[n]`-Zählungen).
- **Sichere Textverarbeitung** (Escaping, Regex-Schutz, keine unkontrollierte HTML-Injektion).

## 3) Technische Architektur
### 3.1 Laufzeitmodell
Die Anwendung arbeitet vollständig im Browser und benötigt kein Build-System.

### 3.2 Kernmodule
- `index.html`: statisches Shell-Layout (Titelzeile, Ribbon, Toolbar, Sidebar, Workspace).
- `assets/js/app.js`: Tree-Aufbau, Suchindex, Search-State, Rendering, Eventhandling, Zoom.
- `assets/css/myexam-cockpit.css`: Workstation-Styling, Tree, Search, Programmansicht, Folder-Listen.
- `data/protocol-database.js`: bindet `window.MYEXAM_PROTOCOL_DATABASE` ein.
- `data/protocol-database.json`: medizinische Rohdaten (Protokolle + Specs).

## 4) Datenstruktur und Ableitungen
### 4.1 Primärdaten
- `protocols[]`: Programmliste mit Pfad und Anzeigebezeichner.
- `specs{}`: Detaildefinition pro Programmpfad (Lanes, Blocks, Decisions, Labels, usw.).

### 4.2 Laufzeit-Ableitungen
- `byPath`: O(1)-Zugriff auf Programme per Pfad.
- `treeRoot`: hierarchischer Explorer-Baum aus `protocols`.
- `allNodes`: flache Knotenliste für globale Suchauswertung.
- `searchIndex`: vorindizierte, sichtrelevante Textfelder pro Programm.

## 5) Suchsystem im Detail
### 5.1 Normalisierung
- `normalizeBasic`: lower-case, Unicode-Normalisierung, Diakritika entfernt, Whitespace vereinheitlicht.
- `normalizeLoose`: zusätzliche Separator-Toleranz (`-`, `_`, `.`, `/`, Leerzeichen).

### 5.2 Indexierte Felder
- Programmpfad, Programmname, Pfadsegmente.
- Lane-Titel.
- Blockfelder: `name`, `time`, `pill`, `badge`, `text`, `q`, `title`, `default`.
- Decision-Spalten: `label`, `title`, `text` + rekursive Unterblöcke.
- Spacer-Blöcke werden bewusst nicht gezählt.

### 5.3 Search-State
Der Zustand enthält:
- Query-Varianten (`raw`, `display`, `basic`, `loose`, `active`).
- Programmtreffer inkl. Trefferfeldern und Count.
- Rekursive Ordneraggregation.
- Direkte Folder-Namensmatches.
- Sichtbare Pfade (`visiblePaths`) für den Suchbaum.
- Gesamttreffer + erster Programmtreffer für Enter-Navigation.

### 5.4 Cache
Suchen werden über `lastSearchRaw`/`lastSearchState` gecacht und bei Eingabeänderung zuverlässig invalidiert.

## 6) Trefferzählung und Sichtbarkeit
- Program-Count: Summe der logischen Trefferfelder im jeweiligen Programm.
- Folder-Count: rekursiv aggregierte Summe aller Programmtreffer im Unterbaum.
- Direkter Foldername-Match erzeugt Sichtbarkeit auch ohne Unterbaumtreffer.
- Sichtbarkeit im Suchmodus basiert auf `visiblePaths`, nicht auf pauschalen Kind-Existenz-Heuristiken.

## 7) Rendering-Logik
### 7.1 Tree
- Normalmodus: `openFolders` + Selection-Vererbung.
- Suchmodus: nur relevante Hierarchie, automatische Öffnung relevanter Pfade, gelbe Counts.
- ARIA-Grundsemantik: `role="tree"` und `role="treeitem"`.

### 7.2 Workspace
- Programmknoten: vollständige Programmansicht.
- Ordnerknoten: flache, volle rechte Liste mit direkten Kindern.
- Aktive Suche ohne Treffer: kompakter Empty-State.

### 7.3 Programmanzeige
- Lanes bleiben vollständig sichtbar; Suche blendet keine Sequenzen aus.
- Treffer werden nur visuell markiert.
- Decision- und Branch-Strukturen bleiben intakt.

## 8) Highlighting und Sicherheit
- Markierung über `<mark>` mit gelbem Workstation-Farbton.
- Eingaben werden via `escapeRegExp` regex-sicher verarbeitet.
- Sichttexte werden über `esc(...)` HTML-escaped.
- Keine unescaped Datenbanktexte in `innerHTML`.

## 9) Interaktionsmodell
### 9.1 Sucheingabe
- Live-Update von Search-State, Tree, Workspace, Selection-Reconciliation.

### 9.2 Clear-X
- löscht Query, entfernt Suchmodus, rendert beide Bereiche neu, Fokus bleibt im Feld.

### 9.3 Escape
- mit Suchtext: löscht Suche und aktualisiert UI.
- ohne Suchtext: entfernt Fokus vom Suchfeld.

### 9.4 Enter
- öffnet den ersten logischen Programmtreffer aus dem Search-State.

### 9.5 Shortcuts
- `Ctrl+F` und `Ctrl+E`: Fokus + Selektieren des Suchtexts.
- `Ctrl++`, `Ctrl+-`, `Ctrl+0`: Zoomsteuerung.

## 10) Visuelle Gestaltung
- dunkles Grundtheme, orange Lane-Akzente, gelbe Suchakzente.
- kompakte Tree-Reihen, klare Trennlinien, keine Card-UI im rechten Ordnerbereich.
- keine doppelten Pseudo-Icons (Tree-Icons konsolidiert).

## 11) Accessibility-Basics
- Suchfeld mit `title` und `aria-label`.
- Tree-Container mit `role="tree"` und sprechendem Label.
- Knoten sind fokussierbar und mit `aria-selected`/`aria-expanded` versehen.

## 12) Nicht-Ziele
- keine Framework-Migration (React/Vue/Svelte).
- keine externen UI-Libraries.
- keine medizinischen Datenänderungen.
- keine helle Dashboard-Umgestaltung.

## 13) Lokaler Start
```bash
python3 -m http.server 8000
```
Aufruf im Browser: `http://localhost:8000`

## 14) Prüf- und QA-Checkliste
- App startet ohne JS-Fehler.
- Leere Suche: normaler Tree/Workspace ohne Highlights.
- `dark-fluid`, `dark fluid`, `darkfluid`, `dark_fluid` prüfen.
- Sonderzeichen (`+`, `[]`, `?`, `*`, `^`, `$`, `|`, `/`) prüfen.
- Clear/Escape/Enter prüfen.
- Klickpfade in Tree und Folderliste prüfen.
- Empty-State prüfen.
- Zoom/Responsive Breiten prüfen.

## 15) Wartungshinweise
- Neue Suchfelder nur hinzufügen, wenn sie auch sichtbar gerendert werden.
- Keine neuen ad-hoc-Filter in Renderfunktionen; immer über Search-State gehen.
- CSS-Änderungen gruppiert und ohne neue Override-Wüste pflegen.
- Sicherheitsprinzipien (Escaping/Regex-Schutz) bei jeder UI-Erweiterung beibehalten.
