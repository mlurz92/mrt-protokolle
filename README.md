# myExam Cockpit Explorer · Prisma Fit

## 1. Zweck der Anwendung

Diese Anwendung bildet die **myExam-Cockpit-Explorer- und Program-Editor-Ansicht** des MAGNETOM Prisma Fit für die erfassten Kopf- und Wirbelsäulenprotokolle nach. Der Fokus liegt nicht auf einer generischen Protokollliste, sondern auf einer möglichst scannerähnlichen, arbeitsnahen Darstellung der **Protokollbäume**, **Programmspalten**, **Sequenzreihenfolgen**, **Entscheidungsäste**, **Interaktionszeilen**, **Zeitangaben** und **Funktionslabels**.

Der Anwendungszweck ist ein schnelles, visuell vertrautes Nachschlagewerk für die Auswahl und Einordnung von MRT-Protokollen bei Anmeldungen, Besprechungen, Protokollpflege und interner Standardisierung.

Die mehrdateilige Version ist aus der vorherigen Single-HTML-Anwendung abgeleitet. **Funktion, Darstellung und Inhalt sind absichtlich unverändert geblieben.** Geändert wurde ausschließlich die technische Ablage in ein strukturiertes Anwendungsverzeichnis.

---

## 2. Projektstand und Datenumfang

| Merkmal | Wert |
|---|---:|
| Protokolle gesamt | **60** |
| Eindeutige Protokollpfade | **60** |
| Kopf-Protokolle | **42** |
| Wirbelsäulenprotokolle | **18** |
| Programmspezifikationen | **60** |
| Fehlende Spezifikationen | **0** |
| Extra-Spezifikationen ohne Protokoll | **0** |
| UI-Lanes / Spalten | **90** |
| Sequenz-/Interaktionszeilen | **905** |
| Hinweise / Label-Zeilen | **140** |
| Decisions | **76** |
| Decision-Optionen | **113** |
| Spacer / Rasterelemente | **8** |

---

## 3. Verzeichnisstruktur

```text
myexam_prisma_fit_multifile_app/
├── assets/
│   ├── css/
│   │   └── myexam-cockpit.css
│   └── js/
│       └── app.js
├── data/
│   ├── protocol-database.js
│   └── protocol-database.json
├── index.html
├── manifest.json
└── README.md
```

### 3.1 `index.html`

Die Datei `index.html` ist die **HTML-Hülle** der Anwendung. Sie enthält:

- die unveränderte Grundstruktur der Oberfläche,
- die Hauptbereiche `window-title`, `ribbon`, `toolbar`, `main`, `sidebar`, `workspace`, `status`,
- keine eingebetteten Protokolldaten,
- kein eingebettetes CSS,
- keine eingebettete App-Logik.

Die Datei lädt die ausgelagerten Ressourcen in definierter Reihenfolge:

```html
<link rel="stylesheet" href="assets/css/myexam-cockpit.css" />
<script defer src="data/protocol-database.js"></script>
<script defer src="assets/js/app.js"></script>
```

### 3.2 `assets/css/myexam-cockpit.css`

Diese Datei enthält den vollständig extrahierten CSS-Block der bisherigen Single-HTML-Anwendung. Die visuelle Darstellung bleibt dadurch erhalten:

- dunkles Scanner-/myExam-Farbschema,
- orangefarbene Strategie-/Lane-Köpfe,
- graue Sequenzraster,
- kompakte Tabellen-/Program-Editor-Anmutung,
- Explorer-Baum links,
- Programmansicht rechts,
- Scroll- und Suchzustände,
- Decision-Tree-Darstellung,
- Pill-Labels wie `AutoAlign Scout`, `Spine Positioning`, `MPR Assignment`, `Basic Decision`.

### 3.3 `data/protocol-database.js`

Diese Datei ist der **Runtime-Datenbank-Part** der Anwendung. Sie definiert global:

```js
window.MYEXAM_PROTOCOL_DATABASE = { ... };
```

Die App nutzt diese Datei direkt beim Start. Dadurch ist die Anwendung auch lokal per Doppelklick als `file://`-Datei nutzbar, ohne dass ein lokaler Webserver erforderlich ist.

