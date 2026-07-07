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
- `index.html`: statisches Shell-Layout (Titelzeile, Ribbon, Toolbar, Sidebar, Workspace, Statusleiste) + zentrales SVG-Icon-Sprite.
- `assets/js/app.js`: Tree-Aufbau, Suchindex, Search-State, Rendering, Eventhandling, Zoom, Statusleisten-Statistik, Suchverlauf (`localStorage`).
- `assets/css/myexam-cockpit.css`: Workstation-Styling, Tree, Search, Programmansicht, Folder-Listen, Statusleiste, Suchverlauf-Dropdown.
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
- Zoomstufe wird in der Toolbar zwischen den Lupen-Buttons live angezeigt (`#zoomLevel`); Klick darauf setzt auf 100 % zurück (äquivalent zu `Ctrl+0`).

### 9.6 Statusleiste
- Aktiv unten in der App (`#status`, `aria-live="polite"`), zeigt je nach Auswahl:
  - **Programm ausgewählt:** vollständiger Pfad + je Lane Sequenzanzahl und Gesamtdauer.
  - **Ordner ausgewählt:** vollständiger Pfad + Anzahl Unterordner, Anzahl direkter Programme, Gesamtanzahl Programme im Unterbaum.
  - **Aktive Suche:** zusätzlich `Treffer: n` (Gesamttrefferzahl aus dem Search-State).
- Sequenz-/Zeitberechnung pro Lane (`computeProgramLaneStats`) folgt dem **Decision-Default-Pfad**: Bei jeder Decision wird nur die Spalte gezählt, deren Label dem `default`-Wert entspricht (normalisiert); gibt es keine passende Spalte (z. B. Default „Nein“ ohne gleichnamige Spalte), tragen deren Unterblöcke bewusst nichts zur Summe bei.
- Als **Sequenz** zählt ausschließlich eine `row` mit **Name UND Zeitangabe** – reine Aktionsschritte ohne Scanzeit (z. B. „Kontrastmittel“, „MPR-Planung“, „MPR-Planung t“, „Autom. Start MR …“, „auf Gehirn zentrieren“) haben zwar einen sichtbaren Namen, sind aber keine Messsequenzen und fließen bewusst weder in die Zählung noch in die Zeitsumme ein. Leere/`spacer`-Blöcke zählen ebenfalls nie mit.
- Zeiten werden aus `mm:ss`-Strings addiert und als `m:ss` bzw. `h:mm:ss` (`formatSecondsAsDuration`) formatiert – ohne Einheiten-Suffix, konsistent mit der bestehenden Zeitanzeige in den Sequenzzeilen (`.rtime`).
- Deutsche Pluralregeln werden korrekt angewendet (`pluralDe`): „1 Sequenz“ vs. „6 Sequenzen“, „1 Programm gesamt“ vs. „42 Programme gesamt“.

### 9.7 Suchverlauf
- Persistiert in `localStorage` (`myexamSearchHistory_v1`, max. 10 Einträge, neueste zuerst, Duplikate case-/separator-tolerant dedupliziert).
- Dropdown unter dem Suchfeld (`#searchHistory`) öffnet bei Fokus (zeigt volle Historie) bzw. während der Eingabe (gefiltert auf Teiltreffer, exakte Übereinstimmung mit dem aktuellen Text wird ausgeblendet).
- Bedienung: Maus-Klick übernimmt einen Eintrag; `↑`/`↓` wandert durch die Liste **inklusive** dem abschließenden „Verlauf löschen“-Eintrag (voller Tastatur-/Maus-Gleichlauf, kein rein mausbedienbares Element); `Enter` übernimmt den aktiven Eintrag bzw. löscht den Verlauf, wenn „Verlauf löschen“ aktiv markiert ist (oder navigiert wie gehabt zum ersten Suchtreffer, falls kein Eintrag aktiv ist); `Escape` schließt zunächst nur das Dropdown, ein zweites `Escape` löscht danach wie gewohnt die Suche.
- „Verlauf löschen“ (Maus oder Tastatur) leert die Liste sofort und dauerhaft (`localStorage`) und zeigt danach den Hinweis „Kein Suchverlauf vorhanden.“ im weiterhin geöffneten Dropdown.
- Vollständige ARIA-Kopplung: Suchfeld ist `role="combobox"`, Dropdown ist `role="listbox"` mit `role="option"`-Einträgen; `aria-activedescendant` verweist stets auf den per Tastatur aktiven Eintrag.
- Neue Einträge werden bei jeder erfolgreichen Sucheingabe-Navigation gespeichert: `Enter` mit Treffer, Klick auf einen Tree-Knoten während aktiver Suche, Klick auf eine Zeile in der Ordner-Flachliste während aktiver Suche.

