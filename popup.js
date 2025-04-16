document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('api-key-input');
    const saveButton = document.getElementById('save-api-key');
    const statusMessage = document.getElementById('status-message');

    // Load existing API key if it exists
    chrome.storage.local.get(['deepseekApiKey'], function(result) {
        if (result.deepseekApiKey) {
            apiKeyInput.value = result.deepseekApiKey;
        }
    });

    // Save API key when button is clicked
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        // Validate API key format (basic check)
        if (!apiKey.startsWith('sk-')) {
            showStatus('Invalid API key format', 'error');
            return;
        }

        // Save to chrome storage
        chrome.storage.local.set({ deepseekApiKey: apiKey }, function() {
            showStatus('API key saved successfully!', 'success');
            
            // Clear status message after 3 seconds
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        });
    });

    // Function to show status messages
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status ' + type;
        statusMessage.style.display = 'block';
    }
}); 