### 3.4 `data/protocol-database.json`

Diese Datei enthält denselben Datenbestand zusätzlich als formatiertes JSON. Sie dient der:

- externen Prüfung,
- Weiterverarbeitung,
- Datenpflege,
- diff-fähigen Kontrolle,
- möglichen späteren Migration in eine echte Datenbank oder Build-Pipeline.

Die laufende App nutzt bewusst `protocol-database.js`, nicht `fetch("protocol-database.json")`, damit keine lokalen Browserrestriktionen durch Datei-/CORS-Kontext entstehen.

### 3.5 `assets/js/app.js`

Diese Datei enthält die komplette Rendering- und Interaktionslogik:

- Initialisierung aus `window.MYEXAM_PROTOCOL_DATABASE`,
- Aufbau des Explorer-Baums,
- Suchindex und Trefferfilterung,
- Rendern der Programmansicht,
- Rendern von Lanes, Rows, Labels, Decisions und Branches,
- Statuszeile,
- Auswahlzustände,
- Fallback-Rendering für ältere Row-Tabellenstrukturen.

### 3.6 `docs/audit/split-audit.json`

Maschinenlesbarer Prüfbericht der Auftrennung:

- Quell-SHA der Single-HTML-Anwendung,
- Dateirollen,
- SHA-Werte der erzeugten Dateien,
- Syntaxprüfung,
- Datenkonsistenz,
- Protokoll-/Spec-Abdeckung,
- Blockzählung.

---

## 4. UI-Gesamtaufbau

Die Oberfläche ist in fünf vertikale Hauptzonen gegliedert:

```text
┌──────────────────────────────────────────────┐
│ Window title                                  │
├──────────────────────────────────────────────┤
│ Ribbon: Explorer / Programm Editor           │
├──────────────────────────────────────────────┤
│ Toolbar + Zoomsymbole                         │
├───────────────┬──────────────────────────────┤
│ Sidebar       │ Workspace / Program Editor    │
│ Explorerbaum  │ Protokollspalten              │
├───────────────┴──────────────────────────────┤
│ Statuszeile                                   │
└──────────────────────────────────────────────┘
```

Die UI ist bewusst scannerähnlich und nicht als moderne Card-/Dashboard-Oberfläche ausgeführt. Dadurch bleibt die visuelle Nähe zur realen myExam-Cockpit-Ansicht erhalten.

---

## 5. UI-/UX-Elemente im Detail

### 5.1 Fenstertitel

Der obere Fenstertitel zeigt:

- `myExam Cockpit - Explorer`,
- rechts einfache Fenster-/Hilfesymbole:
  - `?`
  - `▢`
  - `×`

Diese Elemente sind rein visuell und dienen der Nachbildung der Scanneroberfläche.

### 5.2 Ribbon

Das Ribbon besteht aus zwei Gruppen:

| Gruppe | Elemente |
|---|---|
| `Explorer` | `Browse`, `Importieren`, `Export` |
| `Programm Editor` | `Bearbeiten`, `Simulieren` |

Die aktive Darstellung ist visuell gesetzt, ohne dass diese Tabs funktional umschalten. Der Zweck ist die scannerähnliche Orientierung.

### 5.3 Toolbar

Die Toolbar enthält einfache Symbolsegmente und rechts Zoomsymbole. Auch diese Elemente sind primär visuelle Referenz zur Scanneroberfläche.

### 5.4 Sidebar

Die Sidebar enthält:

1. `FLEET`-Leiste
2. Suchzeile
3. Explorer-Baum

Die linke Seitenleiste ist auf schnelles Navigieren optimiert. Sie verwendet eine hierarchische Baumstruktur und bleibt auch bei langer Programmansicht stabil links sichtbar.

### 5.5 Suchzeile

Die Suche ist vollständig clientseitig implementiert. Sie sucht über:

- Top-Level-Bereich,
- Ordner,
- Protokollnamen,
- vollständige Pfade,
- Lane-Titel,
- Sequenznamen,
- Zeiten,
- Pills/Funktionslabels,
- Decision-Fragen,
- Decision-Optionen,
- Hinweise/Labels,
- verschachtelte Branch-Inhalte.

