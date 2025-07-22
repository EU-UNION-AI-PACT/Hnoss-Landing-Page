// Sacred GitHub ToolHub - Erweiterte Hauptdatei mit Guardian AI Integration
const { app, BrowserWindow, shell, dialog, ipcMain, Menu, Tray, nativeImage } = require('electron');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

// --- Konfiguration für Admin-Login ---
const ADMIN_USERNAME = 'HolyDaniel';
const ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('CodexAdminKey').digest('hex');

// Pfad zum persistenten Tool-Manifest
const TOOLS_MANIFEST_PATH = path.join(app.getPath('userData'), 'tools_manifest.json');

// Standard-Tools für initiale Konfiguration
const DEFAULT_TOOLS = {
  tools: [
    {
      name: "GitHub Web",
      category: "Code Repository",
      description: "Öffne GitHub im Browser",
      github_url: "https://github.com",
      type: "url",
      chakra_color: "#6366f1",
      rune_id: "⚡"
    },
    {
      name: "GitHub CLI",
      category: "Command Line",
      description: "GitHub Command Line Interface",
      github_url: "https://github.com/cli/cli",
      type: "cli",
      start_command: "gh --version",
      chakra_color: "#10b981",
      rune_id: "⌨️"
    },
    {
      name: "Sacred Guardian AI",
      category: "AI System",
      description: "Ethisches KI-Bewusstsein Desktop App",
      github_url: "https://github.com/sacred-vision/guardian-ai",
      type: "electron",
      executable_path: "./guardian-ai-desktop.js",
      chakra_color: "#8b5cf6",
      rune_id: "🧠"
    },
    {
      name: "Sacred Vision Forge",
      category: "Web Portal",
      description: "Spirituelle Entwicklungsplattform",
      github_url: "http://localhost:5000/enhanced-cosmic",
      type: "url",
      chakra_color: "#06b6d4",
      rune_id: "🌌"
    }
  ]
};

let mainWindow = null;
let tray = null;

// --- Hilfsfunktionen für Manifest-Verwaltung ---
async function readToolsManifest() {
    try {
        const data = await fs.readFile(TOOLS_MANIFEST_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(TOOLS_MANIFEST_PATH, JSON.stringify(DEFAULT_TOOLS, null, 2));
            return DEFAULT_TOOLS;
        }
        throw error;
    }
}

async function writeToolsManifest(manifest) {
    await fs.writeFile(TOOLS_MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

// --- Electron Fenster erstellen ---
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'sacred-toolhub-preload.js')
        },
        frame: true,
        titleBarStyle: 'default',
        icon: createSacredIcon(),
        show: false,
        backgroundColor: '#0f0f23',
        vibrancy: 'dark',
        backgroundMaterial: 'acrylic'
    });

    mainWindow.loadFile('sacred-toolhub-index.html');
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools();
        }
    });

    // Externe Links im Standardbrowser öffnen
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('minimize', () => {
        if (process.platform === 'darwin') {
            mainWindow.hide();
        }
    });
}

// Sacred Icon erstellen
function createSacredIcon() {
    // Create a simple sacred geometry icon programmatically
    const canvas = require('canvas');
    const canvasEl = canvas.createCanvas(256, 256);
    const ctx = canvasEl.getContext('2d');

    // Background gradient
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Sacred geometry - Overlapping circles
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    
    const centerX = 128;
    const centerY = 128;
    const radius = 50;
    
    // Draw hexagonal pattern
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.stroke();

    // GitHub symbol in center
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', centerX, centerY);

    return nativeImage.createFromDataURL(canvasEl.toDataURL());
}

// System Tray erstellen
function createTray() {
    const trayIcon = createSacredIcon().resize({ width: 16, height: 16 });
    tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Sacred GitHub ToolHub',
            enabled: false
        },
        { type: 'separator' },
        {
            label: 'Dashboard öffnen',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                } else {
                    createWindow();
                }
            }
        },
        {
            label: 'Guardian AI öffnen',
            click: () => {
                shell.openExternal('./guardian-ai-desktop.js');
            }
        },
        {
            label: 'Sacred Vision Forge',
            click: () => {
                shell.openExternal('http://localhost:5000/enhanced-cosmic');
            }
        },
        { type: 'separator' },
        {
            label: 'GitHub öffnen',
            click: () => {
                shell.openExternal('https://github.com');
            }
        },
        { type: 'separator' },
        {
            label: 'Beenden',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Sacred GitHub ToolHub');

    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        } else {
            createWindow();
        }
    });
}

