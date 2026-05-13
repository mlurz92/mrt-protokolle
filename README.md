# myExam Cockpit Explorer Clone (MAGNETOM MRT)

## 1. Zweck und Leitbild
Diese Anwendung bildet den visuellen und funktionalen Charakter des **myExam Cockpit – Explorer** für Kopf-Protokolle nach. Ziel ist ein präzises, belastbares Arbeits-UI für schnelles Navigieren in Protokollbäumen, klare Sequenzdarstellung, robuste Decision-Branches und durchgehend hohe Lesbarkeit auf großen klinischen Displays.

## 2. Architektur (refaktoriert auf Multi-Datei-Struktur)

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── app.css
│   └── js/
│       └── app.js
└── README.md
```

### Warum diese Struktur?
- **Trennung von Verantwortung:** Markup, Stil und Logik sind unabhängig wartbar.
- **Schnellere Iteration:** UI/UX-Feinschliff in CSS ohne Script-Risiken.
- **Bessere Testbarkeit:** Rendering-/Suchlogik zentral in `app.js`.

## 3. UI/UX-Designsystem

### 3.1 Farb- und Kontrastsystem
- Dunkles, kliniktaugliches Grundschema mit blau/schwarzem Verlauf.
- Orange als Primär-Akzent für Lane-Köpfe und Decision-Titel.
- Hoher Textkontrast für Sequenznamen, Zeiten und Navigationsbaum.

### 3.2 Typografie und Hierarchie
- Klare Ebenen: Ordner/Items links, Protokoll-Flow rechts.
- Große Sequenzschrift zur Distanzlesbarkeit.
- Zeitangaben und Action-Pills konstant positioniert zur visuellen Routine.

### 3.3 Kollisionsfreiheit / keine Überlagerung
- Grid-basierte Lane-Architektur statt freier Positionierung.
- Mindesthöhen für Reihen und Labels.
- Begrenzte Textbreiten + Ellipsis gegen Überschneidung von Namen und Zeit.

## 4. Interaktionsmodell

### 4.1 Explorer (linke Seite)
- Baumdarstellung aller Protokolle.
- Expand/Collapse auf Folder-Ebene.
- Selektionszustand klar hervorgehoben.

### 4.2 Suche
- Live-Filter über:
  - Ordnernamen
  - Protokollnamen
  - Sequenznamen
  - Decision-Inhalte
  - Branch-Texte
- Trefferzähler inkl. „Keine Treffer“-Fallback.

### 4.3 Programmansicht
- Lane-Header pro Programmzweig.
- Sequenzzeile mit Name, Zeit, optionaler Funktions-Pill.
- Decision-Blöcke mit Frage, Default-Auswahl und Branch-Spalten.

## 5. Datenmodell
`app.js` enthält zwei zentrale Datenräume:
- `PROTOCOLS`: lineare Protokoll-/Sequenzdaten inkl. Pfad und Metadaten.
- `SPECS`: visuelle Strukturdefinitionen (Lanes, Blöcke, Decisions, Labels).

Rendering kombiniert beide Ebenen, damit sowohl strukturierte Spezifikation als auch lineare Fallback-Darstellung zuverlässig funktionieren.

## 6. Rendering-Engine (Funktionsprinzip)
1. Auswahlpfad aus Tree bestimmen.
2. Spec laden (`SPECS[path]`) oder Fallback aus `PROTOCOLS` generieren.
3. HTML-Fragmente für Blöcke (`row`, `label`, `decision`, `spacer`) erzeugen.
4. Lane-Grid mit stabiler Spaltenlogik ausgeben.

## 7. Lesbarkeits-Optimierungen im aktuellen Stand
- Einheitliche Abstände in Zeilen und Branches.
- Konsistente horizontale Ausrichtung von Zeit und Pills.
- Verbesserte Sidebar-Sichtbarkeit bei tiefen Bäumen.
- Responsives Verhalten mit abgestuftem Schriftbild unter 1280px.

## 8. Wartbarkeit und Erweiterung

### Neue Protokolle hinzufügen
1. Eintrag in `PROTOCOLS` ergänzen.
2. Optional spezifisches visuelles Layout in `SPECS` ergänzen.
3. Pfadkonvention `Kopf > Bereich > Protokoll` beibehalten.

### UI anpassen
- Farben/Typo/Spacing in `assets/css/app.css`.
- Renderregeln und Suche in `assets/js/app.js`.

## 9. Robustheit und Betriebsverhalten
- Rein clientseitig, ohne Backend-Abhängigkeiten.
- Keine Build-Pipeline erforderlich.
- Funktioniert direkt über statisches Hosting.

## 10. UX-Fazit
Die Anwendung ist jetzt klarer strukturiert, visuell näher am Referenz-Stil aus dem Cockpit, besser lesbar bei dichten Sequenzlisten und deutlich wartbarer durch die modulare Dateiaufteilung.