Bedienung:

| Aktion | Verhalten |
|---|---|
| Tippen im Suchfeld | Baum wird live gefiltert |
| `×`-Button | Suche wird gelöscht, Fokus zurück ins Suchfeld |
| Enter | erstes sichtbares Protokoll wird ausgewählt |
| Trefferanzeige | `n Treffer` rechts in der Suchzeile |

### 5.6 Explorer-Baum

Der Explorer-Baum bildet die Protokollhierarchie aus der Datenbank dynamisch ab. Die Anwendung kennt keine hart codierte Baumstruktur im HTML; sie wird aus den Protokollpfaden erzeugt.

Baumzustände:

| Zustand | Darstellung |
|---|---|
| geöffneter Ordner | Pfeil nach unten |
| geschlossener Ordner | Pfeil nach rechts |
| ausgewähltes Protokoll | hellgrau selektierte Zeile |
| Suchtreffer | gefilterte, relevante Knoten |
| kein Suchtreffer | `Keine Treffer.` |

### 5.7 Workspace

Der Workspace enthält die eigentliche Programmansicht. Bei Auswahl eines Protokolls wird rechts die zugehörige Spezifikation geladen und als myExam-nahe Protokollmatrix dargestellt.

Bestandteile:

- Pfadzeile (`FLEET > ...`),
- Edit-/Pencil-Symbol,
- Program-Frame,
- Patient-View-Register,
- Lane-/Strategie-Spalten,
- Sequenzraster,
- Decisions mit Unterspalten.

### 5.8 Patient-View-Leiste

Jede Programmansicht zeigt die Register:

- `Patient View`
- `Basic Patient View`

Sie sind visuelle Nachbildung der Scanneransicht und nicht als Umschalter implementiert.

### 5.9 Lane-/Strategie-Spalten

Eine Lane entspricht einer sichtbaren orangefarbenen Spalte im Program Editor, z. B.:

- `Standard +/- KM`
- `Unkooperativ`
- `Degenerativ`
- `Trauma (stat.)`
- `Ambulanz`
- `WARP`
- `Plexus + KM`
- `Plexus-DIXON`
- `SPACE`
- `CISS`

Eigenschaften:

| Feld | Bedeutung |
|---|---|
| `title` | sichtbarer Spaltenkopf |
| `check` | setzt den Haken im linken Spaltenkopf |
| `blocks` | Sequenzen, Labels, Decisions, Spacer |
| `width` / `width_px` | foto-/UI-nahe Breite der Programmansicht |

### 5.10 Sequenzzeilen

Eine Sequenzzeile enthält typischerweise:

| Element | Bedeutung |
|---|---|
| Sequenzname | z. B. `t2_tse_dark-fluid_tra_4mm` |
| Zeit | z. B. `03:38` |
| Badge | kleines weißes Badge mit Index/Marker, falls im Datenbestand gesetzt |
| Pill | Funktionslabel, z. B. `Spine Positioning` |
| Unter-/Interaktionszeilen | z. B. `Kontrastmittel`, `KM-Gabe nach 5.Messung` |

### 5.11 Pills / Funktionslabels

Pills sind rechts angeordnete Funktionslabels, die typische Scanner-Funktionsblöcke nachbilden.

Beispiele:

| Pill | Bedeutung im UI-Kontext |
|---|---|
| `AutoAlign Scout` | Kopf-AutoAlign-Scout |
| `Spine Scout` | Wirbelsäulen-Scout |
| `Spine Positioning` | Wirbelsäulen-Planungs-/Positionierungslogik |
| `Spine Verification` | AutoAlign-/Spine-Verifikationsschritt |
| `MPR Assignment` | MPR-Zuweisung |
| `MPR Planning` | MPR-Planung |
| `Basic Decision` | Entscheidungs-/Branch-Punkt |
| `Generic Views` | generische View-/Planungslogik |
| `Spectroscopy` | Spektroskopiebaustein |
| `Advanced Application` | automatisierter Applikations-/Nachverarbeitungsstart |
| `Morpho` | Morpho-/3D-Applikationskontext |

