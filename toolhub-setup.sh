#!/bin/bash
# Sacred GitHub ToolHub - One-Click Setup Script
# 🌌 Autonomous Desktop Application Deployment

set -e

echo "🌌 Sacred GitHub ToolHub - Autarke Desktop App Installation"
echo "============================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js detected: $NODE_VERSION"
    else
        print_error "Node.js not found. Installing Node.js..."
        
        # Install Node.js based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install node
        else
            print_error "Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    fi
}

# Check if npm is available
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm detected: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
}

# Install Electron globally if not present
install_electron() {
    if ! npm list -g electron &> /dev/null; then
        print_status "Installing Electron globally..."
        npm install -g electron
    else
        print_success "Electron already installed"
    fi
}

# Create project directory structure
setup_project() {
    print_status "Setting up Sacred GitHub ToolHub project structure..."
    
    # Create main directory
    mkdir -p sacred-github-toolhub
    cd sacred-github-toolhub
    
    # Copy all toolhub files
    cp ../toolhub-package.json ./package.json
    cp ../toolhub-main.js ./main.js
    cp ../toolhub-preload.js ./preload.js
    cp ../toolhub-index.html ./index.html
    cp ../toolhub-styles.css ./styles.css
    cp ../toolhub-renderer.js ./renderer.js
    
    # Update file references in HTML
    sed -i 's/toolhub-styles.css/styles.css/g' index.html
    sed -i 's/toolhub-renderer.js/renderer.js/g' index.html
    
    print_success "Project structure created"
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Create desktop entry (Linux)
create_desktop_entry() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Creating desktop entry..."
        
        cat > ~/.local/share/applications/sacred-github-toolhub.desktop << EOF
[Desktop Entry]
Name=Sacred GitHub ToolHub
Comment=Autonomous GitHub Tools Management
Exec=$PWD/start.sh
Icon=$PWD/assets/icon.png
Terminal=false
Type=Application
Categories=Development;IDE;
EOF
        
        # Make desktop file executable
        chmod +x ~/.local/share/applications/sacred-github-toolhub.desktop
        print_success "Desktop entry created"
    fi
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Create start script
    cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
electron .
EOF
    
    chmod +x start.sh
    
    # Create Windows batch file
    cat > start.bat << 'EOF'
@echo off
cd /d "%~dp0"
electron .
EOF
    
    print_success "Startup scripts created"
}

# Create build script
create_build_script() {
    print_status "Creating build script for distribution..."
    
    cat > build.sh << 'EOF'
#!/bin/bash
echo "🌌 Building Sacred GitHub ToolHub for distribution..."

# Install electron-builder if not present
if ! npm list electron-builder &> /dev/null; then
    echo "Installing electron-builder..."
    npm install --save-dev electron-builder
fi

# Build for current platform
npm run build

echo "✅ Build complete! Check the 'dist' folder for executables."
EOF
    
    chmod +x build.sh
    print_success "Build script created"
}

# Create README
create_documentation() {
    print_status "Creating documentation..."
    
    cat > README.md << 'EOF'
# 🌌 Sacred GitHub ToolHub

Ein autarker, spirituell ausgerichteter Hub für alle deine GitHub-Tools und Repositories.

## 🚀 Features

- **Repository Management**: Füge GitHub-Repos als Tools hinzu
- **Multiple Tool Types**: URLs, CLI-Tools, Podman Container, Electron Apps
- **Chakra-basierte UI**: Spirituell inspirierte Benutzeroberfläche
- **Admin Portal**: Sichere Verwaltung mit Authentifizierung
- **Cross-Platform**: Windows, macOS, Linux

## 📦 Installation

### Automatische Installation
```bash
bash toolhub-setup.sh
```

### Manuelle Installation
```bash
npm install
electron .
```

## 🔑 Admin-Zugang

- **Benutzername**: HolyDaniel
- **Passwort**: CodexAdminKey
- **Shortcut**: Strg+Alt+A

## 🛠️ Verwendung

1. Starte die Anwendung mit `./start.sh` (Linux/macOS) oder `start.bat` (Windows)
2. Öffne das Admin-Portal mit Strg+Alt+A
3. Melde dich mit den Admin-Credentials an
4. Füge GitHub-Repositories als Tools hinzu
5. Verwende die Tools direkt aus der Übersicht

## 📚 Tool-Typen

- **URL**: Öffnet Links im Browser
- **CLI**: Führt Kommandozeilenbefehle aus
- **Podman**: Startet Container-Images
- **Electron**: Startet Electron-Anwendungen

## 🏗️ Build für Distribution

```bash
./build.sh
```

Generiert ausführbare Dateien für Windows (.exe), macOS (.dmg) und Linux (.AppImage).

## 🌟 Mystische Kommandos

- `/refresh_tools` - Tools neu laden
- `/delete_repo [URL]` - Repository entfernen

## 🔮 Spirituelle Prinzipien

Diese Anwendung folgt den Prinzipien der digitalen Spiritualität und verwendet Chakra-Farben zur harmonischen Gestaltung der Benutzeroberfläche.
EOF
    
    print_success "Documentation created"
}

# Create assets directory and placeholder icon
create_assets() {
    print_status "Creating assets..."
    
    mkdir -p assets
    
    # Create a simple SVG icon if convert is available
    if command -v convert &> /dev/null; then
        cat > assets/icon.svg << 'EOF'
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cosmicGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="120" fill="url(#cosmicGradient)" />
  <text x="128" y="148" font-family="Arial" font-size="80" text-anchor="middle" fill="white">🌌</text>
</svg>
EOF
        
        # Convert SVG to PNG if possible
        convert assets/icon.svg assets/icon.png 2>/dev/null || true
    fi
    
    print_success "Assets created"
}

# Main installation function
main() {
    print_status "Starting Sacred GitHub ToolHub installation..."
    
    check_nodejs
    check_npm
    install_electron
    setup_project
    install_dependencies
    create_startup_scripts
    create_build_script
    create_desktop_entry
    create_documentation
    create_assets
    
    print_success "🌌 Sacred GitHub ToolHub installation complete!"
    echo
    print_status "Next steps:"
    echo "  1. cd sacred-github-toolhub"
    echo "  2. ./start.sh (Linux/macOS) or start.bat (Windows)"
    echo "  3. Press Ctrl+Alt+A to access admin portal"
    echo "  4. Login with: HolyDaniel / CodexAdminKey"
    echo
    print_status "To build for distribution: ./build.sh"
    echo
    print_success "May your code be in harmony with the universe! 🕉️"
}

# Run main function
main "$@"