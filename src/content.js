// Configuration for transcript processing
const TRANSCRIPT_CONFIG = {
    maxRetries: 3,           
    retryDelay: 2000,        
    backendUrl: 'http://localhost:5000/api/transcript'
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
                injectSidebar();
            });
        }
    });

    document.getElementById('skip-api-key').addEventListener('click', () => {
        popup.remove();
        injectSidebar();
    });
}

// Function to create and inject the sidebar with tab
function injectSidebar() {
    console.log('Starting sidebar injection...');
    
    // Remove any existing sidebar
    const existingSidebar = document.getElementById('youtube-video-search-sidebar');
    if (existingSidebar) {
        existingSidebar.remove();
    }
    
    // Create the sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'youtube-video-search-sidebar';
    sidebar.style.cssText = `
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100%;
        background: white;
        box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 9999;
    `;

    // Create the tab handle
    const tab = document.createElement('div');
    tab.id = 'youtube-search-tab';
    tab.style.cssText = `
        position: absolute;
        left: -60px;
        top: 50%;
        transform: translateY(-50%);
        width: 60px;
        height: 140px;
        background: #FF0000;
        color: white;
        box-shadow: -2px 0 5px rgba(0,0,0,0.2);
        border-radius: 8px 0 0 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-size: 16px;
        font-weight: 500;
        user-select: none;
        z-index: 9999;
    `;
    
    // Add search icon and text to tab
    tab.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; transform: rotate(180deg);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
            </svg>
            <span style="margin-top: 8px; font-weight: bold;">SEARCH</span>
        </div>
    `;

    // Create the sidebar content
    const content = document.createElement('div');
    content.style.cssText = `
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 16px;
    `;

    // Add the search interface
    content.innerHTML = `
        <div class="search-header" style="display: flex; align-items: center; gap: 8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#FF0000"/>
            </svg>
            <h2 style="margin: 0; font-size: 18px;">YouTube Caption Search</h2>
        </div>

        <div class="api-key-section" style="background: #f8f8f8; padding: 16px; border-radius: 8px;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #606060;">
                Enter your DeepSeek API key for AI-powered search. 
                <a href="https://platform.deepseek.com" target="_blank" style="color: #065FD4; text-decoration: none;">Get one here</a>
            </p>
            <div style="display: flex; gap: 8px;">
                <input type="password" id="api-key-input" placeholder="Enter your API key" style="
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                ">
                <button id="save-api-key" style="
                    padding: 8px 16px;
                    background: #065FD4;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                ">Save</button>
            </div>
            <div id="api-key-status" style="margin-top: 8px; font-size: 14px;"></div>
        </div>

        <div class="search-controls" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="search-type" style="display: flex; gap: 8px;">
                <button id="regular-search" style="
                    flex: 1;
                    padding: 8px;
                    background: #FF0000;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                ">Regular Search</button>
                <button id="ai-search" style="
                    flex: 1;
                    padding: 8px;
                    background: #F2F2F2;
                    color: #606060;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                ">AI Search</button>
            </div>
            <input type="text" id="search-input" placeholder="Search in video captions..." style="
                width: 100%;
                padding: 12px;
                border: 1px solid #DDD;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
            ">
        </div>

        <div id="search-results" style="
            flex: 1;
            overflow-y: auto;
            border: 1px solid #DDD;
            border-radius: 4px;
            padding: 8px;
        ">
            <div class="status-message" style="
                color: #606060;
                font-size: 14px;
                text-align: center;
                padding: 16px;
            ">Search results will appear here...</div>
        </div>
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        background: #f2f2f2;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        width: 40px;
        height: 40px;
        transition: background-color 0.2s ease;
    `;
    closeButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#606060"/>
        </svg>
    `;

    // Assemble the sidebar
    sidebar.appendChild(tab);
    sidebar.appendChild(closeButton);
    sidebar.appendChild(content);
    document.body.appendChild(sidebar);

    // Add event listeners
    let isOpen = false;
    let currentSearchMode = 'regular';
    let searchTimeout;

    function toggleSidebar() {
        isOpen = !isOpen;
        sidebar.style.right = isOpen ? '0' : '-400px';
        
        if (isOpen) {
            fetchTranscript();
            loadApiKey();
        }
    }

    function loadApiKey() {
        chrome.storage.local.get(['deepseekApiKey'], (result) => {
            if (result.deepseekApiKey) {
                document.getElementById('api-key-input').value = result.deepseekApiKey;
                showStatus('API key loaded', 'success');
            }
        });
    }

    function showStatus(message, type) {
        const statusEl = document.getElementById('api-key-status');
        statusEl.textContent = message;
        statusEl.style.color = type === 'success' ? '#0F8A0F' : '#CC0000';
        setTimeout(() => {
            statusEl.textContent = '';
        }, 3000);
    }

    function updateSearchType(mode) {
        currentSearchMode = mode;
        const regularBtn = document.getElementById('regular-search');
        const aiBtn = document.getElementById('ai-search');
        const searchInput = document.getElementById('search-input');

        if (mode === 'regular') {
            regularBtn.style.background = '#FF0000';
            regularBtn.style.color = 'white';
            aiBtn.style.background = '#F2F2F2';
            aiBtn.style.color = '#606060';
            searchInput.placeholder = 'Search in video captions...';
        } else {
            aiBtn.style.background = '#FF0000';
            aiBtn.style.color = 'white';
            regularBtn.style.background = '#F2F2F2';
            regularBtn.style.color = '#606060';
            searchInput.placeholder = 'Ask a question about the video...';
        }
    }

    function displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<div class="status-message">No results found.</div>';
            return;
        }

        resultsContainer.innerHTML = results.map((result, index) => `
            <div class="result-item" style="
                padding: 12px;
                border-bottom: 1px solid #EEE;
                cursor: pointer;
            " data-time="${result.time || result.timestamp}">
                ${currentSearchMode === 'ai' ? `
                    <div>${result.answer}</div>
                    ${result.timestamp ? `
                        <div style="color: #065FD4; font-weight: 500; margin-top: 4px;">
                            ${formatTime(result.timestamp)}
                        </div>
                    ` : ''}
                ` : `
                    <div style="color: #065FD4; font-weight: 500;">${formatTime(result.time)}</div>
                    <div>${result.text}</div>
                `}
            </div>
        `).join('');

        // Add click handlers for results
        document.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                const time = parseFloat(item.dataset.time);
                const video = document.querySelector('video');
                if (video && !isNaN(time)) {
                    video.currentTime = time;
                    video.play();
                }
            });
        });
    }

    // Event Listeners
    tab.addEventListener('click', toggleSidebar);
    closeButton.addEventListener('click', toggleSidebar);

    document.getElementById('save-api-key').addEventListener('click', () => {
        const apiKey = document.getElementById('api-key-input').value.trim();
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }
        if (!apiKey.startsWith('sk-')) {
            showStatus('Invalid API key format', 'error');
            return;
        }
        chrome.storage.local.set({ deepseekApiKey: apiKey }, () => {
            showStatus('API key saved successfully', 'success');
        });
    });

    document.getElementById('regular-search').addEventListener('click', () => updateSearchType('regular'));
    document.getElementById('ai-search').addEventListener('click', () => updateSearchType('ai'));

    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (!query) {
            displayResults([]);
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                if (currentSearchMode === 'regular') {
                    const results = performRegularSearch(query);
                    displayResults(results);
                } else {
                    const apiKey = document.getElementById('api-key-input').value.trim();
                    if (!apiKey) {
                        showStatus('Please set your API key first', 'error');
                        return;
                    }
                    const results = await performAISearch(query, apiKey);
                    displayResults(results);
                }
            } catch (error) {
                console.error('Search error:', error);
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = `
                    <div class="status-message" style="color: #CC0000;">
                        ${error.message}
                    </div>
                `;
            }
        }, 300);
    });

    // Add keyboard shortcut (Ctrl/Cmd + Shift + F)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            toggleSidebar();
        }
    });

    return sidebar;
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
            console.log('Received transcript data:', data);

            // Handle different response formats
            let transcriptArray;
            if (data.transcript && Array.isArray(data.transcript)) {
                // Format: { transcript: [...] }
                transcriptArray = data.transcript;
            } else if (Array.isArray(data)) {
                // Format: [...]
                transcriptArray = data;
            } else if (typeof data === 'object' && data !== null) {
                // Format: { segments: [...] } or other object format
                transcriptArray = data.segments || Object.values(data).find(val => Array.isArray(val));
            }

            if (!transcriptArray || !Array.isArray(transcriptArray)) {
                console.error('Invalid transcript format received:', data);
                throw new Error('Invalid transcript format received from server');
            }

            // Normalize the transcript format
            const normalizedTranscript = transcriptArray.map(segment => {
                if (typeof segment === 'string') {
                    return { text: segment, start: 0 };
                }
                return {
                    text: segment.text || segment.content || '',
                    start: segment.start || segment.timestamp || 0
                };
            }).filter(segment => segment.text);

            console.log('Normalized transcript:', normalizedTranscript);

            // Store normalized transcript
            localStorage.setItem('transcript', JSON.stringify(normalizedTranscript));
            chrome.storage.local.set({ transcript: normalizedTranscript }, () => {
                console.log('Transcript stored in chrome.storage');
            });

            return normalizedTranscript;
        } catch (error) {
            console.error('Error fetching transcript:', error);
            retries++;
            if (retries < TRANSCRIPT_CONFIG.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, TRANSCRIPT_CONFIG.retryDelay));
            } else {
                throw new Error('Failed to fetch transcript after multiple attempts');
            }
        }
    }
}