### 5.12 Labels / Hinweise

Labels sind nicht-sequenzielle Textzeilen. Sie bilden Hinweise, Instruktionen oder Interaktionsmarker ab.

Beispiele:

- `Laser auf Kinnspitze`
- `Kontrastmittel injizieren`
- `KM-Gabe nach 5.Messung`
- `AutoAlign Verifikation`
- `Perfusion: nur -ep2d_perf_p2 MoCo archivieren`
- `Pat. vor Untersuchung über Fingertapping instruieren`
- `Boldmessung startet mit B (Baseline)/Ruhe ...`

### 5.13 Decisions

Decisions bilden echte myExam-/Program-Editor-Entscheidungsstellen ab. Eine Decision besteht aus:

| Feld | Bedeutung |
|---|---|
| `q` | sichtbare Frage / Entscheidungsname |
| `default` | sichtbarer Default-Wert in Dropdown-Optik |
| `title` | orangefarbene Decision-Zwischenüberschrift |
| `cols[]` | Decision-Optionen als Unterspalten |
| `cols[].label` | Optionsname |
| `cols[].blocks` | Sequenzen/Hinweise innerhalb der Option |

Beispiele:

- `T2-FLAIR`
- `mit KM?`
- `Darkfluid 2D oder 3D?`
- `T2 tra`
- `T1 tra`
- `optional`
- `Cholesteatom`
- `Spektroskopie?`
- `Fibretracking?`
- `Schädigung retro-/infraclaviculär`
- `bei Tumor / Entzündung KM`

### 5.14 Spacer

Spacer sind bewusst gespeicherte Raster-/Leerbereiche, um die visuelle vertikale Struktur der Scanneransicht nachzubilden. Sie sind keine Datenlücken, sondern Layoutinformationen.

---

## 6. Datenmodell

Die zentrale Datenbank liegt in `data/protocol-database.js` und `data/protocol-database.json`.

### 6.1 Top-Level-Struktur

```json
{
  "meta": { },
  "protocols": [ ],
  "specs": { }
}
```

### 6.2 `meta`

Beschreibt den Datenstand:

- Anwendungstitel,
- Version,
- Gesamtanzahl,
- Kopf-/Wirbelsäulenanteil,
- UI-Referenz,
- Quellindex.

### 6.3 `protocols[]`

Jeder Eintrag beschreibt ein auswählbares Protokoll im Baum:

```json
{
  "group": "Standard",
  "name": "Standard +/- KM",
  "path": "Kopf > Standard > Standard +/- KM",
  "source": "...",
  "notes": "...",
  "rows": []
}
```

`rows` ist als flache Tabellen-/Fallback-Struktur erhalten und dient zusätzlich als Such- und Kompatibilitätsbasis.

### 6.4 `specs`

`specs` ist die eigentliche Darstellungsspezifikation. Der Key entspricht exakt dem Protokollpfad:

```json
"Wirbelsäule > HWS > Deg. / Trauma / Amb.": {
  "width": 1180,
  "layout": "lanes",
  "title": "Deg. / Trauma / Amb.",
  "lanes": []
}
```

### 6.5 Blocktypen

| Typ | Zweck |
|---|---|
| `row` | Sequenz-/Interaktionszeile |
| `label` | Hinweis-/Instruktionszeile |
| `decision` | Branch-/Entscheidungspunkt |
| `spacer` | visuelles Rasterelement |

### 6.6 `row`

```json
{
  "t": "row",
  "name": "t2_tse_sag_3mm",
  "time": "02:23",
  "pill": "Spine Positioning",
  "badge": "1",
  "note": ""
}
```

### 6.7 `label`

```json
{
  "t": "label",
  "text": "Kontrastmittel injizieren"
}
```

### 6.8 `decision`

```json
{
  "t": "decision",
  "q": "T2 tra",
  "default": "T2 TSE",
  "title": "T2 tra",
  "cols": [
    {
      "label": "T2 TSE",
      "blocks": []
    },
    {
      "label": "T2 SPACE",
      "blocks": []
    }
  ]
}
```

