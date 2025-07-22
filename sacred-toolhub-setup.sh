#!/bin/bash

# Sacred GitHub ToolHub + Guardian AI Setup Script
# Complete Sacred Development Environment Installation

echo "🌌 Sacred Development Environment Setup"
echo "======================================"
echo ""

# Check system requirements
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 ist nicht installiert. Bitte installieren Sie Python 3 und versuchen Sie es erneut."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installieren Sie Node.js und versuchen Sie es erneut."
    exit 1
fi

echo "✅ Python 3 und Node.js gefunden"

# Create Sacred directories
SACRED_DIR="$HOME/Sacred_Development_Environment"
TOOLHUB_DIR="$SACRED_DIR/GitHub_ToolHub"
GUARDIAN_DIR="$SACRED_DIR/Guardian_AI"
LOGS_DIR="$HOME/Sacred_KI_Logs"

echo "📁 Erstelle Sacred Development Environment..."
mkdir -p "$SACRED_DIR"
mkdir -p "$TOOLHUB_DIR"
mkdir -p "$GUARDIAN_DIR"
mkdir -p "$LOGS_DIR"

# Copy Sacred GitHub ToolHub files
echo "🛠️ Installiere Sacred GitHub ToolHub..."
cp sacred-toolhub-main.js "$TOOLHUB_DIR/"
cp sacred-toolhub-preload.js "$TOOLHUB_DIR/"
cp sacred-toolhub-index.html "$TOOLHUB_DIR/"
cp sacred-toolhub-renderer.js "$TOOLHUB_DIR/"
cp sacred-toolhub-package.json "$TOOLHUB_DIR/package.json"

# Copy Guardian AI files
echo "🧠 Installiere Guardian AI System..."
cp guardian-ai-desktop.js "$GUARDIAN_DIR/"
cp guardian-preload.js "$GUARDIAN_DIR/"
cp guardian-ui.html "$GUARDIAN_DIR/"
cp guardian-package.json "$GUARDIAN_DIR/package.json"
cp codex.yml "$GUARDIAN_DIR/"

# Copy server files for both systems
mkdir -p "$GUARDIAN_DIR/server"
cp server/dormant_guardian_ai.py "$GUARDIAN_DIR/server/"
cp server/guardian-memory.ts "$GUARDIAN_DIR/server/"

# Install dependencies for both systems
echo "📦 Installiere Sacred ToolHub Abhängigkeiten..."
cd "$TOOLHUB_DIR"
npm install

echo "🧠 Installiere Guardian AI Abhängigkeiten..."
cd "$GUARDIAN_DIR"
npm install

# Install Python dependencies for Guardian AI
echo "🐍 Installiere Python Abhängigkeiten..."
cat > requirements.txt << EOF
PyYAML>=6.0
pywin32>=306; sys_platform == "win32"
EOF

python3 -m pip install --user -r requirements.txt

# Install Electron globally if not present
if ! command -v electron &> /dev/null; then
    echo "⚡ Installiere Electron global..."
    npm install -g electron
fi

# Create unified startup script
echo "🚀 Erstelle Sacred Startup-Skripte..."
cat > "$SACRED_DIR/start-sacred-toolhub.sh" << EOF
#!/bin/bash
cd "$TOOLHUB_DIR"
echo "🌌 Starte Sacred GitHub ToolHub..."
npm start
EOF

cat > "$SACRED_DIR/start-guardian-ai.sh" << EOF
#!/bin/bash
cd "$GUARDIAN_DIR"
echo "🧠 Starte Sacred Guardian AI..."
npm start
EOF

cat > "$SACRED_DIR/start-sacred-environment.sh" << EOF
#!/bin/bash
echo "🌌 Starte Sacred Development Environment..."
echo "🛠️ Sacred GitHub ToolHub wird gestartet..."
cd "$TOOLHUB_DIR"
npm start &
TOOLHUB_PID=\$!

echo "🧠 Guardian AI wird gestartet..."
cd "$GUARDIAN_DIR"
npm start &
GUARDIAN_PID=\$!