// Initialize when the page is ready
function initialize() {
    console.log('Initializing extension...');
    injectSidebar();
}

// Start initialization immediately and also listen for page changes
initialize();
document.addEventListener('yt-navigate-finish', initialize);

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

// Message handling for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
    
    if (request.action === 'regularSearch' || request.action === 'aiSearch') {
        chrome.storage.local.get(['transcript', 'deepseekApiKey'], async (result) => {
            try {
                if (!result.transcript) {
                    await fetchTranscript();
                }
                
                if (request.action === 'regularSearch') {
                    const searchResults = performRegularSearch(request.query);
                    sendResponse({ results: searchResults });
                } else {
                    if (!result.deepseekApiKey) {
                        sendResponse({ error: 'Please set your DeepSeek API key in the extension settings.' });
                        return;
                    }
                    const aiResults = await performAISearch(request.query, result.deepseekApiKey);
                    sendResponse({ results: aiResults });
                }
            } catch (error) {
                console.error('Search error:', error);
                sendResponse({ error: error.message });
            }
        });
        return true; // Keep the message channel open for async response
    }

    if (request.action === 'seekTo') {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = request.time;
            video.play();
        }
        return true;
    }
});

// Function to perform regular search in transcript
function performRegularSearch(query) {
    try {
        const transcriptData = localStorage.getItem('transcript');
        if (!transcriptData) {
            throw new Error('No transcript available. Please wait for it to load.');
        }

        console.log('Performing regular search with transcript:', transcriptData);
        const transcript = JSON.parse(transcriptData);
        
        if (!Array.isArray(transcript)) {
            console.error('Invalid transcript format in storage:', transcript);
            throw new Error('Invalid transcript format');
        }

        const searchResults = [];
        const searchTerms = query.toLowerCase().split(' ');
        
        for (const segment of transcript) {
            if (!segment || typeof segment.text !== 'string') {
                console.warn('Invalid segment found:', segment);
                continue;
            }
            const text = segment.text.toLowerCase();
            if (searchTerms.every(term => text.includes(term))) {
                searchResults.push({
                    time: segment.start,
                    text: segment.text
                });
            }
        }
        
        console.log('Search results:', searchResults);
        return searchResults;
    } catch (error) {
        console.error('Regular search error:', error);
        throw new Error('Failed to search transcript: ' + error.message);
    }
}