### 6.9 `spacer`

```json
{
  "t": "spacer",
  "n": 3
}
```

`n` steuert die Höhe in Rasterzeilen.

---

## 7. Rendering-Pipeline

### 7.1 Initialisierung

`assets/js/app.js` liest beim Start:

```js
const DATA = window.MYEXAM_PROTOCOL_DATABASE;
```

Danach werden abgeleitet:

- `protocols`
- `specs`
- `byPath`
- `selectedPath`
- `openFolders`

### 7.2 Baumaufbau

`buildTree()` zerlegt alle Protokollpfade anhand von ` > ` und baut daraus eine verschachtelte Ordner-/Item-Struktur.

### 7.3 Suche

`searchable(protocol)` erzeugt einen Suchtext aus:

- Protokollpfad,
- Name,
- Gruppe,
- flachen Rows,
- Spec-Lanes,
- rekursiven Blocks.

`branchMatches(node, query)` entscheidet, ob ein Ordner sichtbar bleibt.

### 7.4 Programmansicht

`renderProgram()`:

1. lädt das ausgewählte Protokoll,
2. sucht die passende Spec,
3. normalisiert ggf. ältere Datenformate,
4. rendert Pfadzeile,
5. rendert Program Frame,
6. rendert alle Lanes.

### 7.5 Row-/Decision-Rendering

| Funktion | Aufgabe |
|---|---|
| `renderLane()` | Spaltenkopf + Blöcke |
| `renderBlocks()` | rekursiver Blockrenderer |
| `renderBlock()` | Typweiche für row/label/decision/spacer |
| `renderRow()` | Sequenzzeile |
| `renderDecision()` | Decision mit Dropdown-Optik und Branch-Grid |

---

## 8. Protokollbestand

### `Kopf > AVM`
- `Standard` — Pfad: `Kopf > AVM > Standard`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Aneurysma`
- `Z. n. Coiling/Clipping` — Pfad: `Kopf > Aneurysma > Z. n. Coiling/Clipping`; Lanes: 0; Lane-Titel: ``

### `Kopf > Arteriitis Temporalis`
- `Standard` — Pfad: `Kopf > Arteriitis Temporalis > Standard`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Dissektion`
- `Standard` — Pfad: `Kopf > Dissektion > Standard`; Lanes: 0; Lane-Titel: ``

### `Kopf > Entzündung`
- `Standard` — Pfad: `Kopf > Entzündung > Standard`; Lanes: 0; Lane-Titel: ``

### `Kopf > Epilepsie`
- `Standard` — Pfad: `Kopf > Epilepsie > Standard`; Lanes: 1; Lane-Titel: `Standard KM`

### `Kopf > Hirntumor`
- `Erstdiagnostik` — Pfad: `Kopf > Hirntumor > Erstdiagnostik`; Lanes: 1; Lane-Titel: `Standard`
- `Standard` — Pfad: `Kopf > Hirntumor > Standard`; Lanes: 2; Lane-Titel: `Standard, Unkooperativ`
- `Erstdiagnostik mit Navi` — Pfad: `Kopf > Hirntumor > Erstdiagnostik mit Navi`; Lanes: 1; Lane-Titel: `Standard`
- `Früh-MRT/post-OP` — Pfad: `Kopf > Hirntumor > Früh-MRT/post-OP`; Lanes: 1; Lane-Titel: `Früh-MRT (bis 48h)`
- `Verlauf` — Pfad: `Kopf > Hirntumor > Verlauf`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Hypophyse`
- `Standard` — Pfad: `Kopf > Hypophyse > Standard`; Lanes: 1; Lane-Titel: `Standard + KM`

### `Kopf > INTRAGO`
- `INTRAGO` — Pfad: `Kopf > INTRAGO > INTRAGO`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > KHBW`
- `Standard` — Pfad: `Kopf > KHBW > Standard`; Lanes: 2; Lane-Titel: `Standard, Alternativsequenzen`
- `KHBW SwiftMRI` — Pfad: `Kopf > KHBW > KHBW SwiftMRI`; Lanes: 2; Lane-Titel: `Standard, Alternativsequenzen`

