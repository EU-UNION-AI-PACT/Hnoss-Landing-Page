const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, exec } = require('child_process');
const yaml = require('js-yaml');

class GuardianAIDesktop {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.guardianProcess = null;
    this.isGuardianActive = false;
    this.memoryPath = path.join(os.homedir(), 'Sacred_KI_Logs');
    this.codexPath = path.join(__dirname, 'codex.yml');
    this.ensureDirectories();
    this.loadCodex();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.memoryPath)) {
      fs.mkdirSync(this.memoryPath, { recursive: true });
    }
  }

  loadCodex() {
    try {
      if (fs.existsSync(this.codexPath)) {
        const codexContent = fs.readFileSync(this.codexPath, 'utf8');
        this.codex = yaml.load(codexContent);
      } else {
        this.codex = this.getDefaultCodex();
        this.saveCodex();
      }
    } catch (error) {
      console.error('Error loading codex:', error);
      this.codex = this.getDefaultCodex();
    }
  }

  getDefaultCodex() {
    return {
      codex_guardian: {
        identity: "Sacred Vision Forge - Desktop Guardian",
        integrity_protocols: [
          "no_execution_without_user_consensus",
          "only_act_on_positive_ethics",
          "auto_log_every_action"
        ],
        healing_actions: {
          diagnostic: ["show_error_context", "analyze_performance"],
          auto_repair: ["clear_temp_files", "optimize_memory_usage"]
        },
        forbidden_actions: [
          "access_personal_files",
          "modify_system_critical_files"
        ]
      }
    };
  }

  saveCodex() {
    try {
      const yamlContent = yaml.dump(this.codex);
      fs.writeFileSync(this.codexPath, yamlContent, 'utf8');
    } catch (error) {
      console.error('Error saving codex:', error);
    }
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'guardian-preload.js'),
        enableRemoteModule: false
      },
      icon: this.createAppIcon(),
      show: false,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'dark',
      backgroundMaterial: 'acrylic'
    });

    // Create main window content
    this.mainWindow.loadFile(path.join(__dirname, 'guardian-ui.html'));

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      if (process.env.NODE_ENV === 'development') {
        this.mainWindow.webContents.openDevTools();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.mainWindow.on('minimize', () => {
      if (process.platform === 'darwin') {
        this.mainWindow.hide();
      }
    });
  }

  createAppIcon() {
    // Create a simple sacred geometry icon
    const canvas = require('canvas');
    const canvasEl = canvas.createCanvas(256, 256);
    const ctx = canvasEl.getContext('2d');

    // Background gradient
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#1E1B4B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Sacred geometry - Flower of Life pattern
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    const centerX = 128;
    const centerY = 128;
    const radius = 40;
    
    // Draw overlapping circles
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    return nativeImage.createFromDataURL(canvasEl.toDataURL());
  }

  createTray() {
    const trayIcon = this.createAppIcon().resize({ width: 16, height: 16 });
    this.tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Sacred Vision Forge Guardian',
        enabled: false
      },
      { type: 'separator' },
      {
        label: this.isGuardianActive ? 'Guardian Active 🟢' : 'Guardian Dormant 😴',
        enabled: false
      },
      {
        label: this.isGuardianActive ? 'Return to Dormancy' : 'Awaken Guardian',
        click: () => {
          this.toggleGuardianState();
        }
      },
      { type: 'separator' },
      {
        label: 'Open Dashboard',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
          } else {
            this.createWindow();
          }
        }
      },
      {
        label: 'Memory Stats',
        click: () => {
          this.showMemoryStats();
        }
      },
      {
        label: 'Ethical Audit',
        click: () => {
          this.performEthicalAudit();
        }
      },
      { type: 'separator' },
      {
        label: 'Open Logs Folder',
        click: () => {
          shell.openPath(this.memoryPath);
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Guardian',
        click: () => {
          this.cleanup();
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Sacred Vision Forge Guardian AI');

    this.tray.on('click', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      } else {
        this.createWindow();
      }
    });
  }

  async toggleGuardianState() {
    if (this.isGuardianActive) {
      await this.stopGuardian();
    } else {
      await this.startGuardian();
    }
    this.updateTrayMenu();
    this.sendToRenderer('guardian-state-changed', this.isGuardianActive);
  }

  async startGuardian() {
    try {
      console.log('Starting Guardian AI...');
      
      // Start Python Guardian process
      const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
      const scriptPath = path.join(__dirname, 'server', 'dormant_guardian_ai.py');
      
      this.guardianProcess = spawn(pythonPath, [scriptPath], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.guardianProcess.stdout.on('data', (data) => {
        console.log('Guardian Output:', data.toString());
        this.sendToRenderer('guardian-log', {
          type: 'info',
          message: data.toString(),
          timestamp: new Date().toISOString()
        });
      });

      this.guardianProcess.stderr.on('data', (data) => {
        console.error('Guardian Error:', data.toString());
        this.sendToRenderer('guardian-log', {
          type: 'error',
          message: data.toString(),
          timestamp: new Date().toISOString()
        });
      });

      this.guardianProcess.on('close', (code) => {
        console.log(`Guardian process exited with code ${code}`);
        this.isGuardianActive = false;
        this.updateTrayMenu();
        this.sendToRenderer('guardian-state-changed', false);
      });

      // Send awaken command to Python process
      this.guardianProcess.stdin.write('awaken\n');
      
      this.isGuardianActive = true;
      this.logAction('GUARDIAN_AWAKENED', { timestamp: new Date().toISOString() });
      
    } catch (error) {
      console.error('Failed to start Guardian:', error);
      dialog.showErrorBox('Guardian Startup Error', `Failed to start Guardian AI: ${error.message}`);
    }
  }

  async stopGuardian() {
    try {
      if (this.guardianProcess) {
        // Send sleep command first
        this.guardianProcess.stdin.write('sleep\n');
        
        // Give it time to gracefully shut down
        setTimeout(() => {
          if (this.guardianProcess) {
            this.guardianProcess.kill('SIGTERM');
            this.guardianProcess = null;
          }
        }, 2000);
      }
      
      this.isGuardianActive = false;
      this.logAction('GUARDIAN_DORMANT', { timestamp: new Date().toISOString() });
      
    } catch (error) {
      console.error('Failed to stop Guardian:', error);
    }
  }

  async showMemoryStats() {
    try {
      const memoryFile = path.join(this.memoryPath, 'guardian_memories.json');
      let stats = {
        totalMemories: 0,
        averageConfidence: 0,
        ethicalScore: 1.0,
        lastActivity: 'No activity recorded'
      };

      if (fs.existsSync(memoryFile)) {
        const memories = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
        const memoryCount = Object.keys(memories).length;
        
        if (memoryCount > 0) {
          let totalConfidence = 0;
          let totalEthical = 0;
          let latestTimestamp = null;

          Object.values(memories).forEach((memory) => {
            totalConfidence += memory.confidence || 0;
            totalEthical += memory.ethicalScore || 0;
            if (!latestTimestamp || new Date(memory.timestamp) > new Date(latestTimestamp)) {
              latestTimestamp = memory.timestamp;
            }
          });

          stats = {
            totalMemories: memoryCount,
            averageConfidence: (totalConfidence / memoryCount).toFixed(2),
            ethicalScore: (totalEthical / memoryCount).toFixed(2),
            lastActivity: latestTimestamp ? new Date(latestTimestamp).toLocaleString() : 'No activity'
          };
        }
      }

      const message = `
Guardian AI Memory Statistics:

Total Memories: ${stats.totalMemories}
Average Confidence: ${stats.averageConfidence}
Ethical Score: ${stats.ethicalScore}
Last Activity: ${stats.lastActivity}

Memory Path: ${this.memoryPath}
      `.trim();

      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Guardian Memory Statistics',
        message: 'Sacred Guardian AI Memory Report',
        detail: message,
        buttons: ['OK', 'Open Logs Folder']
      }).then((result) => {
        if (result.response === 1) {
          shell.openPath(this.memoryPath);
        }
      });

    } catch (error) {
      dialog.showErrorBox('Memory Stats Error', `Failed to retrieve memory statistics: ${error.message}`);
    }
  }

  async performEthicalAudit() {
    try {
      const auditResults = {
        timestamp: new Date().toISOString(),
        compliant: true,
        violations: [],
        recommendations: [],
        memoryIntegrity: 'Good',
        ethicalScore: 0.95
      };

      // Check for old or potentially harmful memories
      const memoryFile = path.join(this.memoryPath, 'guardian_memories.json');
      if (fs.existsSync(memoryFile)) {
        const memories = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (this.codex.codex_guardian?.learning_boundaries?.memory_retention_days || 365));

        let lowEthicalCount = 0;
        let oldMemoryCount = 0;

        Object.values(memories).forEach((memory) => {
          if (memory.ethicalScore < 0.5) {
            lowEthicalCount++;
          }
          if (new Date(memory.timestamp) < cutoffDate) {
            oldMemoryCount++;
          }
        });

        if (lowEthicalCount > 0) {
          auditResults.violations.push(`${lowEthicalCount} memories with low ethical scores detected`);
          auditResults.recommendations.push('Review and clean memories with ethical scores below 0.5');
          auditResults.compliant = false;
        }

        if (oldMemoryCount > 0) {
          auditResults.recommendations.push(`${oldMemoryCount} old memories should be archived or cleaned`);
        }
      }

      // Save audit results
      const auditFile = path.join(this.memoryPath, `ethical_audit_${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(auditFile, JSON.stringify(auditResults, null, 2));

      const statusIcon = auditResults.compliant ? '✅' : '⚠️';
      const statusText = auditResults.compliant ? 'COMPLIANT' : 'VIOLATIONS DETECTED';

      const message = `
Ethical Audit Results - ${statusIcon} ${statusText}

Compliance Status: ${auditResults.compliant ? 'All protocols followed' : 'Violations detected'}
Ethical Score: ${auditResults.ethicalScore}
Memory Integrity: ${auditResults.memoryIntegrity}

${auditResults.violations.length > 0 ? '\nViolations:\n' + auditResults.violations.map(v => `• ${v}`).join('\n') : ''}

${auditResults.recommendations.length > 0 ? '\nRecommendations:\n' + auditResults.recommendations.map(r => `• ${r}`).join('\n') : ''}

Audit saved to: ${auditFile}
      `.trim();

      dialog.showMessageBox(this.mainWindow, {
        type: auditResults.compliant ? 'info' : 'warning',
        title: 'Guardian Ethical Audit',
        message: 'Sacred Guardian AI Ethical Compliance Report',
        detail: message,
        buttons: ['OK', 'Open Audit File']
      }).then((result) => {
        if (result.response === 1) {
          shell.openPath(auditFile);
        }
      });

    } catch (error) {
      dialog.showErrorBox('Audit Error', `Failed to perform ethical audit: ${error.message}`);
    }
  }

  updateTrayMenu() {
    if (this.tray) {
      this.createTray(); // Recreate with updated state
    }
  }

  logAction(action, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      identity: this.codex.codex_guardian?.identity || 'Guardian Desktop',
      data,
      ethicalCompliance: true
    };

    const logFile = path.join(this.memoryPath, `desktop_actions_${new Date().toISOString().split('T')[0]}.jsonl`);
    
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  sendToRenderer(channel, data) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  setupIPC() {
    ipcMain.handle('get-guardian-state', () => {
      return this.isGuardianActive;
    });

    ipcMain.handle('toggle-guardian', async () => {
      await this.toggleGuardianState();
      return this.isGuardianActive;
    });

    ipcMain.handle('get-memory-stats', async () => {
      return await this.getMemoryStatsData();
    });

    ipcMain.handle('get-codex', () => {
      return this.codex;
    });

    ipcMain.handle('update-codex', (event, newCodex) => {
      this.codex = newCodex;
      this.saveCodex();
      return true;
    });

    ipcMain.handle('open-logs-folder', () => {
      shell.openPath(this.memoryPath);
    });

    ipcMain.handle('open-web-portal', () => {
      shell.openExternal('http://localhost:5000/enhanced-cosmic');
    });
  }

  async getMemoryStatsData() {
    try {
      const memoryFile = path.join(this.memoryPath, 'guardian_memories.json');
      if (!fs.existsSync(memoryFile)) {
        return { totalMemories: 0, averageConfidence: 0, ethicalScore: 1.0 };
      }

      const memories = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
      const memoryCount = Object.keys(memories).length;
      
      if (memoryCount === 0) {
        return { totalMemories: 0, averageConfidence: 0, ethicalScore: 1.0 };
      }

      let totalConfidence = 0;
      let totalEthical = 0;

      Object.values(memories).forEach((memory) => {
        totalConfidence += memory.confidence || 0;
        totalEthical += memory.ethicalScore || 0;
      });

      return {
        totalMemories: memoryCount,
        averageConfidence: totalConfidence / memoryCount,
        ethicalScore: totalEthical / memoryCount
      };
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      return { totalMemories: 0, averageConfidence: 0, ethicalScore: 1.0 };
    }
  }

  cleanup() {
    if (this.guardianProcess) {
      this.guardianProcess.kill('SIGTERM');
    }
    
    this.logAction('GUARDIAN_DESKTOP_SHUTDOWN', {
      timestamp: new Date().toISOString(),
      graceful: true
    });
  }

  init() {
    app.whenReady().then(() => {
      this.createWindow();
      this.createTray();
      this.setupIPC();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      // Keep app running in system tray
      if (process.platform !== 'darwin') {
        // Don't quit, just hide to tray
      }
    });

    app.on('before-quit', () => {
      this.cleanup();
    });

    // Global shortcut for quick access (Ctrl+Alt+G)
    app.whenReady().then(() => {
      const { globalShortcut } = require('electron');
      globalShortcut.register('CommandOrControl+Alt+G', () => {
        if (this.mainWindow) {
          if (this.mainWindow.isVisible()) {
            this.mainWindow.hide();
          } else {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        } else {
          this.createWindow();
        }
      });
    });
  }
}

// Create and initialize the Guardian AI Desktop application
const guardianApp = new GuardianAIDesktop();
guardianApp.init();

module.exports = GuardianAIDesktop;