// toolhub-renderer.js - Sacred GitHub ToolHub Frontend Logic

// DOM Elements
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const loginSection = document.getElementById('login-section');
const adminControls = document.getElementById('admin-controls');
const loginBtn = document.getElementById('login-btn');
const loginStatus = document.getElementById('login-status');
const addRepoBtn = document.getElementById('add-repo-btn');
const adminStatus = document.getElementById('admin-status');
const adminCommandInput = document.getElementById('admin-command-input');
const executeCommandBtn = document.getElementById('execute-command-btn');
const toolbarGrid = document.getElementById('toolbar-grid');
const statusMessage = document.getElementById('status-message');

// Chakra colors for dynamic styling
const chakraColors = {
    'AI Coding': '#8b5cf6',
    'Code Repository': '#6366f1', 
    'Command Line': '#10b981',
    'Container': '#06b6d4',
    'Web Tools': '#f59e0b',
    'Design': '#ec4899',
    'Database': '#84cc16',
    'DevOps': '#ef4444',
    'Default': '#64748b'
};

// Main function: Load and render tools
async function loadAndRenderTools() {
    toolbarGrid.innerHTML = '';
    statusMessage.innerText = 'Lade deine digitalen Werkzeuge...';
    
    try {
        const manifestData = await window.api.getToolsManifest();
        const tools = manifestData.tools;

        if (!tools || tools.length === 0) {
            toolbarGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🌟</div>
                    <h3 class="text-xl text-gray-400 mb-2">Dein Werkzeugkasten ist noch leer</h3>
                    <p class="text-gray-500">Füge dein erstes Repository über das Admin-Portal hinzu</p>
                    <p class="text-sm text-gray-600 mt-2">Drücke Strg+Alt+A zum Starten</p>
                </div>
            `;
            statusMessage.innerText = "Bereit für deine ersten Tools.";
            return;
        }

        // Group tools by categories
        const toolsByCategory = tools.reduce((acc, tool) => {
            const category = tool.category || 'Unkategorisiert';
            if (!acc[category]) acc[category] = [];
            acc[category].push(tool);
            return acc;
        }, {});

        // Render categories
        Object.entries(toolsByCategory).forEach(([category, categoryTools]) => {
            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'col-span-full mb-4';
            categoryHeader.innerHTML = `
                <h2 class="text-2xl font-bold text-center mb-2" style="color: ${chakraColors[category] || chakraColors.Default}">
                    ${getCategoryIcon(category)} ${category}
                </h2>
                <div class="w-24 h-1 mx-auto rounded-full" style="background: linear-gradient(90deg, ${chakraColors[category] || chakraColors.Default}, transparent)"></div>
            `;
            toolbarGrid.appendChild(categoryHeader);

            // Category tools
            categoryTools.forEach(tool => {
                const toolCard = createToolCard(tool);
                toolbarGrid.appendChild(toolCard);
            });
        });

        statusMessage.innerHTML = `
            <span class="text-cyan-400">✨ ${tools.length} Werkzeuge bereit ✨</span>
            <span class="text-gray-500 ml-4">Wähle ein Tool um zu beginnen</span>
        `;

    } catch (error) {
        console.error('Fehler beim Laden der Tools:', error);
        statusMessage.innerText = 'Fehler beim Laden der Tools. Prüfe die Konfiguration.';
        toolbarGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-red-400">
                <div class="text-4xl mb-2">⚠️</div>
                <p>Fehler beim Laden der Werkzeuge</p>
            </div>
        `;
    }
}

// Create tool card
function createToolCard(tool) {
    const toolCard = document.createElement('div');
    const chakraColor = tool.chakra_color || chakraColors[tool.category] || chakraColors.Default;
    const rune = tool.rune_id || getTypeIcon(tool.type);
    
    toolCard.className = 'tool-card cosmic-card group cursor-pointer transform transition-all duration-300 hover:scale-105';
    toolCard.style.borderColor = chakraColor;
    
    toolCard.innerHTML = `
        <div class="tool-header">
            <div class="tool-icon" style="color: ${chakraColor}">
                ${rune}
            </div>
            <div class="tool-badge" style="background: ${chakraColor}20; color: ${chakraColor}">
                ${tool.type.toUpperCase()}
            </div>
        </div>
        <h3 class="tool-title">${tool.name}</h3>
        <p class="tool-description">${tool.description}</p>
        <div class="tool-footer">
            <span class="tool-category" style="color: ${chakraColor}">
                ${tool.category}
            </span>
            <div class="launch-indicator" style="color: ${chakraColor}">
                <span class="text-xs">Klicken zum Starten</span>
                <div class="w-2 h-2 rounded-full ml-2" style="background: ${chakraColor}"></div>
            </div>
        </div>
    `;

    // Launch event
    toolCard.addEventListener('click', async () => {
        toolCard.classList.add('launching');
        statusMessage.innerHTML = `
            <span class="cosmic-pulse" style="color: ${chakraColor}">
                🚀 Starte ${tool.name}...
            </span>
        `;
        
        try {
            const result = await window.api.launchTool(tool);
            if (result.success) {
                statusMessage.innerHTML = `
                    <span style="color: ${chakraColor}">✅ ${tool.name} erfolgreich gestartet!</span>
                `;
                toolCard.classList.add('launched');
                setTimeout(() => {
                    toolCard.classList.remove('launched');
                }, 2000);
            } else {
                statusMessage.innerHTML = `
                    <span class="text-red-400">❌ Fehler bei ${tool.name}: ${result.message}</span>
                `;
            }
        } catch (error) {
            statusMessage.innerHTML = `
                <span class="text-red-400">❌ Unerwarteter Fehler: ${error.message}</span>
            `;
        } finally {
            toolCard.classList.remove('launching');
        }
    });

    return toolCard;
}

// Icon helper functions
function getTypeIcon(type) {
    const icons = {
        'url': '🌐',
        'cli': '⌨️',
        'podman': '🐳',
        'electron': '⚡',
        'default': '🛠️'
    };
    return icons[type] || icons.default;
}

function getCategoryIcon(category) {
    const icons = {
        'AI Coding': '🤖',
        'Code Repository': '📁',
        'Command Line': '💻',
        'Container': '🐳',
        'Web Tools': '🌐',
        'Design': '🎨',
        'Database': '🗄️',
        'DevOps': '🔧',
        'Default': '⚙️'
    };
    return icons[category] || icons.Default;
}

// Admin modal event listeners
openAdminBtn.addEventListener('click', openAdminModal);
closeAdminBtn.addEventListener('click', closeAdminModal);

function openAdminModal() {
    adminModal.classList.remove('hidden');
    loginSection.classList.remove('hidden');
    adminControls.classList.add('hidden');
    clearAdminMessages();
}

function closeAdminModal() {
    adminModal.classList.add('hidden');
    clearAdminMessages();
}

function clearAdminMessages() {
    loginStatus.innerText = '';
    adminStatus.innerText = '';
}

// Login logic
loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (!username || !password) {
        loginStatus.innerText = 'Bitte fülle alle Felder aus.';
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.innerText = '🔮 Authentifiziere...';
    
    try {
        const result = await window.api.adminLogin({ username, password });
        if (result.success) {
            loginSection.classList.add('hidden');
            adminControls.classList.remove('hidden');
            setAdminStatus(result.message, 'success');
        } else {
            loginStatus.innerText = result.message;
        }
    } catch (error) {
        loginStatus.innerText = 'Fehler bei der Authentifizierung.';
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerText = '🌟 Eintreten in das Portal 🌟';
    }
});

