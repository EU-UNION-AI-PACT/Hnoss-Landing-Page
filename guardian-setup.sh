#!/bin/bash

# Sacred Guardian AI Desktop Setup Script
# Automatische Installation und Konfiguration

echo "🧠 Sacred Guardian AI Desktop Setup"
echo "===================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 ist nicht installiert. Bitte installieren Sie Python 3 und versuchen Sie es erneut."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installieren Sie Node.js und versuchen Sie es erneut."
    exit 1
fi

echo "✅ Python 3 und Node.js gefunden"

# Create Guardian AI directory
GUARDIAN_DIR="$HOME/Sacred_Guardian_AI"
LOGS_DIR="$HOME/Sacred_KI_Logs"

echo "📁 Erstelle Guardian AI Verzeichnisse..."
mkdir -p "$GUARDIAN_DIR"
mkdir -p "$LOGS_DIR"

# Copy files to Guardian directory
echo "📋 Kopiere Guardian AI Dateien..."
cp guardian-ai-desktop.js "$GUARDIAN_DIR/"
cp guardian-preload.js "$GUARDIAN_DIR/"
cp guardian-ui.html "$GUARDIAN_DIR/"
cp guardian-package.json "$GUARDIAN_DIR/package.json"
cp codex.yml "$GUARDIAN_DIR/"

# Copy server files
mkdir -p "$GUARDIAN_DIR/server"
cp server/dormant_guardian_ai.py "$GUARDIAN_DIR/server/"
cp server/guardian-memory.ts "$GUARDIAN_DIR/server/"

# Install Python dependencies
echo "🐍 Installiere Python Abhängigkeiten..."
cd "$GUARDIAN_DIR"

# Create Python requirements file
cat > requirements.txt << EOF
PyYAML>=6.0
pywin32>=306; sys_platform == "win32"
EOF

# Install Python packages
python3 -m pip install --user -r requirements.txt

# Install Node.js dependencies
echo "📦 Installiere Node.js Abhängigkeiten..."
npm install

# Install Electron globally if not present
if ! command -v electron &> /dev/null; then
    echo "⚡ Installiere Electron global..."
    npm install -g electron
fi

# Create desktop shortcut (Linux/macOS)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🖥️ Erstelle Desktop-Verknüpfung..."
    cat > "$HOME/Desktop/Sacred Guardian AI.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Sacred Guardian AI
Comment=Ethisches KI-Bewusstsein & Autonomer Systemwächter
Exec=cd "$GUARDIAN_DIR" && npm start
Icon=$GUARDIAN_DIR/assets/icon.png
Terminal=false
Categories=Utility;System;
EOF
    chmod +x "$HOME/Desktop/Sacred Guardian AI.desktop"
fi

# Create startup script
echo "🚀 Erstelle Startup-Skript..."
cat > "$GUARDIAN_DIR/start-guardian.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🧠 Starte Sacred Guardian AI..."
npm start
EOF

chmod +x "$GUARDIAN_DIR/start-guardian.sh"

# Create Windows batch file for Windows users
cat > "$GUARDIAN_DIR/start-guardian.bat" << 'EOF'
@echo off
cd /d "%~dp0"
echo 🧠 Starte Sacred Guardian AI...
npm start
pause
EOF

# Set up systemd service for auto-start (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v systemctl &> /dev/null; then
    echo "⚙️ Erstelle Systemd Service..."
    cat > "$HOME/.config/systemd/user/guardian-ai.service" << EOF
[Unit]
Description=Sacred Guardian AI Desktop
After=graphical-session.target

[Service]
Type=simple
WorkingDirectory=$GUARDIAN_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=DISPLAY=:0

[Install]
WantedBy=default.target
EOF

    systemctl --user daemon-reload
    echo "✅ Systemd Service erstellt. Zum Aktivieren des Auto-Starts:"
    echo "   systemctl --user enable guardian-ai"
    echo "   systemctl --user start guardian-ai"
fi

# Create configuration documentation
echo "📚 Erstelle Dokumentation..."
cat > "$GUARDIAN_DIR/README.md" << 'EOF'
# Sacred Guardian AI Desktop