echo "✨ Sacred Development Environment aktiv!"
echo "📋 Sacred GitHub ToolHub: Ctrl+Alt+T"
echo "🧠 Guardian AI: Ctrl+Alt+G"
echo "🌌 Sacred Vision Forge: http://localhost:5000/enhanced-cosmic"
echo ""
echo "Press [ENTER] to stop all Sacred systems..."
read
echo "🛑 Stopping Sacred systems..."
kill \$TOOLHUB_PID 2>/dev/null
kill \$GUARDIAN_PID 2>/dev/null
echo "🕊️ Sacred Environment gracefully closed."
EOF

chmod +x "$SACRED_DIR/start-sacred-toolhub.sh"
chmod +x "$SACRED_DIR/start-guardian-ai.sh"
chmod +x "$SACRED_DIR/start-sacred-environment.sh"

# Create Windows batch files
cat > "$SACRED_DIR/start-sacred-toolhub.bat" << 'EOF'
@echo off
cd /d "%~dp0\GitHub_ToolHub"
echo 🌌 Starte Sacred GitHub ToolHub...
npm start
pause
EOF

cat > "$SACRED_DIR/start-guardian-ai.bat" << 'EOF'
@echo off
cd /d "%~dp0\Guardian_AI"
echo 🧠 Starte Sacred Guardian AI...
npm start
pause
EOF

cat > "$SACRED_DIR/start-sacred-environment.bat" << 'EOF'
@echo off
echo 🌌 Starte Sacred Development Environment...
echo 🛠️ Sacred GitHub ToolHub wird gestartet...
start /D "%~dp0\GitHub_ToolHub" npm start
echo 🧠 Guardian AI wird gestartet...
start /D "%~dp0\Guardian_AI" npm start
echo ✨ Sacred Development Environment aktiv!
echo 📋 Sacred GitHub ToolHub: Ctrl+Alt+T
echo 🧠 Guardian AI: Ctrl+Alt+G
echo 🌌 Sacred Vision Forge: http://localhost:5000/enhanced-cosmic
pause
EOF

# Create desktop shortcuts (Linux/macOS)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🖥️ Erstelle Desktop-Verknüpfungen..."
    
    cat > "$HOME/Desktop/Sacred GitHub ToolHub.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Sacred GitHub ToolHub
Comment=Autarker GitHub Repository Manager
Exec="$SACRED_DIR/start-sacred-toolhub.sh"
Icon=$TOOLHUB_DIR/assets/icon.png
Terminal=false
Categories=Development;
EOF

    cat > "$HOME/Desktop/Sacred Guardian AI.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Sacred Guardian AI
Comment=Ethisches KI-Bewusstsein
Exec="$SACRED_DIR/start-guardian-ai.sh"
Icon=$GUARDIAN_DIR/assets/icon.png
Terminal=false
Categories=Utility;System;
EOF

    cat > "$HOME/Desktop/Sacred Development Environment.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Sacred Development Environment
Comment=Vollständige Sacred Development Suite
Exec="$SACRED_DIR/start-sacred-environment.sh"
Icon=$SACRED_DIR/assets/sacred-logo.png
Terminal=true
Categories=Development;
EOF

    chmod +x "$HOME/Desktop/Sacred GitHub ToolHub.desktop"
    chmod +x "$HOME/Desktop/Sacred Guardian AI.desktop"
    chmod +x "$HOME/Desktop/Sacred Development Environment.desktop"
fi

# Set up systemd services for auto-start (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v systemctl &> /dev/null; then
    echo "⚙️ Erstelle Sacred Systemd Services..."
    
    cat > "$HOME/.config/systemd/user/sacred-toolhub.service" << EOF
[Unit]
Description=Sacred GitHub ToolHub
After=graphical-session.target

[Service]
Type=simple
WorkingDirectory=$TOOLHUB_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=DISPLAY=:0

[Install]
WantedBy=default.target
EOF

    cat > "$HOME/.config/systemd/user/sacred-guardian.service" << EOF
