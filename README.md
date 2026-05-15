# mrt-protokolle

Vollständige, statische und read-only Web-Anwendung zur Explorer- und Programmansicht von MRT-Protokollen im Stil einer Siemens-myExam-Cockpit-Workstation.

---

## 1) Zweck, Einsatz und Designziel

Diese Anwendung ist ein **kompakter Protokoll-Viewer** für klinische MRT-Programme (Kopf und Wirbelsäule). Sie ist bewusst als **technische Scanner-/Workstation-Oberfläche** gestaltet – nicht als moderne, card-basierte Web-App.

### Kernziele

- schnelle Navigation durch einen Explorer-Baum
- konsistente Darstellung komplexer Sequenzabläufe (Lanes, Rows, Decisions, Labels, Spacer)
- read-only Nutzung ohne Scheineditor-Verhalten
- statischer Offline-Betrieb ohne Build-Tooling, ohne externe Frameworks

### Nicht-Ziele

- kein Persistieren/Bearbeiten von Protokollen
- kein Import/Export-Workflow in der App-Logik
- kein Drag-and-drop-Editor
- keine serverseitige Komponente

---

## 2) Projektstruktur

```text
mrt-protokolle/
├── index.html
├── manifest.json
├── README.md
├── Beispielbild UI.png
├── assets/
│   ├── css/
│   │   └── myexam-cockpit.css
│   └── js/
│       └── app.js
└── data/
    ├── protocol-database.json
    └── protocol-database.js
```

### Dateiverantwortung

- `index.html`: statisches UI-Skelett (Titlebar, Ribbon, Toolbar, Sidebar, Workspace)
- `assets/css/myexam-cockpit.css`: vollständige UI-Optik, Dichte, Farben, Größen, native-like Elemente
- `assets/js/app.js`: Explorer-Navigation, Selektion, Rendering, Suche, Zoom, Tastaturkürzel
- `data/protocol-database.json`: fachlicher Datenbestand
- `data/protocol-database.js`: Runtime-Wrapping auf `window.MYEXAM_PROTOCOL_DATABASE`
- `manifest.json`: Basis-Metadaten der Web-App

---

## 3) Laufzeitmodell und Architektur

Die Anwendung ist **komplett clientseitig**.

1. `protocol-database.js` lädt die Daten in ein globales Objekt.
2. `app.js` validiert die Existenz des Datenobjekts.
3. Daraus wird:
   - eine Lookup-Map nach Pfad (`byPath`)
   - ein Explorer-Baum
   - der initiale Selektionszustand
   aufgebaut.
4. Rendering erfolgt in zwei Modi:
   - **Folder-Content-Area** (Ordnerselektion)
   - **Program-Ansicht** (Programmselektion)

Keine Build-Pipeline, keine Transpilation, keine externen UI-Libs.

---

## 4) Datenmodell (UI-relevant)

### Top-Level

- `protocols[]`: Liste aller Protokolle mit Pfadstruktur (`A > B > C`)
- `specs{}`: visuelle Spezifikation je Protokollpfad

### Blocktypen in Specs

- `row`: Sequenzzeile
- `decision`: Verzweigung mit mehreren Spalten (`cols`)
- `label`: Hinweis-/Textblock
- `spacer`: rasterartige Leerzeilen über `n`

### Entscheidungsknoten

`decision`-Blöcke enthalten typischerweise:

- `q` (Frage)
- `default` (angezeigter Wert)
- `title` (Titelzeile)
- `cols[]` mit `label` + `blocks[]`

---

## 5) Aktueller UI/UX-Stand (vollständig)

## 5.1 Fensterschale

- Titelzeile im Workstation-Stil
- Ribbon-Bereich mit statischen Gruppen
- kompakte Toolbar
- geteilte Hauptfläche:
  - links Sidebar (Fleet + Suche + Tree)
  - rechts Workspace (Ordnerinhalt oder Programmansicht)

## 5.2 Read-only-Affordances

Nicht-funktionale Toolbar-Funktionen sind sichtbar, aber klar deaktiviert:

- `is-disabled`
- `aria-disabled="true"`
- `tabindex="-1"`
- explizite Tooltips „nicht verfügbar (Read-only)“

Damit bleibt die Workstation-Anmutung erhalten, ohne Funktionalität vorzutäuschen.

## 5.3 Explorer und Selektion

Expliziter Selektionszustand:

```js
selectedNode = { type: 'folder' | 'program', path: '...' }
```

Verhalten:

- Klick auf Ordner: ordnerbasierte Content-Area rechts
- Klick auf Programm: Programmansicht rechts
- übergeordnete Pfade bleiben geöffnet (`ensurePathOpen`)

## 5.4 Folder-Content-Area

Bei Ordnerselektion wird rechts eine flache Inhaltsliste gerendert:

- direkte Kindknoten
- visuelle Trennung Folder/Program
- tastaturbedienbar (`Enter`/`Space`)
- kein Card-Look, keine dekorativen Shadows

## 5.5 Programmansicht

Elemente:

- Pathline/Breadcrumb (`FLEET » ...`)
- Program-Frame mit dünner orangefarbener Kontur
- Viewtabs (Patient View / Basic Patient View)
- Lanes
- innerhalb Lanes: Rows, Decisions, Labels, Spacer

## 5.6 Suche

Suchzeile:

- Collapse-All links
- Suchfeld mit integrierter Lupe
- Clear-X nur bei Text (`.search-box.has-text`)

Funktional:

- Filterung im Tree
- Selektion bleibt konsistent
- Enter im Suchfeld wählt erstes Programmtreffer-Item