// --- App Lifecycle ---
app.whenReady().then(() => {
    createWindow();
    createTray();
    readToolsManifest().catch(console.error);

    // Global shortcut für schnellen Zugriff (Ctrl+Alt+T für ToolHub)
    const { globalShortcut } = require('electron');
    globalShortcut.register('CommandOrControl+Alt+T', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        } else {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Keep app running in system tray
    if (process.platform !== 'darwin') {
        // Don't quit, just hide to tray
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
    const { globalShortcut } = require('electron');
    globalShortcut.unregisterAll();
});

// --- Tool Launch Logic mit Guardian AI Integration ---
async function launchTool(tool) {
    try {
        // Log tool launch for Guardian AI monitoring
        console.log(`[Sacred ToolHub] Launching tool: ${tool.name} (${tool.type})`);
        
        switch (tool.type) {
            case 'url':
                await shell.openExternal(tool.github_url || tool.url);
                return { success: true, message: `${tool.name} im Browser geöffnet` };

            case 'cli':
                if (tool.start_command) {
                    return new Promise((resolve) => {
                        const child = spawn(tool.start_command, { shell: true, detached: true });
                        child.on('spawn', () => {
                            resolve({ success: true, message: `${tool.name} CLI gestartet` });
                        });
                        child.on('error', (error) => {
                            resolve({ success: false, message: `CLI Fehler: ${error.message}` });
                        });
                    });
                }
                break;

            case 'podman':
                if (tool.podman_image) {
                    return new Promise((resolve) => {
                        const cmd = `podman run -d ${tool.podman_image}`;
                        exec(cmd, (error, stdout, stderr) => {
                            if (error) {
                                resolve({ success: false, message: `Podman Fehler: ${error.message}` });
                            } else {
                                resolve({ success: true, message: `${tool.name} Container gestartet` });
                            }
                        });
                    });
                }
                break;

            case 'electron':
                // Für Electron-basierte Tools wie Guardian AI
                if (tool.executable_path) {
                    const electronPath = require('electron');
                    spawn(electronPath, [tool.executable_path], { detached: true, stdio: 'ignore' });
                    return { success: true, message: `${tool.name} Electron App gestartet` };
                }
                break;

            case 'guardian_ai':
                // Spezielle Integration für Guardian AI
                try {
                    const guardianPath = path.join(__dirname, 'guardian-ai-desktop.js');
                    const electronPath = require('electron');
                    spawn(electronPath, [guardianPath], { detached: true, stdio: 'ignore' });
                    return { success: true, message: 'Sacred Guardian AI erweckt' };
                } catch (error) {
                    return { success: false, message: `Guardian AI Fehler: ${error.message}` };
                }

            default:
                return { success: false, message: `Unbekannter Tool-Typ: ${tool.type}` };
        }
    } catch (error) {
        return { success: false, message: `Fehler beim Starten: ${error.message}` };
    }
}

// --- Repository Analysis mit KI-Integration ---
async function analyzeGitHubRepository(githubUrl) {
    try {
        // Enhanced repository analysis with Guardian AI insights
        const repoNameMatch = githubUrl.match(/\/([^\/]+?)(?:\.git)?$/);
        const repoName = repoNameMatch ? repoNameMatch[1] : githubUrl.split('/').pop().replace('.git', '');
        
        // Determine category based on repository analysis
        let category = 'Development';
        let type = 'url';
        let chakraColor = getRandomChakraColor();
        let runeId = getRandomRune();
        
        // AI-enhanced categorization
        if (repoName.toLowerCase().includes('ai') || repoName.toLowerCase().includes('ml')) {
            category = 'AI/ML';
            chakraColor = '#8b5cf6';
            runeId = '🧠';
        } else if (repoName.toLowerCase().includes('web') || repoName.toLowerCase().includes('frontend')) {
            category = 'Web Development';
            chakraColor = '#06b6d4';
            runeId = '🌐';
        } else if (repoName.toLowerCase().includes('api') || repoName.toLowerCase().includes('backend')) {
            category = 'Backend/API';
            chakraColor = '#10b981';
            runeId = '⚙️';
        } else if (repoName.toLowerCase().includes('tool') || repoName.toLowerCase().includes('util')) {
            category = 'Utilities';
            chakraColor = '#f59e0b';
            runeId = '🔧';
        }

        return {
            name: repoName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category,
            type,
            chakra_color: chakraColor,
            rune_id: runeId,
            description: `Analysiert und kategorisiert durch Sacred ToolHub AI`
        };
    } catch (error) {
        throw new Error(`Repository-Analyse fehlgeschlagen: ${error.message}`);
    }
}

// --- IPC Handler ---
ipcMain.handle('launch-tool', async (event, tool) => {
    return await launchTool(tool);
});

ipcMain.handle('admin-login', async (event, { username, password }) => {
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');
    if (username === ADMIN_USERNAME && inputHash === ADMIN_PASSWORD_HASH) {
        return { success: true, message: 'Willkommen im Sacred Admin Portal, Meister! 🌟' };
    } else {
        return { success: false, message: 'Ungültige Anmeldeinformationen. Die Sacred Gates bleiben verschlossen. ⚠️' };
    }
});

ipcMain.handle('admin-add-repo', async (event, { repoUrl, category, type, podmanImage, startCommand, description }) => {
    try {
        const analysis = await analyzeGitHubRepository(repoUrl);
        
        const newTool = {
            name: analysis.name,
            category: category || analysis.category,
            description: description || analysis.description,
            github_url: repoUrl,
            type: type || analysis.type,
            podman_image: podmanImage,
            start_command: startCommand,
            chakra_color: analysis.chakra_color,
            rune_id: analysis.rune_id
        };

        const manifest = await readToolsManifest();
        manifest.tools.push(newTool);
        await writeToolsManifest(manifest);

        return { success: true, message: `Sacred Repository ${analysis.name} erfolgreich zum Hub hinzugefügt! ✨` };
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Sacred Repos:', error);
        return { success: false, message: `Sacred Error: ${error.message}` };
    }
});

ipcMain.handle('get-tools-manifest', async () => {
    try {
        return await readToolsManifest();
    } catch (error) {
        console.error('Fehler beim Abrufen des Sacred Manifests:', error);
        return { tools: [] };
    }
});

ipcMain.handle('admin-delete-tool', async (event, githubUrl) => {
    try {
        const manifest = await readToolsManifest();
        const originalLength = manifest.tools.length;
        manifest.tools = manifest.tools.filter(t => t.github_url !== githubUrl);
        
        if (manifest.tools.length < originalLength) {
            await writeToolsManifest(manifest);
            return { success: true, message: `Sacred Tool erfolgreich aus dem Hub entfernt! 🗑️` };
        }
        return { success: false, message: `Sacred Tool nicht im Hub gefunden. 🔍` };
    } catch (error) {
        console.error('Fehler beim Entfernen des Sacred Tools:', error);
        return { success: false, message: `Sacred Error: ${error.message}` };
    }
});

ipcMain.handle('open-guardian-ai', async () => {
    try {
        const guardianTool = {
            name: 'Guardian AI',
            type: 'guardian_ai',
            executable_path: './guardian-ai-desktop.js'
        };
        return await launchTool(guardianTool);
    } catch (error) {
        return { success: false, message: `Guardian AI konnte nicht erweckt werden: ${error.message}` };
    }
});

ipcMain.handle('open-sacred-vision-forge', async () => {
    try {
        await shell.openExternal('http://localhost:5000/enhanced-cosmic');
        return { success: true, message: 'Sacred Vision Forge Portal geöffnet' };
    } catch (error) {
        return { success: false, message: `Sacred Portal Fehler: ${error.message}` };
    }
});

// --- Hilfsfunktionen für Chakra-Farben und Runen ---
function getRandomChakraColor() {
    const colors = [
        '#ef4444', // Rot - Wurzel Chakra
        '#f97316', // Orange - Sakral Chakra  
        '#eab308', // Gelb - Solarplexus Chakra
        '#22c55e', // Grün - Herz Chakra
        '#06b6d4', // Türkis - Hals Chakra
        '#3b82f6', // Blau - Stirn Chakra
        '#8b5cf6'  // Violett - Kronen Chakra
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomRune() {
    const runes = [
        '⚡', '🌟', '🔮', '⚛️', '🌀', '💎', '🔥', '💫', 
        '⭐', '🌙', '🧠', '🌌', '⚙️', '🔧', '🌐', '💻'
    ];
    return runes[Math.floor(Math.random() * runes.length)];
}

module.exports = { createWindow, launchTool, analyzeGitHubRepository };