// Function to perform AI search
async function performAISearch(query, apiKey) {
    try {
        const transcriptData = localStorage.getItem('transcript');
        if (!transcriptData) {
            throw new Error('No transcript available. Please wait for it to load.');
        }

        console.log('Performing AI search with transcript:', transcriptData);
        const transcript = JSON.parse(transcriptData);
        
        if (!Array.isArray(transcript)) {
            console.error('Invalid transcript format in storage:', transcript);
            throw new Error('Invalid transcript format');
        }

        const transcriptText = transcript
            .filter(segment => segment && typeof segment.text === 'string')
            .map(segment => `[${formatTime(segment.start)}] ${segment.text}`)
            .join('\n');

        console.log('Formatted transcript for AI:', transcriptText);
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant helping to analyze video transcripts. Provide concise, relevant answers with timestamp references."
                    },
                    {
                        role: "user",
                        content: `Video Transcript:\n${transcriptText}\n\nQuestion: ${query}`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;

        // Extract timestamps from the answer and format the response
        const timestamps = answer.match(/\[(\d+:\d+)\]/g) || [];
        const results = timestamps.map(timestamp => {
            const time = timestamp.match(/(\d+):(\d+)/);
            if (time) {
                const seconds = parseInt(time[1]) * 60 + parseInt(time[2]);
                return {
                    answer: answer,
                    timestamp: seconds
                };
            }
            return null;
        }).filter(Boolean);

        console.log('AI search results:', results);
        return results.length > 0 ? results : [{ answer: answer }];
    } catch (error) {
        console.error('AI Search error:', error);
        throw new Error('Failed to perform AI search: ' + error.message);
    }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleSidebar') {
        toggleSidebar();
    }
}); 