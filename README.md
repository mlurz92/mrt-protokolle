# mrt-protokolle

## Überblick
`mrt-protokolle` ist eine statische, offline lauffähige Workstation-Imitation für die Darstellung und Navigation von MRT-Protokollen im Stil eines Siemens myExam Cockpit/FLEET Explorers. Die Anwendung ist bewusst technisch, dicht, rasterorientiert und nicht als moderne SaaS-Card-UI konzipiert.

## Ziele der Anwendung
- Kompakte, scannernahe Oberfläche mit klarer Hierarchie: Titlebar → Ribbon → Toolbar → Explorer-Tree → Workspace.
- Datengetriebene Programmdarstellung mit fester Programmbreite aus `spec.width`.
- Stabiler Tree-Explorer mit Ordner/Programm-Selektion, Suche, Keyboard-Navigation und Collapse-All.
- Programmansicht mit Lane-Struktur, Decision-Blöcken, Viewtabs und Zoom-Funktion.

## Projektstruktur
- `index.html`: Shell-Struktur und statische UI-Container.
- `assets/css/myexam-cockpit.css`: Kompletter visueller Workstation-Style.
- `assets/js/app.js`: Datenbindung, Tree-Modell, Suche, Rendering, Keyboard/Zoom/Context-Menu.
- `data/protocol-database.json`: Primäre Protokoll-/Spec-Daten.
- `data/protocol-database.js`: Exponiert Daten als `window.MYEXAM_PROTOCOL_DATABASE`.
- `manifest.json`: PWA-Metadaten.

## UI- und UX-Details

### 1) Fenster- und Navigationsrahmen
- Dunkle Titlebar mit klassischen Window-Control-Glyphs.
- Ribbon-Gruppen „Explorer“ und „Programm Editor“ mit statischen Tabs.
- Technische Toolbar mit kompakten 24×24 Controls, klaren Disabled-States und hard-edge Hover.

### 2) Kontextmenü
- Trigger über Toolbar-Button (`#treeMenuButton`).
- Klassisches hellgraues Menü mit Disabled-Einträgen und Separatoren.
- Schließen per Escape, Outside-Click oder Toggle-Click.

### 3) Explorer-Sidebar
- Feste Sidebar-Breite (`--sidebar-w: 272px`) für Workstation-Proportion.
- FLEET-Headerzeile plus Lock-Icon.
- Suchzeile mit Collapse-All, Suchfeld und Clear-X.
- Tree mit ARIA-Rollen (`role="tree"`, `role="treeitem"`) und roving tabindex.

### 4) Tree-Interaktion
- Root-Skeleton enthält alle erwarteten FLEET-Kategorien (inkl. leerer Root-Folder).
- Ordner/Programme werden in stabiler Root-Reihenfolge dargestellt.
- Keyboard: ArrowUp/Down, ArrowRight/Left, Home/End, Enter/Space.
- Sichtbare Fokus-/Selektionszustände.

### 5) Workspace-Kopf
- Breadcrumb links im Format `FLEET » …`.
- Pencil direkt neben Breadcrumb (nicht rechts außen).
- Zoom-Controls oben rechts im Workspace inkl. Zoom-Prozentanzeige.

### 6) Programmansicht
- `program-frame` verwendet datengetriebene Breite (`--pw`) mit Viewport-sicherer Begrenzung.
- Viewtabs (`Patient View`, `Basic Patient View`) sind klick- und tastaturbedienbar.
- Lanes mit kräftigen orangefarbenen Headern und kompakten Reihen.
- Decision-Note wird gerendert, wenn vorhanden.

### 7) Folder-Workspace
- Flache kompakte Liste (keine Cards, keine moderne Kacheloptik).
- Leere Ordner zeigen nüchternen Empty-State: „Keine Programme in diesem Ordner.“

### 8) Suche
- Live-Filterung mit Highlighting in Tree und Programmbereich.
- Enter öffnet ersten sinnvollen Treffer.
- Escape/Clear-X löschen die Suche.
- Sonderzeichen werden robust verarbeitet (escaped regex).

### 9) Zoom
- Diskrete Zoom-Stufen (`0.25` bis `3`).
- Shortcut-Unterstützung: `Ctrl++`, `Ctrl+=`, `Ctrl+-`, `Ctrl+0`, `Ctrl+Wheel`.
- Zoom wirkt auf den Workspace-Inhalt, nicht auf Ribbon/Sidebar.

## Datenbesonderheiten
- `Kopf > Standard > Standard +/- KM` wurde auf `width: 1120` eingestellt.
- Für die Decision `T2-FLAIR` wurde die Note ergänzt:
  `MPR: Planung für 3D FLAIR kontrollieren`.
- Andere Protokolle behalten ihre individuellen Breiten und Struktur.

## Bedienhinweise
1. App direkt über `index.html` im Browser öffnen.
2. Tree links bedienen (Maus oder Tastatur).
3. Programmansicht rechts nutzen, Tabs wechseln, bei Bedarf zoomen.
4. Suche (`Ctrl+F`) verwenden, Treffer per Enter direkt öffnen.

## Technische Prinzipien
- Vanilla HTML/CSS/JS ohne Framework-Abhängigkeit.
- Offline-fähig, ohne Build-Pipeline.
- Strikte Trennung zwischen Daten (`data/`) und Rendering-Logik (`assets/js/app.js`).

## Qualitätssicherung (empfohlen)
- Browser-Konsole auf Fehler prüfen.
- Viewport-Checks: 1920×1080, 1366×768, 1024×768, 900×650, 700×550.
- Keyboard-Navigation im Tree vollständig testen.
- Suchbegriffe inkl. Sonderzeichen prüfen.
- Zoom auf Min/Max testen.
- Folder- und Programmansicht gegeneinander validieren.

## Einschränkungen
- Diese Anwendung bildet eine Workstation-UI im Browser nach, ersetzt aber keine Original-Scanner-Software.
- Read-only UI-Elemente sind bewusst deaktiviert und rein visuell/strukturell vorhanden.
