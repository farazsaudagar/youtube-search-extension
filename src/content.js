// Configuration for transcript processing
const TRANSCRIPT_CONFIG = {
    maxRetries: 3,           // Maximum number of retries to get transcript
    retryDelay: 2000,        // Delay between retries in milliseconds
    backendUrl: 'http://localhost:5000/api/transcript' // Backend service URL
};

// Function to create and inject the API key popup
function injectApiKeyPopup() {
    const popup = document.createElement('div');
    popup.id = 'youtube-api-key-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        width: 300px;
    `;

    popup.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">Enter DeepSeek API Key</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
            To use AI search, please enter your DeepSeek API key. You can get one from 
            <a href="https://platform.deepseek.com" target="_blank" style="color: #1a73e8;">DeepSeek Platform</a>
        </p>
        <input type="password" id="api-key-input" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        " placeholder="Enter your API key">
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="skip-api-key" style="
                padding: 8px 16px;
                background: #f1f3f4;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: #333;
            ">Skip for now</button>
            <button id="save-api-key" style="
                padding: 8px 16px;
                background: #1a73e8;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: white;
            ">Save API Key</button>
        </div>
    `;

    document.body.appendChild(popup);

    // Add event listeners
    document.getElementById('save-api-key').addEventListener('click', () => {
        const apiKey = document.getElementById('api-key-input').value;
        if (apiKey) {
            chrome.storage.local.set({ deepseekApiKey: apiKey }, () => {
                popup.remove();
                injectSearchButton();
            });
        }
    });

    document.getElementById('skip-api-key').addEventListener('click', () => {
        popup.remove();
        injectSearchButton();
    });
}

// Function to create and inject the search button
function injectSearchButton() {
    const button = document.createElement('button');
    button.id = 'youtube-search-button';
    button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white"/>
        </svg>
        Search Captions
    `;
    
    // Add styles to the button
    button.style.cssText = `
        position: fixed;
        right: 20px;
        top: 20px;
        z-index: 9999;
        background-color: #ff0000;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;

    // Add hover effect
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#cc0000';
    });
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#ff0000';
    });

    // Add click handler
    button.addEventListener('click', async () => {
        if (!document.getElementById('youtube-video-search-sidebar')) {
            await injectSidebar();
        }
        // Toggle sidebar visibility
        const sidebar = document.getElementById('youtube-video-search-sidebar');
        if (sidebar) {
            sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
            // Fetch transcript when sidebar is opened
            if (sidebar.style.display === 'block') {
                await fetchTranscript();
            }
        }
    });

    document.body.appendChild(button);
}

// Function to inject the sidebar
async function injectSidebar() {
    console.log('Injecting sidebar...');
    
    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'youtube-video-search-sidebar';
    sidebar.style.display = 'none'; // Start hidden
    document.body.appendChild(sidebar);
    console.log('Sidebar container created');

    // Load the bundled sidebar script
    const sidebarScript = document.createElement('script');
    sidebarScript.src = chrome.runtime.getURL('dist/sidebar.bundle.js');
    document.head.appendChild(sidebarScript);
    console.log('Sidebar script loaded');

    // Wait for the sidebar to be rendered
    await new Promise((resolve) => {
        const checkSidebar = setInterval(() => {
            const sidebarElement = document.querySelector('#youtube-video-search-sidebar > div');
            if (sidebarElement) {
                clearInterval(checkSidebar);
                console.log('Sidebar rendered');
                resolve();
            }
        }, 100);
    });
}

// Function to format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Function to fetch transcript using the backend service
async function fetchTranscript() {
    console.log('Fetching transcript...');
    let retries = 0;
    
    while (retries < TRANSCRIPT_CONFIG.maxRetries) {
        try {
            // Get video ID from URL
            const videoId = new URLSearchParams(window.location.search).get('v');
            if (!videoId) {
                throw new Error('No video ID found');
            }

            // Fetch transcript from backend
            const response = await fetch(`${TRANSCRIPT_CONFIG.backendUrl}?video_id=${videoId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Send captions to sidebar
            window.postMessage({
                type: 'UPDATE_CAPTIONS',
                captions: data.transcript
            }, '*');

            console.log('Transcript fetched successfully');
            return;

        } catch (error) {
            console.error(`Attempt ${retries + 1} failed:`, error);
            retries++;
            if (retries < TRANSCRIPT_CONFIG.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, TRANSCRIPT_CONFIG.retryDelay));
            }
        }
    }

    console.error('Failed to fetch transcript after maximum retries');
}

// Initialize when the page is ready
function initialize() {
    console.log('Initializing extension...');
    // Wait for YouTube player to be ready
    const checkPlayer = setInterval(() => {
        const video = document.querySelector('video');
        if (video) {
            console.log('YouTube player found');
            clearInterval(checkPlayer);
            
            // Check if API key exists
            chrome.storage.local.get(['deepseekApiKey'], (result) => {
                if (result.deepseekApiKey) {
                    injectSearchButton();
                } else {
                    injectApiKeyPopup();
                }
            });
        }
    }, 1000);
}

// Start initialization
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    console.log('Document already loaded, initializing immediately');
    initialize();
}

// Listen for messages from the sidebar
window.addEventListener('message', (event) => {
  // Only handle messages from our own origin
  if (event.source !== window) return;

  if (event.data.type === 'GET_API_KEY') {
    // Get API key from storage
    chrome.storage.local.get(['deepseekApiKey'], (result) => {
      // Send response back to sidebar
      window.postMessage({ 
        type: 'API_KEY_RESPONSE', 
        apiKey: result.deepseekApiKey 
      }, '*');
    });
  }
}); 