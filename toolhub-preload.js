// toolhub-preload.js - Secure bridge between main and renderer processes
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    launchTool: (tool) => ipcRenderer.invoke('launch-tool', tool),
    adminLogin: (credentials) => ipcRenderer.invoke('admin-login', credentials),
    adminAddRepo: (repoData) => ipcRenderer.invoke('admin-add-repo', repoData),
    getToolsManifest: () => ipcRenderer.invoke('get-tools-manifest'),
    adminDeleteTool: (githubUrl) => ipcRenderer.invoke('admin-delete-tool', githubUrl),
});