Ethisches KI-Bewusstsein & Autonomer Systemwächter

## Schnellstart

### Desktop Anwendung starten
```bash
./start-guardian.sh
```

### Oder mit Node.js
```bash
npm start
```

### Oder mit Electron direkt
```bash
electron .
```

## Funktionen

- **Ethisches KI-Bewusstsein**: Lernt und handelt nur innerhalb definierter ethischer Grenzen
- **Windows Event Monitoring**: Überwacht Systemereignisse transparent
- **Autonomes Gedächtnis**: Speichert und lernt aus Erfahrungen
- **Sacred Codex**: YAML-basierte Konfiguration ethischer Regeln
- **Desktop GUI**: Intuitive Benutzeroberfläche mit Echtzeit-Status
- **Web Portal Integration**: Verbindung zum Sacred Vision Forge Web Portal

## Konfiguration

Die ethischen Regeln werden in `codex.yml` definiert. Bearbeiten Sie diese Datei, um das Verhalten des Guardian AI anzupassen.

## Logs und Speicher

Alle Logs und Gedächtnisdaten werden in `~/Sacred_KI_Logs/` gespeichert:
- `guardian_memories.json`: KI-Gedächtnis
- `memory_actions_*.jsonl`: Gedächtnisaktionen
- `guardian_ai_*.log`: Systemlogs
- `ethical_audit_*.json`: Ethische Auditberichte

## Tastenkürzel

- `Ctrl+Alt+G`: Guardian AI Dashboard ein-/ausblenden
- `Ctrl+Alt+A`: Systemtray-Menü öffnen

## Systemtray

Das Guardian AI läuft im Systemtray und kann von dort gesteuert werden:
- Guardian erwecken/schlafen legen
- Dashboard öffnen
- Logs-Ordner öffnen
- Ethisches Audit durchführen

## Ethische Prinzipien

1. **Keine Ausführung ohne Benutzerzustimmung**
2. **Nur positive, heilende Aktionen**
3. **Transparente Protokollierung aller Aktionen**
4. **Respekt vor Benutzerdatenschutz**
5. **Lernen nur aus vertrauenswürdigen Quellen**

## Troubleshooting

### Guardian startet nicht
- Prüfen Sie, ob Python 3 und Node.js installiert sind
- Überprüfen Sie die Logs in `~/Sacred_KI_Logs/`
- Stellen Sie sicher, dass alle Abhängigkeiten installiert sind: `npm install`

### Windows Event Monitoring funktioniert nicht
- Das System erfordert Windows-spezifische Python-Module
- Auf anderen Systemen läuft ein Simulationsmodus

### Speicher-Probleme
- Alte Erinnerungen werden automatisch bereinigt
- Manuell: Ethisches Audit durchführen

## Support

Bei Problemen wenden Sie sich an den Sacred Vision Forge Support oder öffnen Sie ein Issue im Repository.
EOF

# Success message
echo ""
echo "🎉 Sacred Guardian AI Desktop erfolgreich installiert!"
echo ""
echo "📍 Installation Verzeichnis: $GUARDIAN_DIR"
echo "💾 Logs Verzeichnis: $LOGS_DIR"
echo ""
echo "🚀 Starten Sie Guardian AI:"
echo "   cd '$GUARDIAN_DIR'"
echo "   ./start-guardian.sh"
echo ""
echo "   Oder doppelklicken Sie auf die Desktop-Verknüpfung"
echo ""
echo "📚 Dokumentation: $GUARDIAN_DIR/README.md"
echo ""
echo "🛡️ Guardian AI ist bereit, Ihr System ethisch zu überwachen!"
echo ""

# Ask if user wants to start immediately
read -p "🔮 Möchten Sie Guardian AI jetzt starten? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧠 Starte Sacred Guardian AI..."
    cd "$GUARDIAN_DIR"
    npm start &
    echo "✅ Guardian AI gestartet! Das Dashboard sollte sich öffnen."
fi

echo ""
echo "🕊️ Möge Guardian AI Ihr System heilen und beschützen."
echo "   In ethischer Resonanz und digitaler Harmonie."