// Add repository
addRepoBtn.addEventListener('click', async () => {
    const repoData = {
        repoUrl: document.getElementById('repo-url').value,
        category: document.getElementById('repo-category').value,
        type: document.getElementById('repo-type').value,
        description: document.getElementById('repo-description').value,
        podmanImage: document.getElementById('repo-podman-image').value,
        startCommand: document.getElementById('repo-start-command').value
    };

    if (!repoData.repoUrl) {
        setAdminStatus('Repository URL ist erforderlich.', 'error');
        return;
    }

    addRepoBtn.disabled = true;
    addRepoBtn.innerText = '✨ Manifestiere...';
    setAdminStatus('Füge Repository hinzu...', 'info');

    try {
        const result = await window.api.adminAddRepo(repoData);
        setAdminStatus(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            await loadAndRenderTools();
            clearRepoForm();
        }
    } catch (error) {
        setAdminStatus(`Fehler: ${error.message}`, 'error');
    } finally {
        addRepoBtn.disabled = false;
        addRepoBtn.innerText = '✨ Repository manifestieren ✨';
    }
});

// Execute commands
executeCommandBtn.addEventListener('click', async () => {
    const command = adminCommandInput.value.trim();
    if (!command) return;

    executeCommandBtn.disabled = true;
    executeCommandBtn.innerText = '🚀 Ausführen...';
    setAdminStatus('', 'info');

    try {
        if (command === '/refresh_tools') {
            setAdminStatus('Lade Tools neu...', 'info');
            await loadAndRenderTools();
            setAdminStatus('Tools erfolgreich neu geladen!', 'success');
        } else if (command.startsWith('/delete_repo ')) {
            const repoUrl = command.replace('/delete_repo ', '').trim();
            if (repoUrl) {
                const result = await window.api.adminDeleteTool(repoUrl);
                setAdminStatus(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    await loadAndRenderTools();
                }
            } else {
                setAdminStatus('Ungültiger Befehl. Verwendung: /delete_repo [URL]', 'error');
            }
        } else {
            setAdminStatus('Unbekannter Befehl. Verwende /refresh_tools oder /delete_repo [URL]', 'error');
        }
    } catch (error) {
        setAdminStatus(`Fehler: ${error.message}`, 'error');
    } finally {
        executeCommandBtn.disabled = false;
        executeCommandBtn.innerText = '🚀 Befehl ausführen 🚀';
        adminCommandInput.value = '';
    }
});

// Admin status helper
function setAdminStatus(message, type) {
    adminStatus.innerText = message;
    adminStatus.className = `text-center text-sm min-h-[20px] status-${type}`;
}

// Clear repository form
function clearRepoForm() {
    document.getElementById('repo-url').value = '';
    document.getElementById('repo-category').value = '';
    document.getElementById('repo-type').value = '';
    document.getElementById('repo-description').value = '';
    document.getElementById('repo-podman-image').value = '';
    document.getElementById('repo-start-command').value = '';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Alt+A to open admin portal
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        openAdminModal();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeAdminModal();
    }
});

// Password field enter key
document.getElementById('admin-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderTools();
    
    // Show welcome message
    setTimeout(() => {
        if (statusMessage.innerText.includes('Lade deine digitalen Werkzeuge')) {
            statusMessage.innerHTML = `
                <span class="text-purple-400">🌌 Sacred GitHub ToolHub bereit!</span>
                <span class="text-gray-500 ml-4">Willkommen, digitaler Architekt</span>
            `;
        }
    }, 1000);
});

// Update main HTML to use correct path
document.querySelector('link[rel="stylesheet"]').href = 'toolhub-styles.css';