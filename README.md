# myExam Cockpit – Explorer Clone (Siemens MAGNETOM MRT)

## Überblick
Diese Webanwendung simuliert den **myExam Cockpit – Explorer** für neuroradiologische MRT-Protokolle (Schwerpunkt Kopf) mit starkem Fokus auf:
- visuelle Nähe zum Referenz-UI,
- schnelle Protokollnavigation,
- klare Branch-/Decision-Darstellung,
- robuste Lesbarkeit bei hoher Informationsdichte.

Die Anwendung ist als **statisches Frontend** aufgebaut und benötigt keinen Backend-Server.

---

## Ziele der aktuellen Fassung
1. **UI wieder nahe am Screenshot**: dunkle Cockpit-Fläche, orange Header, zweigeteilter Arbeitsbereich (Explorer links, Programmfläche rechts).
2. **Volle Interaktivität**: Tree-Navigation, Protokollauswahl, Suche, Trefferzähler, Rendering der Sequenzstruktur.
3. **Wartbarkeit durch Multi-Datei-Struktur** statt monolithischer Single-HTML.
4. **Keine Überlagerungen** durch definierte Layoutregeln, feste Zeilenlogik, Branch-Gitter und saubere Overflow-Behandlung.

---

## Projektstruktur

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

### Verantwortlichkeiten
- `index.html`: UI-Skelett (Shell, Explorer, Workspace, Search, Program Container).
- `assets/css/app.css`: vollständiges Cockpit-Design inkl. Komponenten-Styles.
- `assets/js/app.js`: Datenmodell (`PROTOCOLS`, `SPECS`), Suchindex, Tree-Renderer, Program-Renderer, Event-Binding.

---

## Funktionale Bausteine im Detail

## 1) Explorer-Baum (linke Spalte)
- Hierarchische Folder-Struktur basierend auf `path`-Strings (`Kopf > …`).
- Expand/Collapse je Knoten.
- Markierung des aktiven Programms (`selected`).
- Optionales Highlighting von Trefferknoten bei aktiver Suche.

## 2) Suche
- Live-Suche über Eingabefeld.
- Durchsucht:
  - Gruppen,
  - Programmnamen,
  - vollständige Pfade,
  - Sequenzbezeichner,
  - Decision-Inhalte,
  - Hinweise,
  - Spec-Struktur.
- Trefferzähler (`#searchCount`) und „Keine Treffer“-Status.
- Reset per Clear-Button.

## 3) Programmdarstellung (rechte Fläche)
- Protokollansicht als Lanes (parallelisierte Programmzweige).
- Lane-Header mit optionalem Checkmarker.
- Sequenzzeilen mit:
  - Name,
  - Zeit,
  - optionaler Funktions-Pill (z. B. *MPR Assignment*, *MPR Planning*, *AutoAlign Scout*).
- Decision-Elemente:
  - Frage,
  - Default-Dropdown (statisch im Mock),
  - Branch-Spalten (Ja/Nein/Alternativen etc.).

## 4) Daten-/Layoutmodell
- `PROTOCOLS`: lineare, fachliche Sequenzdaten inkl. Meta.
- `SPECS`: visuelle Strukturregeln pro Pfad (Lanes, Blöcke, Decisions, Labels).
- Fallback-Logik rendert auch dann sinnvolle Ansichten, wenn keine explizite Spec existiert.

---

## UI/UX-Prinzipien

## Nähe zum Original-Cockpit
- dunkles UI mit klaren Trennlinien,
- orange Abschnitts-/Lane-Akzente,
- kompakte, dichte Sequenzdarstellung,
- klinisch-pragmatische Leseführung (links Navigation, rechts Ablauf).

## Lesbarkeit / Anti-Overlap
- `overflow`-Sicherung,
- text clipping/ellipsis bei langen Sequenznamen,
- stabile Zeilenhöhen,
- konsistente Positionen für Zeit und Pills,
- kontrollierte Grid-Spalten für Branch-Entscheidungen.

## Bedienlogik
- möglichst wenige Klicks bis zur gewünschten Protokollansicht,
- Suchfilter als Primärwerkzeug bei tiefen Protokollbäumen,
- visuelles Feedback für Auswahl und Treffer.

---

## Wartung & Erweiterung

## Neues Protokoll hinzufügen
1. `PROTOCOLS` um neuen Datensatz erweitern.
2. Optional in `SPECS` ein detailliertes Layout für den neuen Pfad ergänzen.
3. Pfadkonsistenz einhalten (`Kopf > Bereich > Protokoll`) für korrekte Tree-Integration.

## UI feinjustieren
- Haupthebel liegt in `assets/css/app.css`.
- Renderlogik/Interaktionsverhalten in `assets/js/app.js`.

---

## Betrieb
- Start über beliebigen statischen Server (oder lokale Dateivorschau).
- Keine Buildchain, keine Transpiler, kein Backend.

---

## Qualitätssicherung (empfohlen)
- JS-Syntaxcheck (`node --check assets/js/app.js`).
- Manuelle Klicktests:
  - Folder Expand/Collapse,
  - Item-Auswahl,
  - Suche + Trefferzähler,
  - Clear-Button,
  - Rendering von Decision/Branch-Layouts.

---

## Zusammenfassung
Diese Version stellt den Fokus wieder auf die **funktionierende, klickbare und visuell nahe Cockpit-Erfahrung**, bleibt aber zugleich durch die **modulare Dateistruktur** nachhaltig wartbar.
