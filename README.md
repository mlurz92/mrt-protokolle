# MRT-Untersuchungskatalog

Dies ist eine Webanwendung zur dynamischen Anzeige, Navigation und Verwaltung eines hierarchisch strukturierten MRT-Untersuchungskatalogs. Die Anwendung basiert auf Node.js, TypeScript, Express, SQLite, Vite und modernen Web Components. Diese README.md bietet eine äußerst detaillierte Schritt-für-Schritt Anleitung zur Installation, Inbetriebnahme, Aktualisierung und vollständigen Entfernung der Anwendung auf einem Raspberry Pi 4 mit einer frischen Installation von RaspberryPiOS lite (64bit).

---

## Inhaltsverzeichnis

- [Voraussetzungen](#voraussetzungen)
- [Installation und Inbetriebnahme](#installation-und-inbetriebnahme)
  - [1. System aktualisieren](#1-system-aktualisieren)
  - [2. Node.js und Git installieren](#2-nodejs-und-git-installieren)
  - [3. Repository klonen](#3-repository-klonen)
  - [4. Abhängigkeiten installieren und Anwendung bauen](#4-abhängigkeiten-installieren-und-anwendung-bauen)
  - [5. Anwendung starten (lokal & im Produktionsmodus)](#5-anwendung-starten-lokal--im-produktionsmodus)
- [Bereitstellung über HTTPS mit MyFritz](#bereitstellung-über-https-mit-myfritz)
  - [1. Nginx installieren und konfigurieren](#1-nginx-installieren-und-konfigurieren)
  - [2. SSL-Zertifikat mit Certbot einrichten](#2-ssl-zertifikat-mit-certbot-einrichten)
  - [3. Anwendung über die MyFritz-Adresse aufrufen](#3-anwendung-über-die-myfritz-adresse-aufrufen)
- [Update der Anwendung](#update-der-anwendung)
- [Vollständige Entfernung der Anwendung](#vollständige-entfernung-der-anwendung)
- [Fehlerbehebung & Hinweise](#fehlerbehebung--hinweise)

---

## Voraussetzungen

- **Hardware:** Raspberry Pi 4
- **Betriebssystem:** RaspberryPiOS lite (64bit), frisch installiert
- **Internetverbindung:** Für Updates, Zertifikatserstellung und GitHub-Zugriff
- **Zugriff:** SSH-Zugang oder direkter Terminalzugriff

---

## Installation und Inbetriebnahme

### 1. System aktualisieren

Öffne ein Terminal und führe folgende Befehle aus, um dein System auf den neuesten Stand zu bringen:

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Node.js und Git installieren

Installiere Node.js (empfohlen Node.js 16) und Git:

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs git
```

Überprüfe die Installation:

```bash
node -v
npm -v
git --version
```

### 3. Repository klonen

Klonen Sie das GitHub Repository in ein gewünschtes Verzeichnis:

```bash
git clone https://github.com/mlurz92/mrt-protokolle.git
cd mrt-protokolle
```

### 4. Abhängigkeiten installieren und Anwendung bauen

Installiere alle benötigten Abhängigkeiten und baue die Anwendung:

```bash
npm install
npm run build
```

Der Befehl `npm run build` erstellt die Produktionsdateien im Verzeichnis `dist`.

### 5. Anwendung starten (lokal & im Produktionsmodus)

Um die Anwendung im Produktionsmodus zu starten, führe folgenden Befehl aus:

```bash
npm run start
```

Die Anwendung wird auf dem konfigurierten Port (standardmäßig 3001) gestartet. Für die lokale Entwicklung kannst Du auch:

```bash
npm run dev
```

verwenden.

---

## Bereitstellung über HTTPS mit MyFritz

Die Anwendung soll über die MyFritz-Adresse `raspberrypi.hyg6zkbn2mykr1go.myfritz.net/` per HTTPS erreichbar sein.

### 1. Nginx installieren und konfigurieren

Installiere Nginx:

```bash
sudo apt install -y nginx
```

Erstelle eine Nginx-Konfigurationsdatei für die Anwendung:

```bash
sudo nano /etc/nginx/sites-available/mrt-protokolle
```

Füge folgenden Inhalt ein (Passe ggf. den Port an, falls anders konfiguriert):

```nginx
server {
    listen 80;
    server_name raspberrypi.hyg6zkbn2mykr1go.myfritz.net;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktiviere die Konfiguration und teste Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/mrt-protokolle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. SSL-Zertifikat mit Certbot einrichten

Installiere Certbot und das Nginx-Plugin:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Fordere das SSL-Zertifikat für Deine Domain an:

```bash
sudo certbot --nginx -d raspberrypi.hyg6zkbn2mykr1go.myfritz.net --email mlurz92@googlemail.com --agree-tos --non-interactive
```

Certbot wird die Nginx-Konfiguration automatisch anpassen und HTTPS aktivieren. Anschließend Nginx neu starten:

```bash
sudo systemctl restart nginx
```

### 3. Anwendung über die MyFritz-Adresse aufrufen

Öffne einen Browser und navigiere zu:

```
https://raspberrypi.hyg6zkbn2mykr1go.myfritz.net/
```

Die Anwendung sollte nun über HTTPS erreichbar sein.

---

## Update der Anwendung

Um die Anwendung auf den neuesten Stand zu bringen, führe folgende Befehle im Repository-Verzeichnis aus:

```bash
git reset --hard
git pull
npm install
npm run build
```

Starte danach den Server neu, um die aktualisierte Version zu laden:

```bash
npm run start
```

---

## Vollständige Entfernung der Anwendung

Falls Du die Anwendung und alle zugehörigen Komponenten vollständig entfernen und den Raspberry Pi OS auf den Ursprungszustand zurücksetzen möchtest, folge diesen Schritten:

1. **Anwendungsordner entfernen:**

   ```bash
   cd ..
   sudo rm -rf mrt-protokolle
   ```

2. **Installierte Pakete entfernen (optional):**

   Entferne Node.js, Nginx und Certbot, falls sie nicht mehr benötigt werden:

   ```bash
   sudo apt remove --purge -y nodejs nginx certbot python3-certbot-nginx
   sudo apt autoremove -y
   ```

3. **Raspberry Pi OS zurücksetzen:**

   Für eine vollständige Rücksetzung empfiehlt es sich, das SD-Karten-Image neu aufzuspielen. Lade das neueste Raspberry Pi OS Lite (64bit) von der offiziellen [Raspberry Pi Website](https://www.raspberrypi.org/software/operating-systems/) herunter und schreibe es mit einem geeigneten Tool (z.B. balenaEtcher) auf die SD-Karte.

---

## Fehlerbehebung & Hinweise

- **Datenbank-Import:**  
  Stelle sicher, dass sich die Datei `protocols.json` im Root-Verzeichnis des Projekts befindet, bevor Du die Anwendung startest.

- **Port-Konflikte:**  
  Falls ein anderer Dienst den Port 3001 belegt, passe entweder die Anwendungskonfiguration (in `vite.config.ts` bzw. im Express-Server) oder die Nginx-Konfiguration an.

- **HTTPS-Probleme:**  
  Überprüfe die Nginx-Konfiguration und Certbot-Ausgaben, wenn Probleme bei der Zertifikatserstellung auftreten. Eventuell müssen Firewall-Regeln angepasst werden.

- **Log-Dateien:**  
  Achte auf Konsolenausgaben und Log-Dateien, um Fehlermeldungen frühzeitig zu erkennen.

---

## Zusammenfassung

Diese Anleitung führt Dich durch die vollständige Installation, Bereitstellung, Aktualisierung und Entfernung der Anwendung auf einem Raspberry Pi 4 mit RaspberryPiOS lite (64bit). Folge den einzelnen Schritten genau, um eine reibungslose Inbetriebnahme zu gewährleisten. Bei Fragen oder Problemen wende Dich an die Dokumentation der verwendeten Tools (Node.js, Express, Nginx, Certbot) oder suche Unterstützung in entsprechenden Foren.

Viel Erfolg mit Deinem MRT-Untersuchungskatalog!
