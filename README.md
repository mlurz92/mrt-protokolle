# myExam Cockpit – Explorer (Pixelgenauer Frontend-Nachbau)

## 1. Projektüberblick
Diese Anwendung ist ein konsequent auf **Desktop-Präzision** ausgelegter, statischer Frontend-Nachbau der Siemens-ähnlichen Benutzeroberfläche aus dem Referenzbild `Beispielbild UI.png`. Der Fokus liegt auf dem Erscheinungsbild einer dicht gepackten radiologischen Konsolenoberfläche mit dunklem Theme, minimalen Spacings, kompakten Typografien und parallelen Entscheidungs-Lanes.

## 2. Hauptziele
- Pixelnahe Reproduktion der visuellen Struktur.
- Vollständige statische Ausprogrammierung aller benannten Bereiche, Ordner, Sequenzen und Entscheidungsblöcke.
- Null-Wrapping-Strategie bei langen Sequenznamen durch konsequente `white-space`-/`overflow`-Regeln.
- Strikte Trennung der UI-Bereiche (Top-Bar, Ribbon, Action-Bar, Tree, Workspace, Lanes).

## 3. Technische Architektur
- `index.html`: Vollständige semantische UI-Struktur der Cockpit-Ansicht.
- `assets/css/myexam-cockpit.css`: Kompaktes, hochdichtes Styling im Syngo-Dark-Look (11–14 px typografisch).
- `assets/js/app.js`: Rein statisches Rendering des Tree-Views inklusive geöffneter/geschlossener Knoten und aktiver Auswahl.

## 4. Detaillierte UI-Struktur
### 4.1 Titelzeile
- Fenstername links: `myExam Cockpit - Explorer`.
- Rechte Fensterkontrollen: `?`, Maximize, `×`.
- Sehr kompakte Höhe und dunkler Kontrast für „Console“-Optik.

### 4.2 Ribbon und Toolbar
- Zwei funktionale Registergruppen: `Explorer` und `Programm Editor`.
- Tabs mit aktiver/inaktiver Hervorhebung.
- Separate Aktionszeile mit Operator-Symbolik (Dokument-/Aktion-/Undo/Redo-nahe Icons).

### 4.3 Linke Navigation (Tree)
- Fixe Seitenleiste mit FLEET-Selektor, Sperr-Icon und Suchbereich.
- Vollständiger Baum mit geforderten Einträgen: Kopf > Standard, Stroke, Dissektion, Sinusthrombose, AVM, Aneurysma, Entzündung, MS, Epilepsie, Neurodegeneration, Kopfschmerz Migräne.
- Aktive Hervorhebung: `Standard +/- KM` als durchgehender heller Selektionsbalken.

### 4.4 Hauptarbeitsbereich
- Breadcrumb-Pfad mit Edit-Icon und Zoomsymbolen.
- Umschalt-Tabs `Patient View` und `Basic Patient View`.
- Zweispaltige Haupt-Lane-Struktur: `Standard +/- KM` und `Unkooperativ`.

### 4.5 Entscheidungs-Lanes
- Orange Hauptheader (`#ff6600`) mit klarer Kontrastführung.
- Vollständige Sequenzdarstellung inkl. Zeiten und Folgeaktionen.
- Geschachtelte Splits (`TSE2D` vs. `SPACE/3D`, `Ja` vs. `Nein`) mit bewusst reservierten Leerflächen zur vertikalen Synchronisierung.

## 5. Micro-Component-Design
### 5.1 Chevron-Tags
- Weiße Pfeil-Tags mit schwarzer Ziffer (`1`–`4`) via `clip-path`.

### 5.2 Aktionsbuttons
- Kompakte dunkelgraue Buttons mit Play-Indikator und Label (`Basic Decision`, `MPR Assignment`, `MPR Planning`, `AutoAlign Scout`).

### 5.3 Zeilenlogik
- Unterstrichene Sequenznamen, rechts oben Zeitwerte, unten Meta-Zeile mit Icon + Tag.
- Reduzierte Zeilenhöhen für maximale Informationsdichte.

## 6. UX-Qualität und visuelle Stabilität
- Keine unbeabsichtigten Zeilenumbrüche bei langen Sequenznamen.
- Ausrichtung von Text, Laufzeit und Aktionsflächen über feste Positionierungen.
- Definierte Leerbereiche verhindern Überlagerungen und brechende Rasterstrukturen.

## 7. Design-Tokens
- App-Hintergrund: Anthrazitbereiche um `#1f1f1f` bis `#353535`.
- Divider: dunkle 1px-Linien (`#1a1a1a` / `#2a2a2a`).
- Akzent: Siemens-Orange `#ff6600`.
- Text: Primär weiß, Sekundär hellgrau.

## 8. Hinweise zur Nutzung
1. `index.html` im Browser öffnen.
2. Die Ansicht ist auf Desktop-Dichte optimiert.
3. Das Tree-Rendering wird clientseitig über `assets/js/app.js` generiert.

## 9. Erweiterungsperspektive
- Optionales echtes State-Management für auf-/zuklappbare Knoten.
- Exaktes SVG-Iconset statt Textsymbolen für noch näheren OEM-Look.
- Responsive Fallback-Layer für niedrigere Auflösungen.

## 10. Ergebnis
Die Anwendung bildet die referenzierte medizinische Cockpit-Oberfläche mit hoher visueller Nähe, vollständigem statischem Inhalt und strikt kompaktem UI-Verhalten nach.