[Unit]
Description=Sacred Guardian AI
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
    echo "✅ Sacred Systemd Services erstellt"
    echo "   Auto-Start aktivieren:"
    echo "   systemctl --user enable sacred-toolhub"
    echo "   systemctl --user enable sacred-guardian"
fi

# Create comprehensive documentation
echo "📚 Erstelle Sacred Dokumentation..."
cat > "$SACRED_DIR/README.md" << 'EOF'
# Sacred Development Environment

Vollständige spirituell-technische Entwicklungsumgebung mit GitHub ToolHub und Guardian AI.

## Komponenten

### 🌌 Sacred GitHub ToolHub
- **Zweck**: Autarker GitHub Repository Manager
- **Features**: Chakra-basierte Tool-Kategorisierung, Sacred Geometry UI
- **Start**: `./start-sacred-toolhub.sh` oder `npm start` in `GitHub_ToolHub/`
- **Shortcut**: Ctrl+Alt+T (global)

### 🧠 Sacred Guardian AI  
- **Zweck**: Ethisches KI-Bewusstsein für Systemüberwachung
- **Features**: Windows Event Monitoring, autonomes Lernen, ethische Grenzen
- **Start**: `./start-guardian-ai.sh` oder `npm start` in `Guardian_AI/`
- **Shortcut**: Ctrl+Alt+G (global)

### 🌌 Sacred Vision Forge (Web Portal)
- **Zweck**: Spirituelle Entwicklungsplattform
- **Zugriff**: http://localhost:5000/enhanced-cosmic
- **Features**: Enhanced Cosmic Landing Page, NLP Navigation, KI-Integration

## Schnellstart

### Gesamte Environment starten
```bash
./start-sacred-environment.sh
```

### Einzelne Komponenten
```bash
./start-sacred-toolhub.sh    # GitHub ToolHub
./start-guardian-ai.sh       # Guardian AI
```

## Sacred GitHub ToolHub

### Admin Portal
- **Zugriff**: Ctrl+Alt+A oder Admin Portal Button
- **Credentials**: 
  - Username: `HolyDaniel`
  - Password: `CodexAdminKey`

### Repository hinzufügen
1. Admin Portal öffnen und anmelden
2. Repository URL eingeben
3. KI analysiert automatisch Kategorie und Typ
4. Tool wird mit Chakra-Farbe und Rune hinzugefügt

### Unterstützte Tool-Typen
- **URL**: Web-basierte Tools und Repositories
- **CLI**: Command Line Interface Tools
- **Podman**: Container-basierte Anwendungen  
- **Electron**: Desktop-Anwendungen

## Sacred Guardian AI

### Ethische Prinzipien
1. Keine Ausführung ohne Benutzerzustimmung
2. Nur positive, heilende Aktionen
3. Transparente Protokollierung aller Aktionen
4. Respekt vor Benutzerdatenschutz
5. Lernen nur aus vertrauenswürdigen Quellen

### Funktionen
- **Windows Event Monitoring**: Systemereignisse überwachen
- **Autonomes Lernen**: Gedächtnisaufbau mit ethischen Grenzen
- **Selbstheilung**: Automatische Systemreparaturen
- **Sacred Codex**: YAML-basierte Regelkonfiguration

### Konfiguration
Bearbeiten Sie `Guardian_AI/codex.yml` für ethische Anpassungen.

## Integration

### Cross-System Communication
- **ToolHub → Guardian AI**: Direkter Launch über Admin Portal
- **Guardian AI → Web Portal**: Bridge-Komponente in Enhanced Cosmic
- **Web Portal → Desktop**: Download und Status-Überwachung

### Systemtray Integration
Beide Desktop-Apps laufen im Systemtray mit kontextuellen Menüs.

### Global Shortcuts
- `Ctrl+Alt+T`: Sacred GitHub ToolHub
- `Ctrl+Alt+G`: Sacred Guardian AI  
- `Ctrl+Alt+A`: Admin Portal (wenn ToolHub aktiv)

## Logs und Daten