### `Kopf > Kiefergelenke`
- `Kiefergelenke` — Pfad: `Kopf > Kiefergelenke > Kiefergelenke`; Lanes: 1; Lane-Titel: `Strategie`

### `Kopf > Kopfschmerz Migräne`
- `Standard` — Pfad: `Kopf > Kopfschmerz Migräne > Standard`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > MS`
- `Verlauf nativ / KM` — Pfad: `Kopf > MS > Verlauf nativ / KM`; Lanes: 2; Lane-Titel: `Standard nativ, Standard KM`
- `Schädel + Wirbelsäule` — Pfad: `Kopf > MS > Schädel + Wirbelsäule`; Lanes: 1; Lane-Titel: `MS Schädel + WS`
- `Erstdiagnostik` — Pfad: `Kopf > MS > Erstdiagnostik`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > NEURORAD`
- `postintervent. Kontrolle` — Pfad: `Kopf > NEURORAD > postintervent. Kontrolle`; Lanes: 0; Lane-Titel: ``
- `SVT` — Pfad: `Kopf > NEURORAD > SVT`; Lanes: 0; Lane-Titel: ``

### `Kopf > NNH`
- `Sinusitis` — Pfad: `Kopf > NNH > Sinusitis`; Lanes: 2; Lane-Titel: `Sinusitis, Alt`

### `Kopf > Neuro-Navigation`
- `Navi` — Pfad: `Kopf > Neuro-Navigation > Navi`; Lanes: 1; Lane-Titel: `Standard`
- `FT` — Pfad: `Kopf > Neuro-Navigation > FT`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Neurodegeneration`
- `Standard` — Pfad: `Kopf > Neurodegeneration > Standard`; Lanes: 0; Lane-Titel: ``

### `Kopf > Orbita`
- `Standard` — Pfad: `Kopf > Orbita > Standard`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Sequenzen`
- `Sequenzen` — Pfad: `Kopf > Sequenzen > Sequenzen`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Sinusthrombose`
- `Standard` — Pfad: `Kopf > Sinusthrombose > Standard`; Lanes: 0; Lane-Titel: ``

### `Kopf > Spektroskopie`
- `svs` — Pfad: `Kopf > Spektroskopie > svs`; Lanes: 1; Lane-Titel: `Standard`
- `csi` — Pfad: `Kopf > Spektroskopie > csi`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Standard`
- `Standard +/- KM` — Pfad: `Kopf > Standard > Standard +/- KM`; Lanes: 2; Lane-Titel: `Standard +/- KM, Unkooperativ`
- `Sequenzauswahl` — Pfad: `Kopf > Standard > Sequenzauswahl`; Lanes: 1; Lane-Titel: `Standard`
- `SwiftMR_Standard +/- KM` — Pfad: `Kopf > Standard > SwiftMR_Standard +/- KM`; Lanes: 2; Lane-Titel: `Standard +/- KM, Unkooperativ`

