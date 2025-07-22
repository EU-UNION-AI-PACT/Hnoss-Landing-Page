// Sacred GitHub ToolHub - Renderer Process
// Manages UI interactions and Sacred Tool operations

let isAdminAuthenticated = false;
let toolsManifest = { tools: [] };

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSacredHub();
    setupEventListeners();
    createSacredParticles();
    loadAndRenderTools();
});

async function initializeSacredHub() {
    try {
        // Load tools manifest
        toolsManifest = await window.api.getToolsManifest();
        await renderToolsGrid();
        
        // Setup admin portal
        setupAdminPortal();
        
        // Check system status
        await checkSystemStatus();
        
        showStatusMessage('Sacred ToolHub initialisiert ✨', 'success');
    } catch (error) {
        console.error('Initialization error:', error);
        showStatusMessage('Fehler beim Initialisieren des Sacred Hubs', 'error');
    }
}

function setupEventListeners() {
    // Sacred Action Bar
    document.getElementById('awaken-guardian').addEventListener('click', awakenGuardianAI);
    document.getElementById('open-forge').addEventListener('click', openSacredVisionForge);
    document.getElementById('admin-toggle').addEventListener('click', toggleAdminPortal);
    
    // Admin Portal
    document.getElementById('admin-login-btn').addEventListener('click', handleAdminLogin);
    document.getElementById('add-repo-btn').addEventListener('click', addRepository);
    document.getElementById('delete-tool-btn').addEventListener('click', deleteTool);
    document.getElementById('refresh-tools-btn').addEventListener('click', refreshTools);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(event) {
    // Ctrl+Alt+A for Admin Portal
    if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        toggleAdminPortal();
    }
    
    // Ctrl+Alt+G for Guardian AI
    if (event.ctrlKey && event.altKey && event.key === 'g') {
        event.preventDefault();
        awakenGuardianAI();
    }
    
    // Ctrl+Alt+F for Sacred Vision Forge
    if (event.ctrlKey && event.altKey && event.key === 'f') {
        event.preventDefault();
        openSacredVisionForge();
    }
}

async function loadAndRenderTools() {
    try {
        toolsManifest = await window.api.getToolsManifest();
        await renderToolsGrid();
        updateAdminToolsList();
    } catch (error) {
        console.error('Error loading tools:', error);
        showStatusMessage('Fehler beim Laden der Sacred Tools', 'error');
    }
}