## 10) Visuelle Gestaltung
- dunkles Grundtheme, orange Lane-Akzente, gelbe Suchakzente.
- kompakte Tree-Reihen, klare Trennlinien, keine Card-UI im rechten Ordnerbereich.
- keine doppelten Pseudo-Icons (Tree-Icons konsolidiert).
- einheitliches SVG-Icon-System: ein zentrales `<symbol>`-Sprite in `index.html` (Fenstersteuerung, Bearbeiten-Stift, Häkchen, Suchverlauf, Papierkorb) sowie CSS-Masken für rein dekorative Symbole (Baum-Chevrons, Dropdown-Pfeil, Pill-Symbol) ersetzen alle früheren Text-/Unicode-Glyphen (`✓`, `✎`, `×`, `▸`, `▾`, `▶`, `?`, `▢`).

### 10.1 Detail-Politur (Icons, Selektion, Empty-States, Mobile)
- **Tree-Icons vereinheitlicht:** Die Explorer-Baum-Icons (`.node-icon.folder-icon`/`.program-icon`) nutzten zuvor stumpfe einfarbige Rechtecke, während dieselben Ordner/Programme in der rechten Flachlisten-Ansicht (`.folder-content-icon`) ein plastisches gelbes Ordner- bzw. helles Dokument-Symbol erhielten. Beide Darstellungen sind jetzt identisch (gleiches Gradient/Clip-Path), sodass Baum und Flachliste dieselbe Formsprache für dieselbe Entität zeigen.
- **Selektions-Akzent:** Ausgewählte Baumknoten und fokussierte Ordner-Flachlisten-Zeilen erhalten zusätzlich zum Hell/Dunkel-Wechsel eine orangene Kennlinie links (`box-shadow: inset 3px 0 0 var(--orange2)`), konsistent mit dem Lane-/Highlight-Akzent des restlichen UIs.
- **Empty-States überarbeitet:** „Keine Treffer.“ (Baum) und „Keine Treffer für „…“.“ (Workspace) waren zuvor unzentrierter, gewichtsloser Fließtext im leeren Raum. Beide zeigen jetzt ein zentriertes Lupen-Symbol und sind vertikal in ihrem verfügbaren Bereich zentriert (Flexbox-Höhenmodell über `.workspace`/`.program-wrap`, nicht über unzuverlässige `height:100%`-Prozentwerte ohne definierten Elternkontext).
- **Suchverlauf-Dropdown:** sanftes Einblenden (`@keyframes searchHistoryIn`, 100 ms) statt hartem Pop-in; Farbe des „Verlauf löschen“-Eintrags nutzt jetzt `var(--orange2)` statt eines bisherigen, isolierten Amber-Tons – ein einheitlicher Akzentfarbwert für die gesamte App.
- **Toolbar-Konsistenz:** Zoomstufen-Anzeige (`#zoomLevel`) ist jetzt genauso eckig (`border-radius:0`) wie ihre Geschwister-Buttons; deaktivierte Toolbar-/Bearbeiten-Icons sind von `opacity:.38` auf `.5` angehoben (weiterhin klar als Read-only erkennbar, aber nicht mehr nahezu unsichtbar).
- **Mobile-Layout repariert:** Zwei sich widersprechende `@media (max-width:680px)`-Regeln (eine blendete die Sidebar aus, eine spätere zeigte sie wieder an) führten zu einem zusammengequetschten, kaum bedienbaren Layout. Jetzt eine einzige konsolidierte Regel: Sidebar oben (mit eigenem Scrollbereich, `minmax(160px, 38vh)`), Workspace darunter, beide vollbreit nutzbar.

