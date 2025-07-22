const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // Tool management
    launchTool: (tool) => ipcRenderer.invoke('launch-tool', tool),
    getToolsManifest: () => ipcRenderer.invoke('get-tools-manifest'),
    
    // Admin functions
    adminLogin: (credentials) => ipcRenderer.invoke('admin-login', credentials),
    adminAddRepo: (repoData) => ipcRenderer.invoke('admin-add-repo', repoData),
    adminDeleteTool: (githubUrl) => ipcRenderer.invoke('admin-delete-tool', githubUrl),
    
    // Sacred integrations
    openGuardianAI: () => ipcRenderer.invoke('open-guardian-ai'),
    openSacredVisionForge: () => ipcRenderer.invoke('open-sacred-vision-forge'),
});