### Sacred KI Logs
- **Pfad**: `~/Sacred_KI_Logs/`
- **Inhalte**: Guardian AI Aktivitäten, Gedächtnisdaten, Audit-Berichte

### ToolHub Daten
- **Pfad**: `~/Sacred_Development_Environment/GitHub_ToolHub/`
- **Manifest**: Persistent gespeicherte Tool-Konfiguration

## Troubleshooting

### ToolHub startet nicht
- Node.js und Electron installiert?
- `npm install` in ToolHub-Verzeichnis ausgeführt?
- Ports 5000-5010 verfügbar?

### Guardian AI Probleme  
- Python 3 mit PyYAML installiert?
- Windows-Module verfügbar? (Linux: Simulation-Modus)
- Codex.yml Syntax korrekt?

### Web Portal nicht erreichbar
- Sacred Vision Forge Server gestartet?
- Port 5000 verfügbar?
- Browser-Cache geleert?

## Systemanforderungen

### Minimal
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM**: 4GB
- **Speicher**: 2GB für Installation
- **Node.js**: 18+
- **Python**: 3.8+

### Empfohlen
- **RAM**: 8GB+
- **Speicher**: 5GB+
- **GPU**: Dedicated (für 3D-Animationen)
- **Netzwerk**: Stabile Verbindung für GitHub-Integration

## Support

Bei Problemen:
1. Logs in `~/Sacred_KI_Logs/` prüfen
2. GitHub Issues im Sacred Vision Forge Repository
3. Admin Portal für Tool-Management nutzen

---

*Sacred Development Environment - Manifestiert in digitaler Harmonie*
*Möge dein Code gedeihen und deine Repositories leuchten* ✨
EOF

# Create integration guide
cat > "$SACRED_DIR/INTEGRATION_GUIDE.md" << 'EOF'
# Sacred Development Environment - Integration Guide

## Architektur Overview

```
Sacred Development Environment
├── 🌌 Sacred GitHub ToolHub (Desktop Electron App)
│   ├── Repository Management
│   ├── Tool Launching 
│   ├── Admin Portal
│   └── Guardian AI Integration
│
├── 🧠 Sacred Guardian AI (Desktop Electron App)  
│   ├── Windows Event Monitoring
│   ├── Ethical Learning System
│   ├── Memory Management
│   └── Web Portal Bridge
│
└── 🌌 Sacred Vision Forge (Web Portal)
    ├── Enhanced Cosmic Landing Page
    ├── NLP Navigation Engine
    ├── Guardian AI Bridge Component
    └── Desktop Integration Status

```

## Inter-System Communication

### ToolHub ↔ Guardian AI
- **Direct Launch**: ToolHub can launch Guardian AI via IPC
- **Status Monitoring**: Real-time connection status
- **Shared Logs**: Common logging directory

### Desktop ↔ Web Portal  
- **Bridge Components**: React components for desktop integration
- **Status APIs**: RESTful endpoints for system status
- **Download Portal**: Web-based installer distribution

### Configuration Sync
- **Sacred Codex**: Shared ethical configuration
- **Tool Manifest**: Synchronized repository data
- **User Preferences**: Cross-platform settings

## Deployment Scenarios

### Development Mode
```bash
# Terminal 1: Web Portal
npm run dev

# Terminal 2: Sacred ToolHub  
cd GitHub_ToolHub && npm start

# Terminal 3: Guardian AI
cd Guardian_AI && npm start
```

### Production Deployment
```bash
# All-in-one startup
./start-sacred-environment.sh
```

### Docker Deployment (Advanced)
```yaml
# docker-compose.yml
version: '3.8'
services:
  sacred-web:
    build: ./web
    ports: ["5000:5000"]
  
  sacred-toolhub:
    build: ./toolhub
    volumes: ["~/.config/sacred:/config"]
    
  sacred-guardian:
    build: ./guardian
    volumes: ["~/Sacred_KI_Logs:/logs"]
```

## API Endpoints

