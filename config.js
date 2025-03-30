// Configuration and state management for LLM Agent Playground
class ConfigManager {
    constructor() {
        this.loadConfig();
        this.setupTheme();
        this.setupEventListeners();
    }

    loadConfig() {
        // Load saved configuration from localStorage
        this.config = JSON.parse(localStorage.getItem('llmAgentConfig')) || {
            apiKeys: {
                openai: '',
                claude: '',
                gemini: ''
            },
            preferences: {
                darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
                defaultModel: 'openai',
                autoSave: true
            }
        };

        // Apply loaded configuration
        this.applyConfig();
    }

    applyConfig() {
        // Apply theme
        document.documentElement.classList.toggle('dark', this.config.preferences.darkMode);

        // Set default model
        if (document.getElementById('model-selector')) {
            document.getElementById('model-selector').value = this.config.preferences.defaultModel;
        }

        // Set API key fields if they exist
        if (document.getElementById('openai-key')) {
            document.getElementById('openai-key').value = this.config.apiKeys.openai;
        }
        if (document.getElementById('claude-key')) {
            document.getElementById('claude-key').value = this.config.apiKeys.claude;
        }
        if (document.getElementById('gemini-key')) {
            document.getElementById('gemini-key').value = this.config.apiKeys.gemini;
        }

        // Set preference toggles
        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').checked = this.config.preferences.darkMode;
        }
        if (document.getElementById('auto-save')) {
            document.getElementById('auto-save').checked = this.config.preferences.autoSave;
        }
        if (document.getElementById('default-model')) {
            document.getElementById('default-model').value = this.config.preferences.defaultModel;
        }
    }

    setupTheme() {
        // Watch for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!this.config.preferences.darkMode) {
                document.documentElement.classList.toggle('dark', e.matches);
            }
        });
    }

    setupEventListeners() {
        // Theme toggle
        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').addEventListener('change', (e) => {
                this.config.preferences.darkMode = e.target.checked;
                document.documentElement.classList.toggle('dark', e.target.checked);
                this.saveConfig();
            });
        }

        // API key visibility toggles
        document.querySelectorAll('[id$="-key"]').forEach(input => {
            const eyeBtn = input.nextElementSibling;
            if (eyeBtn) {
                eyeBtn.addEventListener('click', () => {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    eyeBtn.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
                });
            }
        });

        // Save settings button
        if (document.getElementById('save-settings')) {
            document.getElementById('save-settings').addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }

    saveSettings() {
        // Get current values from form
        this.config.apiKeys = {
            openai: document.getElementById('openai-key')?.value || this.config.apiKeys.openai,
            claude: document.getElementById('claude-key')?.value || this.config.apiKeys.claude,
            gemini: document.getElementById('gemini-key')?.value || this.config.apiKeys.gemini
        };

        this.config.preferences = {
            darkMode: document.getElementById('theme-toggle')?.checked || this.config.preferences.darkMode,
            defaultModel: document.getElementById('default-model')?.value || this.config.preferences.defaultModel,
            autoSave: document.getElementById('auto-save')?.checked || this.config.preferences.autoSave
        };

        this.saveConfig();
        this.showToast('Settings saved successfully!');
    }

    saveConfig() {
        localStorage.setItem('llmAgentConfig', JSON.stringify(this.config));
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getApiKey(model) {
        return this.config.apiKeys[model];
    }

    getDefaultModel() {
        return this.config.preferences.defaultModel;
    }

    shouldAutoSave() {
        return this.config.preferences.autoSave;
    }
}

// Initialize config manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.configManager = new ConfigManager();
});

// Export for Node.js environment (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}