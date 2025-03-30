// Main application logic for LLM Agent Playground
class LLMPlayground {
    constructor() {
        this.history = [];
        this.currentSession = null;
        this.isStreaming = false;
        this.streamingChunks = [];
        this.init();
    }

    init() {
        // Initialize only if on playground page
        if (!document.getElementById('prompt-editor')) return;

        this.loadHistory();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Run button
        document.getElementById('run-btn').addEventListener('click', () => this.runPrompt());

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => this.clearEditor());

        // Copy output button
        document.getElementById('copy-output').addEventListener('click', () => this.copyOutput());

        // Save output button
        document.getElementById('save-output').addEventListener('click', () => this.saveToHistory());

        // Clear history button
        document.getElementById('clear-history')?.addEventListener('click', () => this.clearHistory());

        // Run comparison button
        document.getElementById('run-comparison')?.addEventListener('click', () => this.runComparison());

        // History item clicks
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    this.loadHistoryItem(item.dataset.id);
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.runPrompt();
            }
        });
    }

    async runPrompt() {
        const prompt = document.getElementById('prompt-editor').value.trim();
        if (!prompt) {
            this.showError('Please enter a prompt');
            return;
        }

        const model = document.getElementById('model-selector').value;
        const apiKey = configManager.getApiKey(model);
        
        if (!apiKey) {
            this.showError(`Please enter your ${model} API key in Settings`);
            return;
        }

        const temperature = parseFloat(document.getElementById('temperature').value);
        const maxTokens = parseInt(document.getElementById('max-tokens').value);
        const systemPrompt = document.getElementById('system-prompt')?.value || 'default';

        this.startLoading();
        this.currentSession = {
            id: Date.now(),
            timestamp: new Date(),
            model,
            prompt,
            response: '',
            parameters: { temperature, maxTokens, systemPrompt }
        };

        try {
            let response;
            switch (model) {
                case 'openai':
                    response = await this.callOpenAI(apiKey, prompt, temperature, maxTokens, systemPrompt);
                    break;
                case 'claude':
                    response = await this.callClaude(apiKey, prompt, temperature, maxTokens);
                    break;
                case 'gemini':
                    response = await this.callGemini(apiKey, prompt, temperature, maxTokens);
                    break;
                default:
                    throw new Error('Unsupported model');
            }

            this.currentSession.response = response;
            this.updateOutput(response);
            if (configManager.shouldAutoSave()) {
                this.saveToHistory();
            }
        } catch (error) {
            this.showError(error.message);
            console.error('API Error:', error);
        } finally {
            this.stopLoading();
        }
    }

    async callOpenAI(apiKey, prompt, temperature, maxTokens, systemPrompt) {
        // Input validation
        if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('Invalid OpenAI API key format');
        }
        if (temperature < 0 || temperature > 2) {
            throw new Error('Temperature must be between 0 and 2');
        }
        if (maxTokens < 1 || maxTokens > 4000) {
            throw new Error('Max tokens must be between 1 and 4000');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const messages = [
                { role: 'system', content: this.getSystemPromptContent(systemPrompt) },
                { role: 'user', content: prompt }
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    stream: false
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.choices?.[0]?.message?.content) {
                throw new Error('No content in OpenAI response');
            }
            return data.choices[0].message.content;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('OpenAI API request timed out');
            }
            throw error;
        }
    }

    async callClaude(apiKey, prompt, temperature, maxTokens) {
        // Input validation
        if (!apiKey || !apiKey.startsWith('sk-ant-')) {
            throw new Error('Invalid Claude API key format');
        }
        if (temperature < 0 || temperature > 1) {
            throw new Error('Temperature must be between 0 and 1');
        }
        if (maxTokens < 1 || maxTokens > 4096) {
            throw new Error('Max tokens must be between 1 and 4096');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-opus-20240229',
                    max_tokens: maxTokens,
                    temperature,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `Claude API error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.content?.[0]?.text) {
                throw new Error('No content in Claude response');
            }
            return data.content[0].text;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Claude API request timed out');
            }
            throw error;
        }
    }

    async callGemini(apiKey, prompt, temperature, maxTokens) {
        // Input validation
        if (!apiKey || !apiKey.startsWith('AIza')) {
            throw new Error('Invalid Gemini API key format');
        }
        if (temperature < 0 || temperature > 1) {
            throw new Error('Temperature must be between 0 and 1');
        }
        if (maxTokens < 1 || maxTokens > 2048) {
            throw new Error('Max tokens must be between 1 and 2048');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature,
                        maxOutputTokens: maxTokens
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('No content in Gemini response');
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Gemini API request timed out');
            }
            throw error;
        }
    }

    getSystemPromptContent(type) {
        const systemPrompts = {
            default: 'You are a helpful AI assistant.',
            creative: 'You are a creative writer. Respond with imaginative and engaging content.',
            technical: 'You are a technical expert. Provide detailed, accurate information with references when possible.',
            concise: 'You are a concise assistant. Provide brief, to-the-point answers without elaboration unless asked.'
        };
        
        if (!systemPrompts[type]) {
            console.warn(`Unknown system prompt type: ${type}, using default`);
            return systemPrompts.default;
        }
        return systemPrompts[type];
    }

    startLoading() {
        this.isStreaming = true;
        document.getElementById('run-btn').disabled = true;
        document.getElementById('run-btn').innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i> Running';
        document.getElementById('output-display').innerHTML = '<div class="output-stream flex items-center text-gray-500 dark:text-gray-400"><i class="fas fa-circle-notch fa-spin mr-2"></i><span>Generating response...</span></div>';
    }

    stopLoading() {
        this.isStreaming = false;
        document.getElementById('run-btn').disabled = false;
        document.getElementById('run-btn').innerHTML = '<i class="fas fa-play mr-1"></i> Run';
    }

    updateOutput(content) {
        const outputDiv = document.getElementById('output-display');
        // Format the content with proper line breaks and code blocks
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/```(\w*)([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto my-2"><code>$2</code></pre>');
        
        outputDiv.innerHTML = formattedContent;
        
        // Highlight code blocks
        outputDiv.querySelectorAll('pre code').forEach(block => {
            // In a real app, you would use a syntax highlighting library here
            block.classList.add('code-block');
        });
    }

    clearEditor() {
        document.getElementById('prompt-editor').value = '';
        document.getElementById('output-display').innerHTML = '<div class="output-stream flex items-center text-gray-500 dark:text-gray-400"><i class="fas fa-circle-notch fa-spin mr-2"></i><span>Waiting for input... Run a prompt to see results</span></div>';
    }

    copyOutput() {
        const outputText = this.currentSession?.response || '';
        if (!outputText) {
            this.showError('No output to copy');
            return;
        }

        navigator.clipboard.writeText(outputText)
            .then(() => this.showToast('Output copied to clipboard!'))
            .catch(err => this.showError('Failed to copy output'));
    }

    saveToHistory() {
        if (!this.currentSession) return;

        // Check if this session is already in history
        const existingIndex = this.history.findIndex(item => item.id === this.currentSession.id);
        if (existingIndex >= 0) {
            this.history[existingIndex] = this.currentSession;
        } else {
            this.history.unshift(this.currentSession);
        }

        // Keep only the last 50 items
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        localStorage.setItem('llmPlaygroundHistory', JSON.stringify(this.history));
        this.updateHistoryUI();
        this.showToast('Saved to history');
    }

    loadHistory() {
        this.history = JSON.parse(localStorage.getItem('llmPlaygroundHistory')) || [];
        this.updateHistoryUI();
    }

    updateHistoryUI() {
        const historyContainer = document.querySelector('.history-container');
        if (!historyContainer) return;

        historyContainer.innerHTML = this.history.map(item => `
            <div class="p-4 history-item cursor-pointer" data-id="${item.id}">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800 dark:text-white truncate">${item.prompt.substring(0, 50)}${item.prompt.length > 50 ? '...' : ''}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${this.getModelBadgeClass(item.model)}">${this.getModelName(item.model)}</span>
                </div>
            </div>
        `).join('');

        // Reattach event listeners
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    this.loadHistoryItem(item.dataset.id);
                }
            });
        });
    }

    loadHistoryItem(id) {
        const item = this.history.find(item => item.id === parseInt(id));
        if (!item) return;

        document.getElementById('prompt-editor').value = item.prompt;
        document.getElementById('model-selector').value = item.model;
        document.getElementById('temperature').value = item.parameters.temperature;
        document.getElementById('max-tokens').value = item.parameters.maxTokens;
        if (document.getElementById('system-prompt')) {
            document.getElementById('system-prompt').value = item.parameters.systemPrompt;
        }

        this.currentSession = item;
        this.updateOutput(item.response);
        this.showToast('Loaded from history');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            this.history = [];
            localStorage.removeItem('llmPlaygroundHistory');
            this.updateHistoryUI();
            this.showToast('History cleared');
        }
    }

    async runComparison() {
        const prompt = document.getElementById('prompt-editor').value.trim();
        if (!prompt) {
            this.showError('Please enter a prompt to compare');
            return;
        }

        const modelsToCompare = [];
        if (document.querySelector('input[value="claude"]').checked) modelsToCompare.push('claude');
        if (document.querySelector('input[value="gemini"]').checked) modelsToCompare.push('gemini');
        if (document.querySelector('input[value="openai"]').checked) modelsToCompare.push('openai');

        if (modelsToCompare.length < 2) {
            this.showError('Select at least 2 models to compare');
            return;
        }

        this.startLoading();
        try {
            const results = await Promise.all(modelsToCompare.map(async model => {
                const apiKey = configManager.getApiKey(model);
                if (!apiKey) {
                    return { model, error: `No API key for ${model}` };
                }

                try {
                    let response;
                    switch (model) {
                        case 'openai':
                            response = await this.callOpenAI(apiKey, prompt, 0.7, 1000);
                            break;
                        case 'claude':
                            response = await this.callClaude(apiKey, prompt, 0.7, 1000);
                            break;
                        case 'gemini':
                            response = await this.callGemini(apiKey, prompt, 0.7, 1000);
                            break;
                    }
                    return { model, response };
                } catch (error) {
                    return { model, error: error.message };
                }
            }));

            this.displayComparisonResults(results, prompt);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.stopLoading();
        }
    }

    displayComparisonResults(results, prompt) {
        const outputDiv = document.getElementById('output-display');
        let html = '<div class="space-y-6">';
        
        html += `<h3 class="text-lg font-medium text-gray-800 dark:text-white">Comparison Results for: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"</h3>`;
        
        results.forEach(result => {
            html += `<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div class="px-4 py-3 ${this.getModelBgClass(result.model)} flex justify-between items-center">
                    <h4 class="font-medium text-white">${this.getModelName(result.model)}</h4>
                    <span class="text-xs bg-white/20 px-2 py-1 rounded-full">${new Date().toLocaleTimeString()}</span>
                </div>`;
            
            if (result.error) {
                html += `<div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">${result.error}</div>`;
            } else {
                html += `<div class="p-4">${result.response.replace(/\n/g, '<br>')}</div>`;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
        outputDiv.innerHTML = html;
    }

    getModelName(model) {
        const names = {
            openai: 'OpenAI',
            claude: 'Claude',
            gemini: 'Gemini'
        };
        return names[model] || model;
    }

    getModelBadgeClass(model) {
        const classes = {
            openai: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            claude: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            gemini: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
        return classes[model] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }

    getModelBgClass(model) {
        const classes = {
            openai: 'bg-blue-600',
            claude: 'bg-purple-600',
            gemini: 'bg-green-600'
        };
        return classes[model] || 'bg-gray-600';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showToast(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove any existing notifications first
        document.querySelectorAll('.llm-notification').forEach(el => el.remove());

        const colors = {
            error: 'bg-red-500',
            success: 'bg-green-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 ${colors[type] || 'bg-gray-500'} text-white px-4 py-2 rounded-md shadow-lg llm-notification`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize the playground when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.llmPlayground = new LLMPlayground();
});

// Export for Node.js environment (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LLMPlayground;
}