### 10.2 Kollisionsschutz innerhalb von Sequenz-/Decision-Kästchen
Sequenzname, Zeit, Badge und Pill-Label (z. B. „Basic Decision“, „MPR Assignment“) sitzen in festen Reihen mit begrenzter Breite (Lane-/Branch-Spalten sind teils nur ~⅓ der Programmbreite). Ein Vollaudit über alle 60 Programme sowie ein Stresstest mit synthetisch überlangen Texten (4 Branch-Spalten, absichtlich zu lange Namen/Pills/Defaults) deckte auf, dass einzelne Elemente bei ausreichend langem Text **strukturell** hätten kollidieren können, auch wenn die aktuellen Echtdaten (noch) knapp passen:
- `.dropdown` (Decision-Default-Anzeige, z. B. „Mikroadenom (inkl. Dynamik)“) hatte keinerlei Overflow-Schutz und wuchs mit dem Text unbegrenzt, während die danebenliegende `.pill` `flex-shrink:0` hatte – bei nur wenig längerem Text wäre eine Kollision unausweichlich gewesen.
- `.branch-head` (Spaltenüberschrift im Decision-Branch-Grid) hatte kein `text-overflow:ellipsis`, ein zu langes Label hätte optisch in die Nachbarspalte hineinlaufen können.
- `.decision-title` hatte kein `white-space:nowrap`, ein zu langer Titel hätte auf zwei Zeilen umgebrochen und in die Branch-Grid-Zeile darunter bluten können (keine Höhenbegrenzung mit Overflow-Schutz).
- `.pill` und `.badge` hatten `flex-shrink:0` ohne jede Ellipsis-Absicherung.

Behoben durch strukturelle (nicht nur kosmetische) Absicherung: `.dropdown` besitzt jetzt `max-width:60%` mit innerem `.dropdown-text` (Ellipsis); `.pill` ist auf `flex:0 1 auto` mit innerem `.pill-text` (Ellipsis) umgestellt, das feste Kreis-/Dreieck-Icon bleibt via `flex-shrink:0` unverändert; `.badge` hat `max-width` + Ellipsis als Sicherheitsnetz; `.branch-head` und `.decision-title` erhielten `overflow:hidden`/`text-overflow:ellipsis`/`white-space:nowrap`. `.row-bot`/`.dq-bot` haben zusätzlich ein garantiertes `gap:8px`, damit auch im Extremfall ein Mindestabstand bestehen bleibt. Alle trunkierten Elemente tragen ein `title`-Attribut mit dem vollständigen Text (Tooltip bei Hover). Damit ist die Kollisionsfreiheit **unabhängig von zukünftigen Datenänderungen strukturell garantiert**, nicht nur für den aktuellen Datenstand empirisch geprüft.

## 11) Accessibility-Basics
- Suchfeld mit `title` und `aria-label`.
- Tree-Container mit `role="tree"` und sprechendem Label.
- Knoten sind fokussierbar und mit `aria-selected`/`aria-expanded` versehen.
- Suchfeld ist als `role="combobox"` mit `aria-expanded`/`aria-controls` an das Suchverlauf-Listbox-Popup gekoppelt.
- Statusleiste ist eine `aria-live="polite"`-Region.

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
- Statusleiste bei Programm-/Ordnerauswahl sowie bei aktiver Suche prüfen (Pfad, Sequenzzahl, Zeit, Treffer).
- Suchverlauf prüfen: Speichern bei Enter/Klick, Filterung, Tastaturnavigation, Escape-Reihenfolge (erst Dropdown, dann Suche), „Verlauf löschen“.
- Zoomstufen-Anzeige und Reset per Klick prüfen.
- Tree-Icons (Ordner/Programm) auf visuelle Übereinstimmung mit den Flachlisten-Icons prüfen.
- Mobile-Layout (≤680px) prüfen: Sidebar oben, Workspace darunter, beide bedienbar.
- Kollisionsfreiheit in Sequenz-/Decision-Kästchen prüfen: Name/Zeit/Badge/Pill/Dropdown dürfen sich bei langen Texten nie überlagern, sondern müssen ellipsieren (`…`).

## 15) Wartungshinweise
- Neue Suchfelder nur hinzufügen, wenn sie auch sichtbar gerendert werden.
- Keine neuen ad-hoc-Filter in Renderfunktionen; immer über Search-State gehen.
- CSS-Änderungen gruppiert und ohne neue Override-Wüste pflegen.
- Sicherheitsprinzipien (Escaping/Regex-Schutz) bei jeder UI-Erweiterung beibehalten.