## 5.7 Collapse-All

- klappt geöffnete Ordner ein
- hält ausgewählten Kontext sichtbar, indem Eltern des selektierten Knotens wieder geöffnet werden

## 5.8 Zoom

- Zoom In / Zoom Out
- Ctrl+Plus / Ctrl+Minus
- Ctrl+0 Reset
- Ctrl+Wheel im Workspace
- bewusst ohne sichtbare Prozentanzeige

## 5.9 Tastaturkürzel

- `Ctrl+F`: Fokus auf Suche
- `Escape`: Suche leeren oder Fokus lösen
- `Enter` in Suche: ersten Programmknoten öffnen

## 5.10 Struktur- und Dichteprinzipien

- kompakte Zeilenhöhen
- reduzierte Rundungen
- matte Flächen
- dünne Trennlinien
- native-like Scrollbars
- keine dominante Statusleiste

---

## 6) Visuelle Systematik (Design-Tokens und Verhalten)

Im CSS sind zusätzliche Tokens und Überschreibungen für einen nativeren Look aktiv:

- reduzierte Shell-Höhen (`titlebar`, `ribbon`, `toolbar`)
- schmalere Sidebar
- flacher Workspace-Hintergrund
- 1px Program-Frame
- dichte Tree-Rows
- Row-Höhe über `--row-h`
- Spacer-Höhe über `--spacer-rows`

### Spacer-Raster

Spacer werden nicht mehr über harte Pixelhöhen in JS gebaut, sondern über CSS-Variable:

- JS setzt `--spacer-rows:n`
- CSS berechnet Höhe aus `var(--row-h)`
- Hintergrund erzeugt tabellarischen Rastereffekt

### Blank-Rows

Zeilen ohne Sequenznamen werden bewusst zurückgenommen:

- kein Patientenicon
- kein pseudo-informativer Inhalt
- Raster bleibt stabil

---

## 7) Bedienfluss aus Anwendersicht

1. Anwendung öffnen
2. links im Tree Ordner oder Programm auswählen
3. rechts abhängig von Knotentyp:
   - Ordner → Inhaltsliste
   - Programm → Detailansicht mit Lanes/Rows/Decisions
4. optional Suche nutzen
5. optional Zoom anpassen

Das Ergebnis ist ein schneller, reproduzierbarer Navigationsfluss für Protokollsichtung.

---

## 8) Datenintegrität und Kennzahlen (Ist-Stand)

Ermittelt per rein lesendem Audit auf `data/protocol-database.json`.

| Kennzahl | Wert |
|---|---:|
| Protokolle | 60 |
| Specs | 60 |
| Kopf | 42 |
| Wirbelsäule | 18 |
| Lanes | 90 |
| Rows | 990 |
| Decisions | 83 |
| Branches/Cols | 125 |
| Labels | 140 |
| Spacer-Blöcke | 9 |
| Spacer-Einheiten (`n` summiert) | 45 |
| Badges | 144 |
| Rows mit Zeit | 866 |
| Rows mit Pill | 639 |
| minimale Spec-Breite | 285 px |
| maximale Spec-Breite | 1350 px |

**Wichtig:** Diese Werte beschreiben den aktuellen Datenbestand. Die Anwendung ändert die Daten nicht.

---

## 9) Accessibility- und Robustheitsaspekte

- Escape von Textausgaben via `esc(...)`
- defensive DOM-Nutzung für optionale Elemente
- klare Deaktivierungssemantik für read-only Controls
- Tastaturzugriffe auf zentrale Flows (Suche, Auswahl)

---

## 10) Performance-Charakteristik

- kein Netzwerkaustausch nach initialem Laden
- vollständiges Client-Rendering
- Tree-Filterung direkt im Speicher
- keine Framework-Overheads

Geeignet für schnelle lokale Nutzung auf Standard-Desktop-Systemen.

---

## 11) Grenzen und bewusste Entscheidungen

- keine echte Editierlogik (intended)
- Viewtabs dienen primär der visuellen Workstation-Anmutung
- Decisions zeigen read-only Werte statt interaktiver Protokollumschaltung
- keine mobile Einspalten-Transformation; Desktop-Layout bleibt erhalten

---

## 12) Betrieb und Nutzung

### Lokal starten

Einfach `index.html` im Browser öffnen.

Empfohlen (lokaler Server optional):

```bash
python -m http.server 8080
```

Dann `http://localhost:8080` öffnen.

---

## 13) Qualitätssicherung (empfohlene Checks)

- JS-Syntax prüfen:

```bash
node --check assets/js/app.js
```

- Datenaudit prüfen (Zählwerte):

```bash
node -e "/* audit script */"
```

- manuelle Pfadtests:
  - `Kopf`
  - `Kopf > Standard`
  - `Kopf > Standard > Standard +/- KM`
  - `Kopf > MS`
  - `Kopf > MS > Schädel + Wirbelsäule`
  - `Kopf > Spektroskopie`
  - `Kopf > Spektroskopie > csi`
  - `Wirbelsäule`
  - `Wirbelsäule > HWS`

---

## 14) Zusammenfassung

Die Anwendung liefert eine **dichte, flache, native-like Explorer- und Programmdarstellung** für MRT-Protokolle mit klarer **read-only-Konsistenz**. Der aktuelle Stand priorisiert bewusst Workstation-Nähe, semantisch korrekte Bedienung (Ordner vs. Programm) und robuste statische Ausführung ohne technische Nebenabhängigkeiten.
