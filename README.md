# myExam Cockpit Explorer (Web-Replikat)

## 1. Zweck der Anwendung
Diese Anwendung bildet den **Explorer- und Program-Editor-Teil** eines klinischen MRT-Protokoll-Cockpits im Browser nach. Schwerpunkt ist eine strukturierte Darstellung von Kopf-Protokollen mit hohem Informationsgehalt bei gleichzeitig schneller Navigation.

Ziele:
- visuelle Nähe zu einem dunklen, tabellarisch-dichten Cockpit-UI,
- schnelle Protokollsuche und Auswahl,
- robuste Lesbarkeit bei langen Sequenznamen und knappen Spalten,
- konsistente Darstellung über Desktop, Tablet und Mobile.

---

## 2. Funktionsumfang im aktuellen Stand

### 2.1 Explorer (linke Spalte)
- Hierarchischer Baum, aus den Pfaden der Protokolle erzeugt.
- Expand/Collapse pro Knoten.
- Aktive Auswahl wird klar hervorgehoben.
- Treffer-Highlighting bei Suche auf Ordner- und Eintragsebene.

### 2.2 Suche
- Live-Filterung ohne Reload.
- Durchsucht nicht nur Titel/Pfade, sondern auch Inhalte aus Sequenzen, Decisions und Spec-Strukturen.
- Trefferzähler zeigt jederzeit die Anzahl gefilterter Protokolle.
- Reset-Button setzt Suche sofort zurück.

### 2.3 Programmfläche (rechte Spalte)
- Renderer für Lane-basierte Protokollansichten.
- Orange Lane-Header mit optionalem Check-Symbol.
- Sequenzzeilen mit:
  - Sequenzname,
  - Zeit,
  - optionalem Action-Pill (z. B. *MPR Assignment*, *MPR Planning*).
- Decision-Bausteine mit Frage, Default-Auswahl (UI-Mock) und Branch-Spalten.

### 2.4 Datenmodell
- `PROTOCOLS`: lineare, fachliche Datensätze pro Protokoll.
- `SPECS`: visuelle Darstellungsvorgaben je Pfad.
- Fallback-Layout: erzeugt automatisch eine sinnvolle Anzeige, falls keine explizite Spec existiert.

---

## 3. UI-/UX-Designprinzipien

### 3.1 Konsistenz
- Einheitliche Typografie, Spacing, Kontrast und Komponentenhöhen.
- Reduzierte visuelle Komplexität: keine „Foto“-Metahinweise in der Hauptansicht.

### 3.2 Lesbarkeit bei hoher Dichte
- Lange Texte werden kontrolliert per Ellipsis gekürzt.
- Kritische Felder (Name, Zeit, Labels, Decisions) haben eigene Größen- und Overflow-Regeln.
- Subtile Linien und abgestufte Flächen trennen Sektionen ohne visuelles Rauschen.

### 3.3 Responsivität
- Shell-Layout über Grid mit adaptiver Sidebar-Breite.
- Unter schmalen Viewports wird auf Einspalten-Fluss umgestellt (Explorer oben, Inhalt unten).
- Lanes kollabieren mobil auf 1 Spalte, damit keine Überlagerungen entstehen.

### 3.4 Interaktionsqualität
- Sofortiges visuelles Feedback für Auswahl und Suchtreffer.
- Struktur bleibt auch bei tiefen Pfaden stabil lesbar.
- Hover-/Fokus-Semantik bleibt schlicht und funktional.

---

## 4. Architektur und Dateistruktur

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
- `index.html`: statisches UI-Skelett (Explorer, Search, Workspace, Program-Container).
- `assets/css/app.css`: komplettes visuelles System inkl. Responsivität und Anti-Overlap-Regeln.
- `assets/js/app.js`: Datenhaltung, Suche, Tree-Renderer, Program-Renderer, Event-Binding.

---

## 5. Technische Umsetzung im Detail

### 5.1 Rendering-Pipeline
1. Tree wird aus Pfadsegmenten aufgebaut.
2. Suche markiert und filtert rekursiv.
3. Auswahl setzt `selectedPath`.
4. Program-Renderer zieht passende Spec oder Fallback.
5. Markup wird als strukturierte Lane-/Block-Hierarchie erzeugt.
6. Typografie-Anpassung läuft nach Render und bei Resize.

### 5.2 Komponentenlogik
- `rowHTML`: Einzelsequenzen mit Zeit/Pill.
- `blockHTML`: rekursiver Renderer für Labels, Spacer, Decisions und Branches.
- `renderSpec`: erzeugt vollständige Programmfläche für ein Protokoll.
- `fallbackSpec`: auto-generierte Minimalansicht für nicht explizit definierte Protokolle.

### 5.3 Performance
- Kein Framework-Overhead, kein Build-Step.
- Direkte DOM-Generierung auf Basis einfacher Objekte.
- Suchindex wird einmalig vorab aufgebaut.

---

## 6. Responsives Verhalten nach Gerätekategorie

### Desktop (breit)
- Zwei-Spalten-Layout mit fixer Navigationslogik.
- Mehrere parallele Lanes für Decision-Zweige.

### Tablet (mittel)
- Kompaktere Sidebar.
- Verdichtete Zeilenhöhen/Pills ohne Informationsverlust.

### Mobile (schmal)
- Explorer als oberer Bereich (bis ~40% Höhe).
- Programmansicht darunter.
- Lanes werden untereinander dargestellt, um horizontales Kollidieren zu verhindern.

---

## 7. Nutzung
1. Anwendung lokal öffnen (direkt oder via statischem Webserver).
2. Links Protokoll suchen oder im Baum navigieren.
3. Eintrag anklicken.
4. Rechts die vollständige Sequenz-/Decision-Struktur prüfen.

---

## 8. Qualitätssicherung
Empfohlene Checks:
- JS-Syntaxprüfung: `node --check assets/js/app.js`
- Manuelle UI-Prüfung:
  - Suche, Treffer, Clear,
  - Baum Expand/Collapse,
  - Auswahlwechsel,
  - Darstellung in kleinen/mittleren/großen Viewports.

---

## 9. Erweiterbarkeit
- Neue Protokolle in `PROTOCOLS` ergänzen.
- Für pixelgenaue Layoutkontrolle optional Eintrag in `SPECS` ergänzen.
- Pfadformat konsequent halten (`Kopf > Bereich > Protokoll`).

---

## 10. Grenzen
- Es handelt sich um ein Frontend-UI-Replikat ohne Backend-Workflow.
- Decision-Dropdowns sind visuelle Repräsentationen und nicht als klinische Entscheidungsautomatik implementiert.

---

## 11. Ergebnis
Der aktuelle Stand priorisiert ein **ruhiges, konsistentes und robustes Cockpit-UI**: keine störenden Metabeschriftungen in der Hauptansicht, keine typografischen Überlagerungen, klarere Hierarchien und stabile Responsivität über Gerätegrößen hinweg.