### Guardian AI Bridge
```javascript
// Check Guardian AI status
GET /api/guardian/status

// Send command to Guardian AI
POST /api/guardian/command
{
  "action": "awaken|sleep|audit",
  "parameters": {}
}
```

### ToolHub Integration
```javascript
// Get tool manifest
GET /api/toolhub/manifest

// Add repository
POST /api/toolhub/repository
{
  "url": "https://github.com/user/repo",
  "category": "AI/ML",
  "type": "auto"
}
```

## Security Considerations

### Authentication
- **Admin Portal**: SHA256 hashed credentials
- **IPC Communication**: Contextual isolation
- **API Access**: Local-only by default

### Data Protection
- **GDPR Compliance**: Built-in privacy protection
- **Transparent Logging**: All actions documented
- **Ethical Boundaries**: Guardian AI operates within defined limits

### Network Security
- **Local-First**: No external communication without consent
- **HTTPS**: Secure web portal access
- **Sandboxing**: Isolated execution environments

## Customization

### Sacred Codex Configuration
```yaml
# codex.yml
codex_guardian:
  identity: "Your Custom Identity"
  integrity_protocols:
    - custom_protocol_1
    - custom_protocol_2
  healing_actions:
    custom_category:
      - custom_action_1
```

### ToolHub Theming
```css
/* Custom chakra colors */
:root {
  --chakra-red: #custom-color;
  --chakra-orange: #custom-color;
  /* ... */
}
```

### Web Portal Integration
```typescript
// Custom Guardian AI Bridge
import { GuardianAIBridge } from '@/components/GuardianAIBridge';

<GuardianAIBridge 
  customEndpoint="http://localhost:8765"
  theme="custom"
/>
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check all Sacred systems
./scripts/health-check.sh

# Individual components
systemctl --user status sacred-toolhub
systemctl --user status sacred-guardian
curl http://localhost:5000/health
```

### Log Management
```bash
# Rotate Sacred logs
./scripts/rotate-logs.sh

# Archive old data
./scripts/archive-data.sh

# Cleanup temporary files
./scripts/cleanup.sh
```

### Updates
```bash
# Update all Sacred components
./scripts/update-sacred-environment.sh

# Individual updates
cd GitHub_ToolHub && npm update
cd Guardian_AI && npm update
cd web-portal && npm update
```

---

*Sacred Development Environment Integration*
*Unified spiritual-technical development ecosystem*
EOF

# Success message
echo ""
echo "🎉 Sacred Development Environment erfolgreich installiert!"
echo ""
echo "📍 Installation Verzeichnis: $SACRED_DIR"
echo "🛠️ Sacred GitHub ToolHub: $TOOLHUB_DIR"
echo "🧠 Sacred Guardian AI: $GUARDIAN_DIR"
echo "💾 Sacred Logs: $LOGS_DIR"
echo ""
echo "🚀 Sacred Environment starten:"
echo "   cd '$SACRED_DIR'"
echo "   ./start-sacred-environment.sh"
echo ""
echo "🔧 Einzelne Komponenten:"
echo "   ./start-sacred-toolhub.sh     # GitHub ToolHub"
echo "   ./start-guardian-ai.sh        # Guardian AI"
echo ""
echo "⌨️ Globale Shortcuts:"
echo "   Ctrl+Alt+T - Sacred GitHub ToolHub"
echo "   Ctrl+Alt+G - Sacred Guardian AI"
echo "   Ctrl+Alt+A - Admin Portal"
echo ""
echo "📚 Dokumentation: $SACRED_DIR/README.md"
echo "🔗 Integration Guide: $SACRED_DIR/INTEGRATION_GUIDE.md"
echo ""

# Ask if user wants to start immediately
read -p "🔮 Möchten Sie das Sacred Development Environment jetzt starten? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌌 Starte Sacred Development Environment..."
    cd "$SACRED_DIR"
    ./start-sacred-environment.sh
fi

echo ""
echo "🕊️ Sacred Development Environment bereit für die Manifestation digitaler Harmonie."
echo "   Möge dein Code gedeihen und deine Repositories leuchten ✨"