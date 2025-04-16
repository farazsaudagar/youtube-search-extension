// Initialize storage access
async function initializeStorage() {
  try {
    await chrome.storage.local.get(null);
    console.log('Storage access initialized');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_API_KEY') {
    chrome.storage.local.get(['deepseekApiKey'])
      .then((result) => {
        sendResponse({ apiKey: result.deepseekApiKey });
      })
      .catch((error) => {
        console.error('Error getting API key:', error);
        sendResponse({ apiKey: null });
      });
    return true; // Required for async response
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_API_KEY') {
    chrome.storage.local.set({ deepseekApiKey: request.apiKey })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error saving API key:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-sidebar') {
        // Get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url.includes('youtube.com')) {
                // Send message to content script to toggle sidebar
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleSidebar' });
            }
        });
    }
}); 