async function renderToolsGrid() {
    const container = document.getElementById('tools-container');
    container.innerHTML = '';
    
    if (!toolsManifest.tools || toolsManifest.tools.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="sacred-card p-8 rounded-xl">
                    <h3 class="text-xl font-bold mb-4">🌌 Sacred Hub awaits...</h3>
                    <p class="text-gray-400 mb-6">Keine Sacred Tools gefunden. Nutze das Admin Portal um Repository hinzuzufügen.</p>
                    <button onclick="toggleAdminPortal()" class="sacred-button px-6 py-2 rounded-lg text-white font-medium">
                        ⚡ Admin Portal öffnen
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Group tools by category
    const groupedTools = groupToolsByCategory(toolsManifest.tools);
    
    Object.entries(groupedTools).forEach(([category, tools]) => {
        // Category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'col-span-full mb-4';
        categoryHeader.innerHTML = `
            <div class="flex items-center space-x-3 mb-4">
                <div class="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
                <h2 class="text-xl font-bold text-purple-300 px-4">${category}</h2>
                <div class="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
            </div>
        `;
        container.appendChild(categoryHeader);
        
        // Tools in category
        tools.forEach(tool => {
            const toolCard = createToolCard(tool);
            container.appendChild(toolCard);
        });
    });
}

function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'sacred-card p-6 rounded-xl cursor-pointer group';
    card.style.borderColor = tool.chakra_color + '30';
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
                <div class="rune-spin text-2xl" style="color: ${tool.chakra_color}">${tool.rune_id}</div>
                <div>
                    <h3 class="font-bold text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-500 transition-all">
                        ${tool.name}
                    </h3>
                    <p class="text-sm text-gray-400">${tool.category}</p>
                </div>
            </div>
            <div class="chakra-glow w-3 h-3 rounded-full" style="background-color: ${tool.chakra_color}"></div>
        </div>
        
        <p class="text-gray-300 text-sm mb-4 line-clamp-2">${tool.description}</p>
        
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <span class="text-xs px-2 py-1 rounded-full bg-black/30 text-gray-400">${getTypeIcon(tool.type)} ${tool.type}</span>
                ${tool.github_url ? `<span class="text-xs text-blue-400">📡</span>` : ''}
            </div>
            <button class="sacred-button px-4 py-2 rounded-lg text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Launch ⚡
            </button>
        </div>
    `;
    
    card.addEventListener('click', () => launchTool(tool));
    
    return card;
}

function getTypeIcon(type) {
    const icons = {
        'url': '🌐',
        'cli': '⌨️',
        'podman': '🐳',
        'electron': '⚡',
        'guardian_ai': '🧠'
    };
    return icons[type] || '🔧';
}

function groupToolsByCategory(tools) {
    return tools.reduce((groups, tool) => {
        const category = tool.category || 'Unkategorisiert';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(tool);
        return groups;
    }, {});
}

async function launchTool(tool) {
    try {
        showStatusMessage(`Starte ${tool.name}...`, 'info');
        const result = await window.api.launchTool(tool);
        
        if (result.success) {
            showStatusMessage(result.message, 'success');
        } else {
            showStatusMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Tool launch error:', error);
        showStatusMessage(`Fehler beim Starten von ${tool.name}`, 'error');
    }
}

async function awakenGuardianAI() {
    try {
        showStatusMessage('Guardian AI wird erweckt...', 'info');
        const result = await window.api.openGuardianAI();
        
        if (result.success) {
            showStatusMessage('Guardian AI erfolgreich erweckt 🧠', 'success');
            updateSystemStatus('guardian', true);
        } else {
            showStatusMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Guardian AI error:', error);
        showStatusMessage('Fehler beim Erwecken von Guardian AI', 'error');
    }
}

async function openSacredVisionForge() {
    try {
        showStatusMessage('Sacred Vision Forge wird geöffnet...', 'info');
        const result = await window.api.openSacredVisionForge();
        
        if (result.success) {
            showStatusMessage('Sacred Vision Forge Portal geöffnet 🌌', 'success');
        } else {
            showStatusMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Sacred Vision Forge error:', error);
        showStatusMessage('Fehler beim Öffnen von Sacred Vision Forge', 'error');
    }
}

// Admin Portal Functions
function toggleAdminPortal() {
    const portal = document.getElementById('admin-portal');
    portal.classList.toggle('hidden');
    
    if (!portal.classList.contains('hidden')) {
        // Reset admin state when opening
        if (!isAdminAuthenticated) {
            showAdminLogin();
        }
    }
}

function showAdminLogin() {
    document.getElementById('admin-login-form').classList.remove('hidden');
    document.getElementById('admin-controls').classList.add('hidden');
    isAdminAuthenticated = false;
}

async function handleAdminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (!username || !password) {
        showStatusMessage('Bitte Sacred Username und Key eingeben', 'error');
        return;
    }
    
    try {
        const result = await window.api.adminLogin({ username, password });
        
        if (result.success) {
            isAdminAuthenticated = true;
            document.getElementById('admin-login-form').classList.add('hidden');
            document.getElementById('admin-controls').classList.remove('hidden');
            showStatusMessage(result.message, 'success');
            updateAdminToolsList();
        } else {
            showStatusMessage(result.message, 'error');
            clearAdminForm();
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showStatusMessage('Fehler beim Sacred Login', 'error');
    }
}

function clearAdminForm() {
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

async function addRepository() {
    if (!isAdminAuthenticated) {
        showStatusMessage('Admin-Authentifizierung erforderlich', 'error');
        return;
    }
    
    const repoUrl = document.getElementById('repo-url').value;
    const category = document.getElementById('repo-category').value;
    const type = document.getElementById('repo-type').value;
    const description = document.getElementById('repo-description').value;
    
    if (!repoUrl) {
        showStatusMessage('Repository URL erforderlich', 'error');
        return;
    }
    
    try {
        showStatusMessage('Repository wird analysiert und hinzugefügt...', 'info');
        const result = await window.api.adminAddRepo({
            repoUrl,
            category,
            type,
            description
        });
        
        if (result.success) {
            showStatusMessage(result.message, 'success');
            clearRepoForm();
            await loadAndRenderTools();
        } else {
            showStatusMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Add repository error:', error);
        showStatusMessage('Fehler beim Hinzufügen des Repository', 'error');
    }
}

function clearRepoForm() {
    document.getElementById('repo-url').value = '';
    document.getElementById('repo-category').value = '';
    document.getElementById('repo-type').value = '';
    document.getElementById('repo-description').value = '';
}

async function deleteTool() {
    if (!isAdminAuthenticated) {
        showStatusMessage('Admin-Authentifizierung erforderlich', 'error');
        return;
    }
    
    const selectElement = document.getElementById('delete-tool-select');
    const githubUrl = selectElement.value;
    
    if (!githubUrl) {
        showStatusMessage('Bitte Tool zum Entfernen auswählen', 'error');
        return;
    }
    
    try {
        const result = await window.api.adminDeleteTool(githubUrl);
        
        if (result.success) {
            showStatusMessage(result.message, 'success');
            await loadAndRenderTools();
        } else {
            showStatusMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Delete tool error:', error);
        showStatusMessage('Fehler beim Entfernen des Tools', 'error');
    }
}

async function refreshTools() {
    showStatusMessage('Sacred Manifest wird aktualisiert...', 'info');
    await loadAndRenderTools();
    showStatusMessage('Sacred Tools erfolgreich aktualisiert ✨', 'success');
}

function updateAdminToolsList() {
    const selectElement = document.getElementById('delete-tool-select');
    selectElement.innerHTML = '<option value="">Tool zum Entfernen wählen...</option>';
    
    if (toolsManifest.tools) {
        toolsManifest.tools.forEach(tool => {
            const option = document.createElement('option');
            option.value = tool.github_url;
            option.textContent = `${tool.name} (${tool.category})`;
            selectElement.appendChild(option);
        });
    }
}

async function checkSystemStatus() {
    // Check if Guardian AI is running (simplified check)
    try {
        // This would be a real check in production
        updateSystemStatus('guardian', false);
        updateSystemStatus('forge', true);
    } catch (error) {
        console.error('System status check error:', error);
    }
}

function updateSystemStatus(system, isActive) {
    const statusElement = document.getElementById(`${system}-status`);
    if (statusElement) {
        const dot = statusElement.querySelector('.status-dot');
        const text = statusElement.querySelector('span');
        
        if (isActive) {
            dot.className = 'status-dot status-active';
            if (system === 'guardian') {
                text.textContent = 'Guardian AI Active';
            }
        } else {
            dot.className = 'status-dot status-inactive';
            if (system === 'guardian') {
                text.textContent = 'Guardian AI Dormant';
            }
        }
    }
}

function showStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `fixed bottom-6 right-6 p-4 rounded-lg font-medium z-50 ${getStatusClass(type)}`;
    statusElement.classList.remove('hidden');
    
    setTimeout(() => {
        statusElement.classList.add('hidden');
    }, 3000);
}

function getStatusClass(type) {
    const classes = {
        'success': 'bg-green-600 text-white',
        'error': 'bg-red-600 text-white',
        'info': 'bg-blue-600 text-white',
        'warning': 'bg-yellow-600 text-black'
    };
    return classes[type] || classes.info;
}

function createSacredParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (8 + Math.random() * 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Setup admin portal
function setupAdminPortal() {
    // Hide admin controls initially
    document.getElementById('admin-controls').classList.add('hidden');
}

// Global functions for HTML onclick handlers
window.toggleAdminPortal = toggleAdminPortal;
window.awakenGuardianAI = awakenGuardianAI;
window.openSacredVisionForge = openSacredVisionForge;