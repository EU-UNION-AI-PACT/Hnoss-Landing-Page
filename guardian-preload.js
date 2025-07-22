const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Guardian state management
  getGuardianState: () => {
    try {
      return ipcRenderer.invoke('get-guardian-state');
    } catch (error) {
      console.error('Failed to get guardian state:', error);
      return Promise.reject(error);
    }
  },
  
  toggleGuardian: () => {
    try {
      return ipcRenderer.invoke('toggle-guardian');
    } catch (error) {
      console.error('Failed to toggle guardian:', error);
      return Promise.reject(error);
    }
  },
  
  // Memory and system stats
  getMemoryStats: () => {
    try {
      return ipcRenderer.invoke('get-memory-stats');
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      return Promise.reject(error);
    }
  },
  
  // Codex management
  getCodex: () => {
    try {
      return ipcRenderer.invoke('get-codex');
    } catch (error) {
      console.error('Failed to get codex:', error);
      return Promise.reject(error);
    }
  },
  
  updateCodex: (codex) => {
    try {
      if (!codex) {
        throw new Error('Codex data is required');
      }
      return ipcRenderer.invoke('update-codex', codex);
    } catch (error) {
      console.error('Failed to update codex:', error);
      return Promise.reject(error);
    }
  },
  
  // File system operations
  openLogsFolder: () => {
    try {
      return ipcRenderer.invoke('open-logs-folder');
    } catch (error) {
      console.error('Failed to open logs folder:', error);
      return Promise.reject(error);
    }
  },
  
  openWebPortal: () => {
    try {
      return ipcRenderer.invoke('open-web-portal');
    } catch (error) {
      console.error('Failed to open web portal:', error);
      return Promise.reject(error);
    }
  },
  
  // Event listeners with validation
  onGuardianStateChanged: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    const wrappedCallback = (event, ...args) => {
      try {
        callback(event, ...args);
      } catch (error) {
        console.error('Guardian state change callback error:', error);
      }
    };
    
    ipcRenderer.on('guardian-state-changed', wrappedCallback);
    return () => ipcRenderer.removeListener('guardian-state-changed', wrappedCallback);
  },
  
  onGuardianLog: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    const wrappedCallback = (event, ...args) => {
      try {
        callback(event, ...args);
      } catch (error) {
        console.error('Guardian log callback error:', error);
      }
    };
    
    ipcRenderer.on('guardian-log', wrappedCallback);
    return () => ipcRenderer.removeListener('guardian-log', wrappedCallback);
  },
  
  // Improved listener management
  removeAllListeners: (channel) => {
    if (!channel || typeof channel !== 'string') {
      console.warn('Invalid channel provided to removeAllListeners');
      return;
    }
    
    try {
      ipcRenderer.removeAllListeners(channel);
    } catch (error) {
      console.error(`Failed to remove listeners for channel ${channel}:`, error);
    }
  },
  
  // Health check
  ping: () => {
    try {
      return ipcRenderer.invoke('ping');
    } catch (error) {
      console.error('Failed to ping main process:', error);
      return Promise.reject(error);
    }
  }
});

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error in renderer:', event.error || event);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in renderer:', event.reason || event);
  event.preventDefault(); // Prevent default handling
});