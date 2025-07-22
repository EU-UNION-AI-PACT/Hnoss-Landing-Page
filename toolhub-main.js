// toolhub-main.js - Sacred GitHub ToolHub Main Process
const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

// Admin authentication configuration
const ADMIN_USERNAME = 'HolyDaniel';
const ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('CodexAdminKey').digest('hex');

// Persistent tool manifest path
const TOOLS_MANIFEST_PATH = path.join(app.getPath('userData'), 'tools_manifest.json');

// Default tools for initial configuration
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
      name: "Sacred Vision Forge",
      category: "Web Tools",
      description: "Your cosmic spiritual platform",
      github_url: "https://github.com/HnossPRismAnTHarION/sacred-vision-forge",
      type: "url",
      chakra_color: "#8b5cf6",
      rune_id: "🌌"
    }
  ]
};

// Manifest management functions
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

// Create main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'toolhub-preload.js')
    },
    frame: true,
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#0f0f23',
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('toolhub/index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  readToolsManifest().catch(console.error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Tool launch logic
async function launchTool(tool) {
  try {
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
        if (tool.executable_path) {
          spawn(tool.executable_path, { detached: true });
          return { success: true, message: `${tool.name} Electron App gestartet` };
        }
        break;

      default:
        return { success: false, message: `Unbekannter Tool-Typ: ${tool.type}` };
    }
  } catch (error) {
    return { success: false, message: `Fehler beim Starten: ${error.message}` };
  }
}

// IPC handlers
ipcMain.handle('launch-tool', async (event, tool) => {
  return await launchTool(tool);
});

ipcMain.handle('admin-login', async (event, { username, password }) => {
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  if (username === ADMIN_USERNAME && inputHash === ADMIN_PASSWORD_HASH) {
    return { success: true, message: 'Login erfolgreich. Willkommen, Meister!' };
  } else {
    return { success: false, message: 'Ungültige Anmeldeinformationen.' };
  }
});

ipcMain.handle('admin-add-repo', async (event, { repoUrl, category, type, podmanImage, startCommand, description }) => {
  try {
    const repoNameMatch = repoUrl.match(/\/([^\/]+?)(?:\.git)?$/);
    const repoName = repoNameMatch ? repoNameMatch[1] : repoUrl.split('/').pop().replace('.git', '');
    
    const inferredType = type || (podmanImage ? 'podman' : (repoUrl.includes('http') ? 'url' : 'cli'));
    const inferredStartCommand = startCommand || (inferredType === 'cli' ? `git clone ${repoUrl}` : undefined);

    const newTool = {
      name: repoName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category: category || 'Unkategorisiert',
      description: description || `Tool aus Repository: ${repoUrl}`,
      github_url: repoUrl,
      type: inferredType,
      podman_image: podmanImage,
      start_command: inferredStartCommand,
      chakra_color: getRandomChakraColor(),
      rune_id: getRandomRune()
    };

    const manifest = await readToolsManifest();
    manifest.tools.push(newTool);
    await writeToolsManifest(manifest);

    return { success: true, message: `Repository ${repoName} erfolgreich hinzugefügt!` };
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Repos:', error);
    return { success: false, message: `Fehler: ${error.message}` };
  }
});

ipcMain.handle('get-tools-manifest', async () => {
  try {
    return await readToolsManifest();
  } catch (error) {
    console.error('Fehler beim Abrufen des Manifests:', error);
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
      return { success: true, message: `Tool erfolgreich gelöscht!` };
    }
    return { success: false, message: `Tool nicht gefunden.` };
  } catch (error) {
    console.error('Fehler beim Löschen des Tools:', error);
    return { success: false, message: `Fehler: ${error.message}` };
  }
});

// Helper functions for chakra colors and runes
function getRandomChakraColor() {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomRune() {
  const runes = ['⚡', '🌟', '🔮', '⚛️', '🌀', '💎', '🔥', '💫', '⭐', '🌙'];
  return runes[Math.floor(Math.random() * runes.length)];
}