### `Kopf > Stroke`
- `Auswahl` — Pfad: `Kopf > Stroke > Auswahl`; Lanes: 2; Lane-Titel: `Standard, Optionale Sequenzen`
- `TGA` — Pfad: `Kopf > Stroke > TGA`; Lanes: 1; Lane-Titel: `Standard`
- `Standard #15` — Pfad: `Kopf > Stroke > Standard #15`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Trauma`
- `Trauma` — Pfad: `Kopf > Trauma > Trauma`; Lanes: 1; Lane-Titel: `Standard`
- `Sequenzauswahl` — Pfad: `Kopf > Trauma > Sequenzauswahl`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Vaskulitis`
- `Standard` — Pfad: `Kopf > Vaskulitis > Standard`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > Wernicke Enzephalitis`
- `Standard` — Pfad: `Kopf > Wernicke Enzephalitis > Standard`; Lanes: 1; Lane-Titel: `Standard`

### `Kopf > funktionelles MRT`
- `Standard` — Pfad: `Kopf > funktionelles MRT > Standard`; Lanes: 1; Lane-Titel: `Standard`

### `Wirbelsäule > BWS`
- `Deg. / Trauma / Amb.` — Pfad: `Wirbelsäule > BWS > Deg. / Trauma / Amb.`; Lanes: 4; Lane-Titel: `Degenerativ, Trauma (stationär), Ambulanz, hohe Bandbreite (WARP)`
- `Tm / Myelon / Blutung` — Pfad: `Wirbelsäule > BWS > Tm / Myelon / Blutung`; Lanes: 3; Lane-Titel: `Knochen / BS, Myelon / spinal, Blutung`
- `Zusätze` — Pfad: `Wirbelsäule > BWS > Zusätze`; Lanes: 1; Lane-Titel: `Zusätze`

### `Wirbelsäule > HWS`
- `Deg. / Trauma / Amb.` — Pfad: `Wirbelsäule > HWS > Deg. / Trauma / Amb.`; Lanes: 4; Lane-Titel: `Degenerativ, Trauma (stationär), Ambulanz, hohe Bandbreite (WARP)`
- `Tm / MS / Entz. / Blutung` — Pfad: `Wirbelsäule > HWS > Tm / MS / Entz. / Blutung`; Lanes: 4; Lane-Titel: `Knochen / BS, MS, Myelon / Spinal, Blutung`
- `Plexus` — Pfad: `Wirbelsäule > HWS > Plexus`; Lanes: 2; Lane-Titel: `Plexus + KM, Plexus - DIXON`
- `Zusätze / FAST` — Pfad: `Wirbelsäule > HWS > Zusätze / FAST`; Lanes: 2; Lane-Titel: `Zusätze, FAST`

### `Wirbelsäule > LWS`
- `Deg. / Trauma / Amb.` — Pfad: `Wirbelsäule > LWS > Deg. / Trauma / Amb.`; Lanes: 4; Lane-Titel: `Degenerativ, Trauma (stationär), Ambulanz, hohe Bandbreite (WARP)`
- `Tm / Entz. / Blutung` — Pfad: `Wirbelsäule > LWS > Tm / Entz. / Blutung`; Lanes: 3; Lane-Titel: `Knochen / BS, MS / spinal, Blutung`
- `Zusätze / Plexus sacralis` — Pfad: `Wirbelsäule > LWS > Zusätze / Plexus sacralis`; Lanes: 2; Lane-Titel: `Zusätze, Plexus sacralis`
- `Alternativen` — Pfad: `Wirbelsäule > LWS > Alternativen`; Lanes: 1; Lane-Titel: `Alternativen`
- `FAST` — Pfad: `Wirbelsäule > LWS > FAST`; Lanes: 1; Lane-Titel: `LWS fast`

### `Wirbelsäule > gesamte WS`
- `Tm / MS / Entz.` — Pfad: `Wirbelsäule > gesamte WS > Tm / MS / Entz.`; Lanes: 4; Lane-Titel: `Knochen / BS, MS / spinal - 3 Etagen, Entzündung 3 Etagen, WARP`
- `Trauma` — Pfad: `Wirbelsäule > gesamte WS > Trauma`; Lanes: 3; Lane-Titel: `2 Etagen, 3 Etagen, hohe Bandbreite (WARP)`
- `Liquorleck` — Pfad: `Wirbelsäule > gesamte WS > Liquorleck`; Lanes: 2; Lane-Titel: `SPACE, CISS`
- `Fast` — Pfad: `Wirbelsäule > gesamte WS > Fast`; Lanes: 3; Lane-Titel: `Trauma fast, Degenerativ fast, ges WS KM fast`
- `SwiftMR_Fast` — Pfad: `Wirbelsäule > gesamte WS > SwiftMR_Fast`; Lanes: 3; Lane-Titel: `Trauma fast, Degenerativ fast, SwiftMR_ges WS KM fast`
- `Spinale Angio` — Pfad: `Wirbelsäule > gesamte WS > Spinale Angio`; Lanes: 1; Lane-Titel: `Strategie`


---

## 9. Lokale Nutzung

### 9.1 Direktstart

1. ZIP entpacken.
2. `index.html` doppelklicken.
3. Anwendung öffnet im Browser.

Da die App klassische externe Scripts nutzt und keine ES-Module oder `fetch()` für den Datenbestand benötigt, ist kein lokaler Webserver zwingend erforderlich.

### 9.2 Optionaler lokaler Webserver

Aus dem Projektverzeichnis:

```bash
python -m http.server 8000
```

Dann öffnen:

```text
http://localhost:8000
```

---

## 10. Pflegehinweise

### 10.1 Protokoll hinzufügen

1. In `data/protocol-database.json` einen neuen Eintrag in `protocols[]` ergänzen.
2. Denselben Pfad als Key in `specs` ergänzen.
3. Die Änderung auch in `data/protocol-database.js` übertragen.
4. Sicherstellen, dass `protocol.path` exakt dem `specs`-Key entspricht.

### 10.2 Lane hinzufügen

In der passenden Spec:

```json
"lanes": [
  {
    "title": "Neue Lane",
    "check": false,
    "blocks": []
  }
]
```

### 10.3 Decision hinzufügen

Eine Decision immer als eigener Block:

```json
{
  "t": "decision",
  "q": "Frage?",
  "default": "Nein",
  "title": "Frage?",
  "cols": [
    { "label": "Ja", "blocks": [] },
    { "label": "Nein", "blocks": [] }
  ]
}
```

### 10.4 Darstellung kontrollieren

Nach Änderungen prüfen:

- Baum sichtbar?
- Protokoll auswählbar?
- Lane-Titel korrekt?
- Reihenfolge exakt?
- Zeiten korrekt?
- Pills korrekt?
- Decision-Branches korrekt nebeneinander?
- Suche findet Sequenznamen?
- Suche findet Decision-Fragen?
- Browser-Konsole ohne Fehler?

---

## 11. Qualitätssicherung dieser Auftrennung

| Prüfung | Ergebnis |
|---|---:|
| Datenbank aus Single HTML extrahiert | **ja** |
| Datenbankgleichheit geprüft | **true** |
| CSS aus Single HTML extrahiert | **ja** |
| CSS-Gleichheit geprüft | **true** |
| Renderer-Funktionen vorhanden | **true** |
| Node-Syntaxprüfung `protocol-database.js` | **true** |
| Node-Syntaxprüfung `app.js` | **true** |
| Fehlende Specs | **0** |
| Extra Specs | **0** |

---

## 12. Technische Designentscheidungen

### 12.1 Keine Frameworks

Es wurden keine zusätzlichen Frameworks oder CDN-Abhängigkeiten eingebunden. Grund:

- die bestehende Darstellung war bereits vollständig eigenständig,
- zusätzliche Abhängigkeiten hätten keinen funktionellen Mehrwert gebracht,
- die Anwendung soll im klinikinternen Kontext robust lokal lauffähig bleiben,
- die exakte visuelle Kontinuität zur Single-HTML-Version hat Priorität.

### 12.2 Keine ES-Module

Die App nutzt klassische Scripts mit `defer`, damit die Datei lokal ohne Server lauffähig bleibt. ES-Module wären technisch sauber, können aber bei lokalem `file://`-Start zu CORS-/Origin-Problemen führen.

### 12.3 Datenbank als JS plus JSON

Die JS-Datenbank ist die Runtime-Quelle. Die JSON-Datei ist die lesbare/prüfbare Datenquelle. Dadurch werden lokale Fetch-Probleme vermieden, aber die Daten bleiben trotzdem in einem klar getrennten Datenbank-Part abgelegt.

---

## 13. Kurzfazit

Die Anwendung ist jetzt als mehrdateiliges, sauber sortiertes Frontend-Projekt strukturiert:

- HTML: Oberfläche / DOM-Skelett
- CSS: visuelle Scanner-/myExam-Nachbildung
- JS: Rendering und Interaktion
- Datenbank: Protokolle, Sequenzen, Lanes, Decisions, Branches, Zeiten, Pills
- Audit: maschinenlesbare Selbstprüfung

Der wichtigste Punkt bleibt: **Die Trennung in mehrere Dateien verändert Funktion, Darstellung und Inhalt nicht.**
