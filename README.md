# myExam Cockpit Explorer · Prisma Fit

> **Interaktiver Viewer für MRT-Protokolle des Siemens MAGNETOM Prisma Fit**  
> Originalgetreue Nachbildung der myExam-Cockpit-Explorer-Oberfläche als lokale Web-Anwendung

---

## Inhaltsverzeichnis

1. [Zweck und Zielsetzung](#1-zweck-und-zielsetzung)
2. [Projektstand und Datenumfang](#2-projektstand-und-datenumfang)
3. [Verzeichnisstruktur](#3-verzeichnisstruktur)
4. [Technische Architektur](#4-technische-architektur)
5. [Gesamtaufbau der Benutzeroberfläche](#5-gesamtaufbau-der-benutzeroberfläche)
6. [UI-Elemente im Detail](#6-ui-elemente-im-detail)
   - [6.1 Fenstertitel](#61-fenstertitel)
   - [6.2 Ribbon (Menüband)](#62-ribbon-menüband)
   - [6.3 Toolbar](#63-toolbar)
   - [6.4 Zoom-Steuerung](#64-zoom-steuerung)
   - [6.5 Sidebar (Explorer-Bereich)](#65-sidebar-explorer-bereich)
   - [6.6 Explorer-Baum](#66-explorer-baum)
   - [6.7 Suchfunktion](#67-suchfunktion)
   - [6.8 Workspace (Programm-Bereich)](#68-workspace-programm-bereich)
   - [6.9 Breadcrumb-Pfadzeile](#69-breadcrumb-pfadzeile)
   - [6.10 Programm-Frame](#610-programm-frame)
   - [6.11 View-Tabs: Patient View / Basic Patient View](#611-view-tabs-patient-view--basic-patient-view)
   - [6.12 Lane-Spalten (Strategie-Spalten)](#612-lane-spalten-strategie-spalten)
   - [6.13 Sequenzzeilen (Rows)](#613-sequenzzeilen-rows)
   - [6.14 Funktions-Pills](#614-funktions-pills)
   - [6.15 Badges (Etagen-Markierungen)](#615-badges-etagen-markierungen)
   - [6.16 Patienten-Icon](#616-patienten-icon)
   - [6.17 Label-Blöcke (Hinweiszeilen)](#617-label-blöcke-hinweiszeilen)
   - [6.18 Decision-Blöcke (Entscheidungspunkte)](#618-decision-blöcke-entscheidungspunkte)
   - [6.19 Dropdown-Widget](#619-dropdown-widget)
   - [6.20 Branch-Grid (Entscheidungszweige)](#620-branch-grid-entscheidungszweige)
   - [6.21 Spacer (Raster-Platzhalter)](#621-spacer-raster-platzhalter)
   - [6.22 Statuszeile](#622-statuszeile)
7. [Interaktivität und Bedienung](#7-interaktivität-und-bedienung)
   - [7.1 Protokoll-Auswahl](#71-protokoll-auswahl)
   - [7.2 Ordner auf-/zuklappen](#72-ordner-auf-zuklappen)
   - [7.3 Zoom-Bedienung](#73-zoom-bedienung)
   - [7.4 Tastaturkürzel](#74-tastaturkürzel)
   - [7.5 Suche](#75-suche)
   - [7.6 View-Tab-Wechsel](#76-view-tab-wechsel)
   - [7.7 Hover-Interaktion](#77-hover-interaktion)
8. [Datenmodell](#8-datenmodell)
   - [8.1 Top-Level-Struktur](#81-top-level-struktur)
   - [8.2 meta](#82-meta)
   - [8.3 protocols[]](#83-protocols)
   - [8.4 specs{}](#84-specs)
   - [8.5 Blocktypen](#85-blocktypen)
   - [8.6 row](#86-row)
   - [8.7 label](#87-label)
   - [8.8 decision](#88-decision)
   - [8.9 spacer](#89-spacer)
9. [Rendering-Pipeline](#9-rendering-pipeline)
10. [Farbschema und Design-Tokens](#10-farbschema-und-design-tokens)
11. [Responsive Design](#11-responsive-design)
12. [Protokollbestand](#12-protokollbestand)
13. [Lokale Nutzung](#13-lokale-nutzung)
14. [Datenpflege und Erweiterung](#14-datenpflege-und-erweiterung)
15. [Technische Entscheidungen und Designphilosophie](#15-technische-entscheidungen-und-designphilosophie)

---

## 1. Zweck und Zielsetzung

Diese Anwendung bildet die **myExam-Cockpit-Explorer- und Programm-Editor-Ansicht** des Siemens MAGNETOM Prisma Fit für erfasste Kopf- und Wirbelsäulenprotokolle nach. Sie ist **kein** Steuerungs- oder Bediensystem für den Scanner, sondern ein **reines Nachschlage- und Präsentationswerkzeug**, das die am echten Gerät gespeicherten Untersuchungsprogramme in einer optisch originalgetreuen, interaktiven Web-Oberfläche darstellt.

### Anwendungsfälle

| Kontext | Zweck |
|---|---|
| **Anmeldung / Planung** | Schnelles Nachschlagen welche Sequenzen ein Protokoll enthält und wie lange es dauert |
| **Besprechungen** | Präsentation von Protokollstrukturen ohne Zugang zum Scanner |
| **Protokollpflege** | Vergleich und Übersicht aller Protokollvarianten einer Körperregion |
| **Einarbeitung** | Neue Mitarbeiter lernen die Programmstruktur ohne am Gerät zu sitzen |
| **Qualitätssicherung** | Abgleich zwischen dokumentierten und am Gerät gespeicherten Protokollen |

### Designprinzip

Die Oberfläche ist **bewusst scannerähnlich** und nicht als moderne Dashboard- oder Card-Ansicht gestaltet. Das Farbschema, die Schriftgrößen, die Rasterstruktur und alle UI-Elemente orientieren sich am realen myExam-Cockpit-Explorer des MAGNETOM Prisma Fit. Dadurch entsteht eine unmittelbare visuelle Wiedererkennung für alle Anwender, die das Gerät kennen.

---

## 2. Projektstand und Datenumfang

| Merkmal | Wert |
|---|---:|
| Protokolle gesamt | **60** |
| Kopf-Protokolle | **42** |
| Wirbelsäulen-Protokolle | **18** |
| Vollständige Programmspezifikationen | **60** |
| Fehlende Spezifikationen | **0** |
| Extra-Spezifikationen ohne Protokoll | **0** |
| UI-Lanes / Strategie-Spalten | **90** |
| Sequenz-/Interaktionszeilen (Rows) | **905** |
| Label-/Hinweiszeilen | **140** |
| Decision-Blöcke | **76** |
| Decision-Optionen (Branches) | **113** |
| Spacer-/Rasterelemente | **8** |
| Badges (Etagen-Nummern) | **144** |
| Maximale Frame-Breite | **1350 px** |
| Minimale Frame-Breite | **380 px** |

---

## 3. Verzeichnisstruktur

```
mrt-protokolle/
├── assets/
│   ├── css/
│   │   └── myexam-cockpit.css      ← Vollständiges Stylesheet
│   └── js/
│       └── app.js                  ← Rendering- und Interaktionslogik
├── data/
│   ├── protocol-database.js        ← Runtime-Datenbank (window.MYEXAM_PROTOCOL_DATABASE)
│   └── protocol-database.json      ← Identischer Datenbestand als lesbare JSON-Datei
├── index.html                      ← HTML-Grundstruktur der Anwendung
├── manifest.json                   ← Web-App-Manifest (PWA-Basis)
├── Beispielbild UI.png             ← Referenzfoto der echten myExam-Cockpit-Ansicht
└── README.md                       ← Diese Dokumentation
```

### Datei-Rollen im Überblick

| Datei | Rolle |
|---|---|
| `index.html` | DOM-Grundstruktur, lädt CSS und JS |
| `myexam-cockpit.css` | Visuelles Erscheinungsbild, Design-Tokens, alle Klassen |
| `app.js` | Baumaufbau, Suche, Rendering aller Blöcke, Zoom, Tastaturkürzel |
| `protocol-database.js` | Laufzeit-Datenquelle (globale Variable) |
| `protocol-database.json` | Prüf- und Pflegequelle (kein Fetch nötig) |
| `manifest.json` | PWA-Metadaten (Icon, Display-Modus) |

---

## 4. Technische Architektur

### Stack

Die Anwendung verwendet **keinerlei externe Frameworks, Bibliotheken oder Build-Tools**. Sie besteht ausschließlich aus:

- **HTML5** – semantische DOM-Struktur
- **CSS3** – custom properties (Design-Tokens), Grid, Flexbox, clip-path, Übergänge
- **Vanilla JavaScript (ES2020, `'use strict'`)** – kein Transpiling, keine Abhängigkeiten
- **Inline SVG** – alle Icons direkt im HTML/JS codiert

### Ladesequenz

```html
<link rel="stylesheet" href="assets/css/myexam-cockpit.css" />
<script defer src="data/protocol-database.js"></script>
<script defer src="assets/js/app.js"></script>
```

`defer` stellt sicher, dass beide Scripts nach dem DOM-Parsing ausgeführt werden und `protocol-database.js` vor `app.js` läuft (Reihenfolge der `defer`-Scripts ist spezifikationskonform garantiert).

### Datenfluss

```
protocol-database.js
  └── window.MYEXAM_PROTOCOL_DATABASE = { meta, protocols[], specs{} }

app.js (nach DOM-Ready)
  ├── liest window.MYEXAM_PROTOCOL_DATABASE
  ├── buildTree() → verschachtelte Ordner/Protokoll-Struktur
  ├── renderTree() → HTML-Baum in #tree
  └── renderProgram() → Lanes + Blöcke in #program
```

### Offline-Fähigkeit / file://-Kompatibilität

Die Anwendung ist **ohne lokalen Webserver** direkt per Doppelklick auf `index.html` nutzbar. Das funktioniert, weil:
- Die Datenbank als klassisches Script mit globaler Variable (kein `import`, kein `fetch`) geladen wird
- Kein CORS-Kontext entsteht
- Keine externen CDN-Abhängigkeiten existieren

---

## 5. Gesamtaufbau der Benutzeroberfläche

Die Anwendung ist in einem festen **CSS-Grid-Layout** mit fünf vertikalen Zonen gegliedert:

```
┌──────────────────────────────────────────────────────────┐
│ Fenstertitel (31 px)                                      │
├──────────────────────────────────────────────────────────┤
│ Ribbon: Explorer · Programm Editor (64 px)               │
├──────────────────────────────────────────────────────────┤
│ Toolbar + Zoom-Steuerung (42 px)                         │
├────────────────────┬─────────────────────────────────────┤
│ Sidebar (318 px)   │ Workspace (1fr)                      │
│  ┌─ FLEET-Leiste  │  ┌─ Breadcrumb-Pfadzeile            │
│  ├─ Suchzeile     │  └─ Programm-Frame                   │
│  └─ Explorer-Baum │      ├─ View-Tabs                    │
│                   │      └─ Lanes-Grid                   │
│                   │           ├─ Lane 1 (orange Header)  │
│                   │           ├─ Lane 2 ...              │
│                   │           └─ Lane n ...              │
├────────────────────┴─────────────────────────────────────┤
│ Statuszeile (26 px)                                       │
└──────────────────────────────────────────────────────────┘
```

Das Grid der App wird durch `grid-template-rows: 31px 64px 42px 1fr 26px` definiert. Die `1fr`-Hauptzone enthält das `grid-template-columns: 318px 1fr`-Raster für Sidebar und Workspace.

---

## 6. UI-Elemente im Detail

### 6.1 Fenstertitel

```
myExam Cockpit - Explorer                          ? ▢ ×
```

- Linksbündig: Anwendungsname in Fettschrift
- Rechtsbündig: Drei Fenstersteuer-Symbole (Hilfe `?`, Maximieren `▢`, Schließen `×`)
- Rein visuell, keine Funktionalität hinter den Symbolen
- Höhe: 31 px, dunkler Verlauf (#2e302e → #252725)
- Trennung durch 1 px breite Linie nach unten

### 6.2 Ribbon (Menüband)

Das Ribbon bildet zwei Gruppen ab, die die myExam-Cockpit-Menübänder nachstellen:

| Gruppe | Tabs | Min-Breite |
|---|---|---|
| **Explorer** | Browse · Importieren · Export | 310 px |
| **Programm Editor** | Bearbeiten · Simulieren | 250 px |

- Die Gruppen sind als 64 px hohe Kacheln mit Rahmen und Verlauf dargestellt
- Der jeweils erste Tab ist optisch als aktiv hervorgehoben (`.active`)
- Rein visuell, keine Tab-Umschaltfunktion → dient der scannerähnlichen Optik
- Tabs sind dreispaltig (Explorer) bzw. zweispaltig (Programm Editor) verteilt

### 6.3 Toolbar

Die Toolbar enthält eine Reihe von Icon-Buttons, die typische Datei- und Bearbeitungs-Aktionen symbolisieren:

| Position | Icon | Funktion (Symbol) |
|---|---|---|
| Gruppe 1 | Neues Dokument | Neu |
| Gruppe 1 | Import-Pfeil | Importieren |
| *(Trenner)* | `│` | Visueller Separator |
| Gruppe 2 | Papierkorb | Löschen |
| Gruppe 2 | Kopieren | Kopieren |
| Gruppe 2 | Einfügen | Einfügen |
| *(Trenner)* | `│` | Visueller Separator |
| Gruppe 3 | Rückwärtspfeil | Rückgängig |
| Gruppe 3 | Vorwärtspfeil | Wiederholen |

- Alle Icons sind **SVG-basiert** (inline, kein Font)
- Buttons sind interaktiv gestylt (Hover: helle Füllung, Border; Active: etwas heller)
- Reine visuell-referenzielle Funktion (keine Backend-Aktionen)
- Trenner (`.ico-sep`) sind 1 px breite vertikale Linien

### 6.4 Zoom-Steuerung

Die Zoom-Steuerung sitzt **rechts in der Toolbar** und besteht aus drei Elementen:

```
[⊖]  100%  [⊕]
```

| Element | ID | Beschreibung |
|---|---|---|
| Zoom-Out-Button | `#zoomOut` | SVG-Lupe mit Minus-Strich |
| Zoom-Level-Anzeige | `#zoomLevel` | Prozent-Anzeige (z. B. „100%") |
| Zoom-In-Button | `#zoomIn` | SVG-Lupe mit Kreuz |

**Zoom-Stufen** (vordefinierte Schritte):  
`25% → 33% → 50% → 67% → 75% → 90% → 100% → 110% → 125% → 150% → 175% → 200% → 250% → 300%`

**Verhalten:**
- `+`-Button springt zur nächsten höheren Stufe
- `−`-Button springt zur nächsten niedrigeren Stufe
- An den Grenzen (25% / 300%) werden die Buttons `disabled` (ausgeblendet, Cursor: not-allowed)
- Doppelklick auf die Prozentanzeige: **Reset auf 100%**
- CSS `zoom`-Eigenschaft wird direkt auf `#program` (.program-wrap) angewendet

Zoom-Implementierung nutzt **CSS zoom** (nicht `transform: scale`), damit die Scrollfläche des Workspace korrekt mitskaliert und der Scrollbalken-Bereich stets der zoomed Größe entspricht.

### 6.5 Sidebar (Explorer-Bereich)

Die linke Seitenleiste (318 px fest) ist dreizeilig aufgeteilt:

```
grid-template-rows: 40px 43px 1fr
```

1. **FLEET-Leiste** (40 px): Dropdown-Selector + Lock-Symbol
2. **Suchzeile** (43 px): Lupe + Eingabefeld + Lösch-Button + Trefferzähler
3. **Explorer-Baum** (1fr): Scrollbarer Protokollbaum

Die Sidebar ist durch eine 2 px breite dunkle Linie (#141514) vom Workspace getrennt.

#### FLEET-Leiste

Zeigt die aktuelle Fleet-Quelle an:

```
┌──────────────────────────┐ ┌───┐
│ FLEET                  ▼ │ │ 🔒│
└──────────────────────────┘ └───┘
```

- Dropdown-ähnlicher Selector (visuell, nicht funktional)
- Lock-Symbol: SVG-Schloss-Icon (rein visuell)

### 6.6 Explorer-Baum

Der Baum wird **vollständig dynamisch** aus den Protokollpfaden in der Datenbank aufgebaut. Es gibt keine hart codierte Baumstruktur im HTML.

**Baumlogik:**

```
buildTree() zerlegt jeden Protokollpfad anhand ' > ':
"Kopf > Standard > Standard +/- KM"
→ Ordner: "Kopf" → Ordner: "Standard" → Item: "Standard +/- KM"
```

**Knotentypen:**

| Typ | CSS-Klasse | Icon | Verhalten |
|---|---|---|---|
| Ordner (geschlossen) | `.node.folder` | `▸` | Klick öffnet Ordner |
| Ordner (geöffnet) | `.node.folder.open` | `▾` | Klick schließt Ordner |
| Protokoll | `.node.item` | Gerastertes Rechteck | Klick lädt Programm |
| Ausgewählt | `.node.item.selected` | — | Hellgrau hinterlegt |
| Suchtreffer | `.node.search-hit` | Linker orange Balken | — |

**Initialer Zustand:**

Beim Start sind folgende Ordner geöffnet:
- `Kopf`
- `Kopf > Standard`
- `Wirbelsäule`
- `Wirbelsäule > HWS`

Das erste Protokoll (`Kopf > Standard > Standard +/- KM`) ist automatisch ausgewählt.

**Scroll-Verhalten:** Nach Auswahl scrollt der Baum zum gewählten Item (`scrollIntoView({ block: 'nearest' })`).

### 6.7 Suchfunktion

Die Suche ist vollständig **clientseitig**, instantan (bei jedem Tastendruck) und **diakritiknormalisiert** (ü=u, ö=o, ä=a, etc.).

**Suchbereich:** Die Suche durchsucht den gesamten Protokolldatensatz:
- Protokollpfad, Name, Gruppe, Quelle, Notizen
- Lane-Titel
- Sequenznamen, Zeiten, Pills
- Decision-Fragen, Decision-Optionen (Branch-Labels)
- Label-Texte
- Verschachtelte Branch-Inhalte (rekursiv)

**Interaktion:**

| Aktion | Verhalten |
|---|---|
| Tippen | Baum live gefiltert, Treffer hervorgehoben |
| `Enter` | Erstes sichtbares Protokoll wird ausgewählt |
| `×`-Button | Suche geleert, Fokus zurück ins Suchfeld |
| Trefferzähler | Zeigt `n` Treffer oder Gesamtzahl (60) |
| Keine Treffer | `Keine Treffer. Suchbegriff prüfen oder zurücksetzen.` |

Nicht-treffende Knoten werden vollständig ausgeblendet (`.node.hidden`). Übergeordnete Ordner bleiben sichtbar, wenn mindestens ein Kind-Knoten trifft. Suchtreffer erhalten einen linken orangefarbenen Balken (`box-shadow: inset 3px 0 0 var(--orange2)`).

### 6.8 Workspace (Programm-Bereich)

Der Workspace nimmt die verbleibende Breite (`1fr`) ein und hat `overflow: auto`, sodass:
- Breite Programm-Frames (bis 1350 px) horizontal scrollbar sind
- Lange Protokolle (viele Blöcke) vertikal scrollbar sind
- Beim Zoomen der Scroll-Bereich korrekt angepasst wird

Hintergrund: Dunkler Verlauf mit leichtem rötlich-orangenem Radialgradient-Effekt (rechts unten) für optische Tiefe.

**Scrollbars:** Individuell gestylt (`.workspace::-webkit-scrollbar`), harmonisch zum dunklen Design.

### 6.9 Breadcrumb-Pfadzeile

Zeigt den vollständigen Pfad des ausgewählten Protokolls:

```
FLEET » Kopf » Standard » Standard +/- KM  [✎]
```

- Separator: `»` (statt `>`)
- Der Pfeil-Editor-Button `✎` ist als klickbares Symbol gestylt (visuell)
- Text wird bei sehr langen Pfaden mit `text-overflow: ellipsis` abgeschnitten

### 6.10 Programm-Frame

Der Programm-Frame ist der zentrale visuelle Block:

- **Breite** (`--pw`): Aus dem `width`-Feld der Spezifikation, typisch 380–1350 px
- **Border**: 2 px orange (#c86020) mit leichtem orangenem Glow-Schatten
- **Hintergrund**: #2c2e2c

Bei Zoom ≠ 100%: Der gesamte Frame (inkl. Pfadzeile) wird skaliert via CSS `zoom`.

### 6.11 View-Tabs: Patient View / Basic Patient View

```
┌────────────────┐ ┌──────────────────────┐
│  Patient View  │ │  Basic Patient View  │  ← aktiv (grauer Hintergrund)
└────────────────┘ └──────────────────────┘
```

- Zwei Tabs direkt unterhalb des Programm-Frame-Rahmens
- **Klickbar**: Wechsel des aktiven Tabs (visuelles State-Toggle)
- Aktiver Tab: `background: #929690; color: #fff`
- Inaktiver Tab: Semi-transparenter Hintergrund, gedimmte Schrift
- Standard bei Programmstart: **Basic Patient View** aktiv
- Der Tab-Wechsel beeinflusst aktuell die visuelle Darstellung, nicht den Inhalt (beide Views zeigen dieselben Lanes)

### 6.12 Lane-Spalten (Strategie-Spalten)

Lanes sind die orangefarbenen Hauptspalten des Programm-Editors. Jede Lane entspricht einer Untersuchungsstrategie oder -variante:

```
┌──────────────────────────┐ ┌────────────────────────┐
│ ✓  Standard +/- KM       │ │  Unkooperativ          │
├──────────────────────────┤ ├────────────────────────┤
│ ...Sequenzen...          │ │ ...Sequenzen...         │
└──────────────────────────┘ └────────────────────────┘
```

**Eigenschaften:**

| Feld | Bedeutung |
|---|---|
| `title` | Sichtbarer Spaltenkopf-Text |
| `check: true` | Zeigt ✓-Symbol links im Spaltenkopf |
| `blocks[]` | Alle Blöcke in dieser Lane |
| `weight` | Optionale relative Breite (z. B. `weight:2` = doppelt so breit) |

**Lane-Header:**
- Orangefarbener Verlauf (#ff7f1a → #e85800)
- Weißer Text, Fettschrift
- Bei `check: true`: Großes ✓-Symbol links (absolut positioniert)
- Höhe: 30 px

**Lanes-Grid:** CSS-Grid mit `grid-template-columns: var(--cols)`, wobei `--cols` aus Lane-Weights oder gleichmäßigen `1fr`-Anteilen berechnet wird. Zwischen Lanes: 4 px Gap (#1e201e).

**Bekannte Spaltenkombinationen:**

| Protokoll | Lanes |
|---|---|
| Standard Kopf | Standard +/- KM · Unkooperativ |
| Stroke Auswahl | Standard · Optionale Sequenzen |
| MS Verlauf | Standard nativ · Standard KM |
| HWS Deg. | Degenerativ · Trauma (stat.) · Ambulanz · WARP |
| BWS Deg. | Degenerativ · Trauma (stat.) · Ambulanz · WARP |
| LWS Deg. | Degenerativ · Trauma (stat.) · Ambulanz · WARP |
| HWS Tm | Knochen/BS · MS · Myelon/Spinal · Blutung |
| ges. WS Tm | Knochen/BS · MS/spinal · Entzündung · WARP |
| HWS Plexus | Plexus + KM · Plexus-DIXON |
| Liquorleck | SPACE · CISS |

### 6.13 Sequenzzeilen (Rows)

Jede Sequenzzeile (`<div class="row">`) hat eine feste Höhe von **39 px** und enthält vier Bereiche:

```
┌──────────────────────────────────────────────────────────────┐  ─┐
│ t2_tse_dark-fluid_tra_4mm                         03:38       │   │ 39px
│ [👤][1▶]                                [MPR Assignment ▶]  │  ─┘
└──────────────────────────────────────────────────────────────┘
```

| Bereich | CSS-Klasse | Position |
|---|---|---|
| Sequenzname | `.rname` | Oben links, unterstrichen |
| Zeitangabe | `.rtime` | Oben rechts (absolute) |
| Patienten-Icon + Badge | `.ricons` | Unten links (absolute) |
| Funktions-Pill | `.pill` | Unten rechts (absolute) |

**Alternierend:** Gerade Zeilen sind geringfügig dunkler (`nth-child(even)`).

**Hover:** Leichte Aufhellung via `filter: brightness(1.08)`.

**Blanke Zeilen:** Zeilen ohne Namen (`blank: true`) rendern als vollständig leere Rows (unsichtbarer Name, Hintergrundfarbe erhalten). Der Patienten-Icon und der leere Bereich bleiben sichtbar.

**Tooltip:** Jede Row hat ein `title`-Attribut mit Sequenzname, Zeit und Pill-Text.

**Wichtig zu `rname`:** `max-width: calc(100% - 90px)` verhindert Überlappung mit der rechts positionierten Zeitangabe.

### 6.14 Funktions-Pills

Pills sind rechts unten in Rows positionierte Funktionslabels, die Scanner-spezifische Automatisierungsblöcke kennzeichnen:

| Pill-Text | Bedeutung |
|---|---|
| `AutoAlign Scout` | Automatische Patientenpositionierung (Kopf) |
| `Spine Scout` | Automatischer Wirbelsäulen-Scout |
| `Spine Positioning` | Automatische WS-Positionierung |
| `Spine Verification` | AutoAlign-Verifikationsschritt (WS) |
| `MPR Assignment` | MPR-Zuweisungssequenz |
| `MPR Planning` | MPR-Planungssequenz |
| `Basic Decision` | Entscheidungspunkt im Programm |
| `Generic Views` | Generische Planungsansicht |
| `Spectroscopy` | Spektroskopie-Sequenz |
| `Advanced Application` | Automatisch gestartete Nachverarbeitung |
| `Morpho` | Morpho/3D-Applikationskontext |

**Styling:**
- Abgerundete Rechteck-Form (2 px Radius)
- Halbtransparenter Hintergrund (`rgba(210,214,208,.38)`)
- Heller Rand und innerer Glow-Schatten
- Kleines ▶-Symbol links (in kreisförmigem Border)
- Höhe: 21 px

### 6.15 Badges (Etagen-Markierungen)

Badges sind kleine pfeilförmige Labels mit Nummern, die vor allem in Wirbelsäulenprotokollen zur Kennzeichnung von Etagen (Segmenten) verwendet werden:

```
[◁1▶]  [◁2▶]  ...  [◁8▶]
```

- **Form:** Chevron/Pfeil via `clip-path: polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 14% 50%)`
- **Farbe:** Weißer Hintergrund, dunkelgrauer Text
- **Größe:** 14 px hoch, variabel breit
- **Position:** In `.ricons` (unten links), rechts neben dem Patienten-Icon
- **Bedeutung:** Wirbelsäulen-Etage (1=zervikal, 2=thorakal, etc.) oder Sequenznummer innerhalb einer Etage

### 6.16 Patienten-Icon

Das Patienten-Icon (`PERSON_SVG`) ist ein **inline SVG-Strichfigur** (10 × 15 px):

```
  ○      ← Kopf
 /|\     ← Arme / Torso
 / \     ← Beine
```

SVG-Elemente:
- Kreis (Kopf, `cx=6, cy=3, r=2.1`)
- Pfad-Polygon (Torso, Trapezform)
- Vier Linien (2 Arme, 2 Beine, `stroke-linecap: round`)

Farbe: `currentColor` (erbt #c0c5bc aus `.ricons`). Erscheint in jeder Sequenzzeile unten links.

### 6.17 Label-Blöcke (Hinweiszeilen)

Label-Blöcke sind nicht-sequenzielle Textzeilen, die Hinweise, Instruktionen oder Interaktionsmarker darstellen:

```css
.label {
  min-height: 29px;
  background: #626660 → #595d58 (Verlauf);
  color: #f0f2ee;       /* weißlicher Text */
  font-weight: 700;
  font-size: 12px;
  padding: 5px 10px;
}
```

**Wichtig:** Alle 140 Labels in der Datenbank haben `tone: 'normal'` oder `tone: undefined`. Es gibt **keine** Labels mit `tone: 'orange'`, weshalb alle Labels weiß gerendert werden. Die orangen, zentrierten Texte im Programm-Editor (z. B. „T2-FLAIR", „mit KM?") stammen ausschließlich von **Decision-Titles** (`.decision-title`), nicht von Label-Blöcken.

Beispiele:
- `Laser auf Kinnspitze`
- `AutoAlign Verifikation`
- `Kontrastmittel injizieren`
- `KM-Gabe nach 5.Messung`
- `MPR: Planung für 3D FLAIR kontrollieren`
- `Perfusion: nur -ep2d_perf_p2 MoCo archivieren`
- `Pat. vor Untersuchung über Fingertapping instruieren`
- `1. Mess. nativ – KM in Pause starten 3er Flow`

### 6.18 Decision-Blöcke (Entscheidungspunkte)

Ein Decision-Block stellt einen echten myExam-Programm-Editor-Entscheidungspunkt dar. Er besteht aus drei Elementen, die vertikal gestapelt werden:

```
┌────────────────────────────────────────────────────────┐
│ T2-FLAIR                      [TSE2D ▾] [Basic Decision▶]│  ← .decision-q
├────────────────────────────────────────────────────────┤
│                    T2-FLAIR                            │  ← .decision-title (orange)
├─────────────────────────┬──────────────────────────────┤
│         TSE2D           │          SPACE/3D            │  ← .branch-grid
│ ┌─────────────────────┐ │ ┌──────────────────────────┐ │
│ │ t2_tse_dark-fluid   │ │ │ 3D_space_darkfluid  04:34│ │
│ │ _tra_4mm     03:38  │ │ │ [MPR Assignment ▶]       │ │
│ └─────────────────────┘ │ └──────────────────────────┘ │
└─────────────────────────┴──────────────────────────────┘
```

**1. Decision-Q-Row (`.decision-q`)**
- Höhe: 39 px (wie normale Rows)
- Zeigt Frage-Text (`.qtext`), Dropdown-Widget (`.dropdown`) und hardcoded „Basic Decision"-Pill
- Hintergrundverlauf leicht dunkler als normale Rows

**2. Decision-Title (`.decision-title`)**
- Höhe: 25 px
- Orangefarbener Text (`var(--orange2)`) zentriert
- Dunkle Hintergrund-Leiste (unterscheidet sich von Rows)

**3. Branch-Grid (`.branch-grid`)**
- CSS-Grid: `repeat(n, 1fr)` Spalten
- Jeder Branch (`<div class="branch">`) hat einen grauen Header (`<div class="branch-head">`)
- Branches enthalten wiederum beliebige Blöcke (Rows, Labels, weitere Decisions)

**Rekursivität:** Decision-Branches können weitere Decisions enthalten (unbegrenzte Verschachtelung).

### 6.19 Dropdown-Widget

Das Dropdown-Widget (`.dropdown`) innerhalb der Decision-Q-Row simuliert das Scanner-Dropdown:

```
┌──────────────────┐
│ TSE/2D          ▾│
└──────────────────┘
```

- Zeigt den `default`-Wert der Decision
- Visuell (Cursor default), keine echte Auswahlfunktion
- Grauer Verlauf, heller Rahmen
- Pfeil-Symbol `▾` rechts (absolut positioniert via CSS `::after`)

### 6.20 Branch-Grid (Entscheidungszweige)

Branches werden in einem gleichmäßigen Grid (`repeat(n, 1fr)`) nebeneinander dargestellt:

```
┌─────────────────────────┬──────────────────────────────┐
│         Ja              │             Nein             │ ← .branch-head
├─────────────────────────┼──────────────────────────────┤
│ [Kontrastmittel]        │ t2_tse_sag_3mm   02:23       │ ← Branch-Blöcke
│ t2_tse_sag_3mm 02:23   │                              │
│ t1_mprage...    04:39   │                              │
│ [MPR Assignment]        │                              │
└─────────────────────────┴──────────────────────────────┘
```

- Branch-Headers (`.branch-head`): 25 px hoch, grauer Verlauf
- Branches trennen sich durch 2 px dunkle Linie (außer letzte)
- Alle Blöcke innerhalb eines Branches werden mit denselben Rendering-Funktionen erzeugt wie normale Lane-Blöcke

### 6.21 Spacer (Raster-Platzhalter)

Spacer sind bewusst gesetzte Leerräume, die die vertikale Ausrichtung von Inhalten über mehrere Lanes synchronisieren:

```json
{ "t": "spacer", "n": 3 }
```

→ Erzeugt eine leere Fläche von `3 × 39 = 117 px` Höhe.

**Anwendungsfall:** In `Standard +/- KM` nimmt die T2-FLAIR-Decision (mit ihren zwei Branches und mehreren Zeilen) mehr vertikale Höhe ein als der entsprechende Bereich in der Unkooperativ-Lane. Ein Spacer mit `n: 3` in der Unkooperativ-Lane stellt die vertikale Ausrichtung der nachfolgenden Blöcke sicher.

### 6.22 Statuszeile

Die Statuszeile am unteren Rand zeigt kontextsensitive Information:

| Zustand | Inhalt |
|---|---|
| Beim Laden | `Bereit.` |
| Protokoll ausgewählt | `Kopf > Standard > Standard +/- KM · 2 Spalten` |
| Hover über Sequenz | `Sequenz: t2_tse_dark-fluid_tra_4mm · 03:38 · MPR Assignment` |
| Maus verlässt Sequenz | Zurück zum Protokoll-Status |

Höhe: 26 px, sehr dunkler Hintergrund (#181918), gedimmte Schrift.

---

## 7. Interaktivität und Bedienung

### 7.1 Protokoll-Auswahl

Klick auf ein Protokoll (`.node.item`) im Explorer-Baum:
1. Hebt vorherige Auswahl auf
2. Markiert das neue Item als `.selected`
3. Scrollt das Item ins sichtbare Fenster
4. Ruft `renderProgram()` auf → Workspace wird neu gerendert
5. Statuszeile zeigt Protokollpfad + Spaltenanzahl

### 7.2 Ordner auf-/zuklappen

Klick auf einen Ordner (`.node.folder`):
- Öffnet den Ordner (fügt Pfad zu `openFolders` hinzu) → Unterpfade werden sichtbar
- Schließt einen offenen Ordner (entfernt Pfad aus `openFolders`) → Kinder werden ausgeblendet
- `renderTree()` wird nach jeder Änderung aufgerufen

Ordner-Zustände werden in dem `Set<string> openFolders` im Speicher gehalten (kein LocalStorage, kein Persistenz).

### 7.3 Zoom-Bedienung

| Methode | Aktion |
|---|---|
| Klick `[⊕]` | Nächste höhere Zoom-Stufe |
| Klick `[⊖]` | Nächste niedrigere Zoom-Stufe |
| Doppelklick auf `100%` | Reset auf 100% |
| `Strg++` / `Strg+=` | Zoom In |
| `Strg+-` | Zoom Out |
| `Strg+0` | Zoom Reset auf 100% |
| `Strg+Scroll` im Workspace | Zoom In/Out per Mausrad |

### 7.4 Tastaturkürzel

| Kürzel | Funktion |
|---|---|
| `Strg++` / `Strg+=` | Programm-Frame vergrößern |
| `Strg+-` | Programm-Frame verkleinern |
| `Strg+0` | Zoom auf 100% zurücksetzen |
| `Strg+F` | Fokus ins Suchfeld (Text wird selektiert) |
| `Escape` (im Suchfeld mit Text) | Suche leeren |
| `Escape` (Suchfeld leer / anderer Fokus) | Fokus vom Suchfeld wegnehmen |
| `Enter` (im Suchfeld) | Erstes sichtbares Protokoll auswählen |

### 7.5 Suche

Volltext-Suche über den gesamten Protokolldatenbestand. Die Suche:
- Normalisiert Diakritika (ä→a, ö→o, ü→u, etc.) für umlauttoleranles Suchen
- Ist **case-insensitive**
- Filtert den Baum live (ohne Wartezeit)
- Zeigt die Anzahl der Treffer rechts in der Suchzeile
- Macht nicht-treffende Knoten mit Hervorhebung sichtbar (orangefarbener Balken links)

**Suchalgorithmus (`branchMatches`):**
- Für Items: sucht in allen Feldern des Protokolls UND seiner Spezifikation
- Für Ordner: bleibt sichtbar, wenn mindestens ein Kind-Protokoll trifft

### 7.6 View-Tab-Wechsel

Klick auf „Patient View" oder „Basic Patient View":
1. Entfernt `.active` von allen Tabs
2. Setzt `.active` auf den geklickten Tab
3. Aktualisiert `activeView`-Variable
4. Wird beim nächsten `renderProgram()` berücksichtigt

### 7.7 Hover-Interaktion

**Hover über Sequenzzeile:**
- Statuszeile zeigt: `Sequenz: [Name] · [Zeit] · [Pill]`
- Row erhellt leicht (CSS `filter: brightness(1.08)`)
- Tooltip (HTML `title`-Attribut) zeigt alle Felder

**Maus verlässt Row:**
- Statuszeile kehrt zurück zu: `[Protokollpfad] · [n] Spalten`

---

## 8. Datenmodell

Die gesamte Datenbasis liegt in `data/protocol-database.js` (Runtime) und `data/protocol-database.json` (Referenz).

### 8.1 Top-Level-Struktur

```json
{
  "meta":      { /* Metadaten */ },
  "protocols": [ /* 60 Protokoll-Objekte */ ],
  "specs":     { /* 60 Schlüssel → Spezifikation */ }
}
```

### 8.2 meta

```json
{
  "title":            "myExam Cockpit Explorer · Prisma Fit",
  "version":          "v7_spine_full_ui_rebuild",
  "protocols_total":  60,
  "kopf_protocols":   42,
  "spine_protocols":  18,
  "ui_reference":     "Beispielbild UI.png",
  "source_index":     "index.html"
}
```

### 8.3 protocols[]

Jedes Protokoll-Objekt:

```json
{
  "group":  "Standard",
  "name":   "Standard +/- KM",
  "path":   "Kopf > Standard > Standard +/- KM",
  "source": "Originalfoto myExam Cockpit + PDF-Basis",
  "notes":  "Foto-basiert aktualisierte myExam-Program-Editor-Darstellung.",
  "rows":   [ /* flache Tabelle als Fallback/Suchindex */ ],
  "root":   "Kopf",
  "folder1": "Standard"
}
```

`rows` enthält die Protokollsequenzen als flaches Array (Fallback-Format für ältere Strukturen und als Suchindex-Basis).

### 8.4 specs{}

Key = Protokollpfad (exakt). Value = Spezifikationsobjekt:

```json
"Kopf > Standard > Standard +/- KM": {
  "width":  950,
  "layout": "lanes",
  "title":  "Standard +/- KM",
  "lanes":  [ /* Lane-Objekte */ ]
}
```

| Feld | Typ | Bedeutung |
|---|---|---|
| `width` | number | Frame-Breite in Pixeln |
| `layout` | string | `"lanes"` (multi-lane) oder `"single"` |
| `title` | string | Protokoll-Titel |
| `lanes` | Lane[] | Strategie-Spalten |

Gemessene `width`-Werte in der Datenbank: 380–1350 px.

### 8.5 Blocktypen

| `t`-Wert | Klasse | Beschreibung |
|---|---|---|
| `"row"` | `.row` | Sequenz-/Interaktionszeile |
| `"label"` | `.label` | Hinweis-/Instruktionszeile |
| `"decision"` | — | Entscheidungspunkt mit Branches |
| `"spacer"` | `.spacer` | Vertikaler Raster-Platzhalter |

### 8.6 row

```json
{
  "t":     "row",
  "name":  "t2_tse_dark-fluid_tra_4mm",
  "time":  "03:38",
  "pill":  "MPR Assignment",
  "badge": "2",
  "note":  ""
}
```

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `name` | nein | Sequenzname (leer → blanke Zeile) |
| `time` | nein | Messzeit (MM:SS) |
| `pill` | nein | Funktions-Label (s. Pill-Liste) |
| `badge` | nein | Etagen-Nummer (1–8) |
| `note` | nein | Zusatzinfo (im Tooltip sichtbar) |

### 8.7 label

```json
{
  "t":    "label",
  "text": "Kontrastmittel injizieren",
  "tone": "normal"
}
```

| `tone`-Wert | Darstellung |
|---|---|
| `undefined` / `"normal"` | Weißer Text auf grauem Hintergrund |
| `"orange"` | Oranger Text, zentriert (existiert in aktueller DB nicht) |

### 8.8 decision

```json
{
  "t":       "decision",
  "q":       "T2-FLAIR",
  "default": "TSE/2D",
  "title":   "T2-FLAIR",
  "cols": [
    {
      "label":  "TSE/2D",
      "blocks": [ { "t": "row", ... } ]
    },
    {
      "label":  "SPACE/3D",
      "blocks": [ { "t": "row", ... }, { "t": "row", ... } ]
    }
  ],
  "note": ""
}
```

| Feld | Bedeutung |
|---|---|
| `q` | Frage-Text in der Decision-Q-Row |
| `default` | Im Dropdown angezeigter Default-Wert |
| `title` | Oranger Title-Bar-Text |
| `cols[]` | Branches (je 1 bis n Optionen) |
| `cols[].label` | Branch-Header-Text |
| `cols[].blocks[]` | Beliebige Blöcke im Branch |

### 8.9 spacer

```json
{
  "t": "spacer",
  "n": 3
}
```

Rendert als leere div mit `height: n × 39px`. `n` ist die Anzahl der zu überbrückenden Zeilen-Äquivalente.

---

## 9. Rendering-Pipeline

```
renderProgram()
├── byPath[selectedPath] → Protokoll-Objekt p
├── normalizeSpec(specs[p.path], p) → normalisierte Spec s
│   ├── spec.lanes vorhanden → direkt verwenden
│   ├── spec.blocks vorhanden → in einzelne Lane wrappen
│   └── kein spec → fallbackSpec(p) aus rows[]
├── lanes.map(l => l.weight || '1fr').join(' ') → CSS-Columns
├── Render: pathline + program-frame HTML
│   └── lanes.map(renderLane)
│       └── renderBlocks(lane.blocks)
│           └── für jeden Block: renderBlock(b)
│               ├── b.t === 'spacer'   → <div class="spacer">
│               ├── b.t === 'label'    → <div class="label">
│               ├── b.t === 'decision' → renderDecision(b)
│               │   ├── .decision-q (Frage + Dropdown + Pill)
│               │   ├── .decision-title (oranges Titelband)
│               │   └── .branch-grid → cols.map(renderBranch)
│               │       └── branch-head + renderBlocks(col.blocks)
│               └── default            → renderRow(b)
│                   ├── .rname (Name)
│                   ├── .rtime (Zeit)
│                   ├── .ricons (Patienten-SVG + Badge)
│                   └── .pill (Funktionslabel)
└── applyZoom() → CSS zoom auf #program setzen
```

**Wichtige Rendering-Eigenschaften:**
- **Rekursiv:** `renderBlocks` und `renderDecision` rufen sich gegenseitig auf (Entscheidungen in Entscheidungen möglich)
- **String-basiert:** Kein Virtual DOM, kein Diff-Algorithmus — reines `innerHTML`-Setzen
- **XSS-sicher:** Alle Datenwerte werden durch `esc()` HTML-escaped
- **Performant:** Kein Framework-Overhead, direktes DOM-Update

---

## 10. Farbschema und Design-Tokens

Alle Farben werden als CSS Custom Properties definiert:

| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | `#252625` | Haupt-Hintergrund |
| `--bg2` | `#2b2c2b` | Sekundärer Hintergrund |
| `--panel` | `#333533` | Panel-Hintergrund |
| `--orange` | `#ff6400` | Primäres Orange |
| `--orange2` | `#ff7a16` | Sekundäres Orange (Texte, Pills) |
| `--orange-head-top` | `#ff7f1a` | Lane-Header Verlauf oben |
| `--orange-head-bot` | `#e85800` | Lane-Header Verlauf unten |
| `--text` | `#f4f5f2` | Haupttext |
| `--muted` | `#c8ccc4` | Gedämmter Text |
| `--sel` | `#cfd4ca` | Ausgewähltes Item |
| `--selText` | `#202220` | Text in ausgewähltem Item |
| `--green` | `#00c32a` | Grün (reserviert) |
| `--focus-ring` | `rgba(255,160,60,.55)` | Fokus-Rahmen |

**Gradienten:** Fast alle UI-Elemente nutzen `linear-gradient(180deg, ...)` für eine subtile vertikale Tiefe, die dem realen myExam-Cockpit-Erscheinungsbild nachempfunden ist.

---

## 11. Responsive Design

| Breakpoint | Änderung |
|---|---|
| `≤ 1200px` | Sidebar 290 px, Ribbon-Gruppen schmaler |
| `≤ 900px` | Sidebar 260 px, View-Tabs kompakter |
| `≤ 680px` | Sidebar versteckt, volle Breite für Workspace |

Der Workspace scrollt (`overflow: auto`) bei breiten Programm-Frames (bis 1350 px) horizontal. Beim Zoomen passt sich die Scroll-Fläche automatisch an.

Die Anwendung ist **primär für Desktop** ausgelegt (mindestens 900 px Breite empfohlen). Mobile-Nutzung ist technisch möglich aber nicht die Zielplattform.

---

## 12. Protokollbestand

### Kopf (42 Protokolle)

#### Standard
| Protokoll | Lanes | Frame-Breite |
|---|---|---|
| Standard +/- KM | 2 (Standard +/- KM · Unkooperativ) | 950 px |
| Sequenzauswahl | 1 | — |
| SwiftMR_Standard +/- KM | 2 (Standard +/- KM · Unkooperativ) | 950 px |

#### Stroke
| Protokoll | Lanes |
|---|---|
| Auswahl | 2 (Standard · Optionale Sequenzen) |
| TGA | 1 |
| Standard #15 | 1 |

#### Dissektion
| Protokoll | Lanes |
|---|---|
| Standard | 0 (Fallback) |

#### Sinusthrombose
| Protokoll | Lanes |
|---|---|
| Standard | 0 (Fallback) |

#### AVM
| Protokoll | Lanes |
|---|---|
| Standard | 1 |

#### Aneurysma
| Protokoll | Lanes |
|---|---|
| Z. n. Coiling/Clipping | 0 (Fallback) |

#### Entzündung
| Protokoll | Lanes |
|---|---|
| Standard | 0 (Fallback) |

#### MS
| Protokoll | Lanes |
|---|---|
| Verlauf nativ / KM | 2 (Standard nativ · Standard KM) |
| Schädel + Wirbelsäule | 1 |
| Erstdiagnostik | 1 |

#### Epilepsie
| Protokoll | Lanes |
|---|---|
| Standard | 1 (Standard KM) |

#### Neurodegeneration
| Protokoll | Lanes |
|---|---|
| Standard | 0 (Fallback) |

#### Kopfschmerz Migräne
| Protokoll | Lanes |
|---|---|
| Standard | 1 |

#### Hirntumor
| Protokoll | Lanes |
|---|---|
| Erstdiagnostik | 1 |
| Standard | 2 (Standard · Unkooperativ) |
| Erstdiagnostik mit Navi | 1 |
| Früh-MRT/post-OP | 1 |
| Verlauf | 1 |

#### NEURORAD
| Protokoll | Lanes |
|---|---|
| postintervent. Kontrolle | 0 (Fallback) |
| SVT | 0 (Fallback) |

#### NNH
| Protokoll | Lanes |
|---|---|
| Sinusitis | 2 (Sinusitis · Alt) |

#### Neuro-Navigation
| Protokoll | Lanes |
|---|---|
| Navi | 1 |
| FT | 1 |

#### Trauma
| Protokoll | Lanes |
|---|---|
| Trauma | 1 |
| Sequenzauswahl | 1 |

#### Vaskulitis
| Protokoll | Lanes |
|---|---|
| Standard | 1 |

#### Wernicke Enzephalitis
| Protokoll | Lanes |
|---|---|
| Standard | 1 |

#### funktionelles MRT
| Protokoll | Lanes |
|---|---|
| Standard | 1 |

#### Spektroskopie
| Protokoll | Lanes |
|---|---|
| svs | 1 |
| csi | 1 |

#### Hypophyse
| Protokoll | Lanes |
|---|---|
| Standard | 1 (Standard + KM) |

#### INTRAGO
| Protokoll | Lanes |
|---|---|
| INTRAGO | 1 |

#### KHBW
| Protokoll | Lanes |
|---|---|
| Standard | 2 (Standard · Alternativsequenzen) |
| KHBW SwiftMRI | 2 |

#### Kiefergelenke
| Protokoll | Lanes |
|---|---|
| Kiefergelenke | 1 (Strategie) |

#### Orbita
| Protokoll | Lanes |
|---|---|
| Standard | 1 |

#### Sequenzen
| Protokoll | Lanes |
|---|---|
| Sequenzen | 1 |

#### Arteriitis Temporalis
| Protokoll | Lanes |
|---|---|
| Standard | 1 |

### Wirbelsäule (18 Protokolle)

#### HWS
| Protokoll | Lanes | Frame-Breite |
|---|---|---|
| Deg. / Trauma / Amb. | 4 (Degenera · Trauma · Ambulanz · WARP) | 1190 px |
| Tm / MS / Entz. / Blutung | 4 | 1110 px |
| Plexus | 2 (Plexus + KM · Plexus-DIXON) | — |
| Zusätze / FAST | 2 | — |

#### BWS
| Protokoll | Lanes | Frame-Breite |
|---|---|---|
| Deg. / Trauma / Amb. | 4 | 1190 px |
| Tm / Myelon / Blutung | 3 | 960 px |
| Zusätze | 1 | — |

#### LWS
| Protokoll | Lanes | Frame-Breite |
|---|---|---|
| Deg. / Trauma / Amb. | 4 | 1190 px |
| Tm / Entz. / Blutung | 3 | 960 px |
| Zusätze / Plexus sacralis | 2 | — |
| Alternativen | 1 | — |
| FAST | 1 | — |

#### gesamte WS
| Protokoll | Lanes | Frame-Breite |
|---|---|---|
| Tm / MS / Entz. | 4 | 1350 px |
| Trauma | 3 | 1000 px |
| Liquorleck | 2 (SPACE · CISS) | — |
| Fast | 3 | — |
| SwiftMR_Fast | 3 | — |
| Spinale Angio | 1 (Strategie) | — |

---

## 13. Lokale Nutzung

### Direktstart (ohne Server)

1. ZIP/Repository entpacken
2. `index.html` doppelklicken
3. Anwendung öffnet im Standard-Browser

**Hinweis:** Chrome/Edge blockieren `file://`-Scripts gelegentlich. Falls die Anwendung leer erscheint, den lokalen Server nutzen.

### Lokaler Webserver (empfohlen)

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js (npx):**
```bash
npx serve .
```

Dann `http://localhost:8000` öffnen.

### Kompatibilität

| Browser | Unterstützt |
|---|---|
| Chrome / Edge (aktuell) | ✅ vollständig |
| Firefox (aktuell) | ✅ vollständig |
| Safari (aktuell) | ✅ CSS zoom |
| IE / alte Browser | ❌ nicht unterstützt |

---

## 14. Datenpflege und Erweiterung

### Protokoll hinzufügen

1. In `data/protocol-database.json`: Neuen Eintrag in `protocols[]` ergänzen
2. Denselben Pfad als Schlüssel in `specs{}` anlegen (vollständige Spec)
3. Änderungen in `data/protocol-database.js` übertragen
4. **Wichtig:** `protocol.path` muss exakt dem `specs`-Schlüssel entsprechen

### Lane hinzufügen

```json
{
  "title": "Neue Lane",
  "check": false,
  "blocks": []
}
```

Füge die Lane in das `lanes[]`-Array der entsprechenden Spec ein. Die Breite wird durch `weight` (optional) oder gleichmäßige `1fr`-Verteilung bestimmt.

### Sequenzzeile hinzufügen

```json
{
  "t": "row",
  "name": "t2_tse_tra_4mm",
  "time": "03:30",
  "pill": "MPR Assignment"
}
```

### Decision hinzufügen

```json
{
  "t": "decision",
  "q": "Frage?",
  "default": "Nein",
  "title": "Frage?",
  "cols": [
    { "label": "Ja",   "blocks": [] },
    { "label": "Nein", "blocks": [] }
  ]
}
```

### Spacer hinzufügen

```json
{ "t": "spacer", "n": 2 }
```

`n` = Anzahl der Zeilen-Äquivalente (1 Äquivalent = 39 px).

### Label hinzufügen

```json
{ "t": "label", "text": "Hinweistext", "tone": "normal" }
```

### Qualitätsprüfung nach Änderungen

- [ ] Baum zeigt neues Protokoll korrekt?
- [ ] Protokoll auswählbar, Programm-Frame erscheint?
- [ ] Lane-Titel korrekt?
- [ ] Reihenfolge der Blöcke stimmt?
- [ ] Zeiten korrekt angegeben (MM:SS)?
- [ ] Pills korrekt (nur erlaubte Werte aus `PILL_KINDS`)?
- [ ] Decision-Branches nebeneinander?
- [ ] Spacer vertikal korrekt ausgerichtet?
- [ ] Suche findet Sequenznamen und Decisions?
- [ ] Browser-Konsole ohne Fehler?

---

## 15. Technische Entscheidungen und Designphilosophie

### Keine Frameworks

**Begründung:** Die Anwendung war und ist vollständig eigenständig lauffähig. Frameworks wie React oder Vue würden:
- einen Build-Schritt erfordern (widerspricht `file://`-Kompatibilität)
- keine signifikante Vereinfachung bringen (keine komplexen State-Updates)
- die Dateigröße und Ladezeit erhöhen
- Abhängigkeiten einführen, die in klinikinternen Umgebungen nicht verfügbar sein müssen

### CSS zoom statt transform: scale

**Begründung:** `CSS zoom` beeinflusst das Layout-Modell korrekt — der Scroll-Container passt seine Scrollfläche dem gezoomten Inhalt an. `transform: scale` würde den Frame geometrisch skalieren, aber das Element bleibt im Layout in seiner originalen Größe, was zu falschen Scrollbereichen führt. CSS zoom ist in allen modernen Browsern unterstützt.

### Datenbank als JS + JSON

- **JS** (`window.MYEXAM_PROTOCOL_DATABASE`): Runtime-Quelle, kein `fetch()` nötig → `file://`-kompatibel
- **JSON**: Lesbare/prüfbare Referenz für Datenpflege, Diff und externe Tools

Beide Dateien werden synchron gehalten.

### Defer-Scripts ohne ES-Module

`<script defer>` garantiert:
1. DOM ist vollständig geparst vor Script-Ausführung
2. Scripts laufen in DOM-Reihenfolge (`protocol-database.js` vor `app.js`)
3. Kein CORS-Problem bei `file://`

ES-Module (`<script type="module">`) wären bei `file://` durch CORS blockiert.

### Inline SVG für Icons

Alle Icons (Patienten-Icon, Zoom-Buttons, Toolbar-Icons, Suche, Lock) sind direkt als SVG im HTML/JS codiert. Vorteile:
- Keine externe Icon-Library nötig
- Vollständige Farbkontrolle via `currentColor`
- Keine Netzwerk-Requests
- Pixelgenaue Darstellung bei jedem Zoom-Level

### Rekursives Rendering

`renderBlocks()` und `renderDecision()` rufen sich gegenseitig auf. Das ermöglicht beliebig verschachtelte Decision-Strukturen (Decision innerhalb Decision). In der aktuellen Datenbasis kommen verschachtelte Decisions nicht vor, aber die Architektur unterstützt es.

### XSS-Schutz

Alle Datenbankwerte durchlaufen `esc()` vor der HTML-Ausgabe:
```js
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({...}[c]));
}
```

Es gibt keine `eval()`, keine `innerHTML`-Zuweisung von nicht-escapet Daten.

---

*Anwendung entwickelt als Offline-Viewer für das Siemens MAGNETOM Prisma Fit myExam Cockpit. Alle Protokoll- und Sequenzdaten stammen aus dem real am Scanner gespeicherten Programmbestand und sind auf den klinischen Alltagseinsatz optimiert.*
