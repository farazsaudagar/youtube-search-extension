import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

// Styles for the sidebar
const styles = {
  sidebar: {
    position: 'fixed',
    right: 0,
    top: 0,
    width: '300px',
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 9998,
    padding: '20px',
    overflowY: 'auto'
  },
  header: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: 0
  },
  searchTypeToggle: {
    display: 'flex',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  toggleButton: {
    flex: 1,
    padding: '8px',
    border: 'none',
    background: '#f1f3f4',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  toggleButtonActive: {
    background: '#1a73e8',
    color: 'white'
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#1557b0'
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    }
  },
  searchResultsContainer: {
    maxHeight: 'calc(100vh - 150px)',
    overflowY: 'auto',
    paddingRight: '5px'
  },
  searchResult: {
    marginBottom: '15px',
    padding: '12px',
    border: '1px solid #eee',
    borderRadius: '6px',
    backgroundColor: '#fff',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      borderColor: '#ddd'
    }
  },
  timestamp: {
    color: '#1a73e8',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: 500
  },
  timestampIcon: {
    width: '12px',
    height: '12px',
    fill: '#666'
  },
  contextText: {
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#333'
  },
  highlight: {
    backgroundColor: '#fff3cd',
    padding: '0 2px',
    borderRadius: '2px'
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    padding: '20px',
    fontStyle: 'italic'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },
  resultsCount: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '10px',
    paddingLeft: '5px'
  },
  aiAnswer: {
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #eee',
    fontSize: '14px',
    lineHeight: '1.6'
  }
};

function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [captions, setCaptions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState('regular'); // 'regular' or 'ai'
  const [aiAnswer, setAiAnswer] = useState(null);
  const searchTimeout = useRef(null);

  // Handle initial transcript data
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'UPDATE_CAPTIONS') {
        setCaptions(event.data.captions);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Regular search function with debounce
  const searchCaptions = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      const results = captions
        .filter(caption => caption.text.toLowerCase().includes(query.toLowerCase()))
        .map(caption => ({
          ...caption,
          highlightedText: highlightText(caption.text, query)
        }));

      setSearchResults(results);
    }, 300);
  }, [captions]);

  // AI Search function
  const aiSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setAiAnswer(null);
      return;
    }

    setIsLoading(true);
    try {
      // Get API key
      let apiKey = null;
      try {
        apiKey = await new Promise((resolve) => {
          window.postMessage({ type: 'GET_API_KEY' }, '*');
          
          const handleMessage = (event) => {
            if (event.data.type === 'API_KEY_RESPONSE') {
              window.removeEventListener('message', handleMessage);
              resolve(event.data.apiKey);
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          setTimeout(() => {
            window.removeEventListener('message', handleMessage);
            resolve(null);
          }, 5000);
        });
      } catch (error) {
        console.error('Error getting API key:', error);
        setAiAnswer('Error getting API key. Please reload the extension.');
        setIsLoading(false);
        return;
      }

      if (!apiKey) {
        setAiAnswer('Please set your DeepSeek API key in the extension popup to use AI search.');
        setIsLoading(false);
        return;
      }

      // Make API request
      const response = await fetch('http://localhost:5000/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          transcript: captions,
          api_key: apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        setAiAnswer(`Error: ${data.error}`);
      } else {
        // Format the answer with clickable timestamps
        const formattedAnswer = formatAnswerWithTimestamps(data.answer, captions);
        setAiAnswer(formattedAnswer);
      }
    } catch (error) {
      console.error('Search error:', error);
      setAiAnswer(`Error: ${error.message}`);
    }
    setIsLoading(false);
  }, [captions]);

  // Format AI answer with clickable timestamps
  const formatAnswerWithTimestamps = useCallback((answer, captions) => {
    // First, find all timestamp references in the format [MM:SS]
    const timestampRegex = /\[(\d{1,2}:\d{2})\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = timestampRegex.exec(answer)) !== null) {
      // Add text before the timestamp
      if (match.index > lastIndex) {
        parts.push(answer.substring(lastIndex, match.index));
      }

      // Add the clickable timestamp
      const timestamp = match[1];
      parts.push(
        <span 
          key={match.index} 
          style={styles.timestamp}
          onClick={() => seekToTime(timestamp)}
        >
          [{timestamp}]
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < answer.length) {
      parts.push(answer.substring(lastIndex));
    }

    return <div>{parts}</div>;
  }, []);

  // Memoized highlight function
  const highlightText = useCallback((text, query) => {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <span key={i} style={styles.highlight}>{part}</span> : part
    );
  }, []);

  // Handle search button click
  const handleSearch = useCallback(() => {
    if (searchType === 'regular') {
      searchCaptions(searchQuery);
    } else {
      aiSearch(searchQuery);
    }
  }, [searchQuery, searchType, searchCaptions, aiSearch]);

  // Handle input change
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // For regular search, search as you type
    if (searchType === 'regular') {
      searchCaptions(query);
    }
  }, [searchType, searchCaptions]);

  // Memoized seek function
  const seekToTime = useCallback((timestamp) => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    const timeInSeconds = minutes * 60 + seconds;
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = timeInSeconds;
      video.play();
    }
  }, []);

  // Function to close the sidebar
  const closeSidebar = useCallback(() => {
    const sidebar = document.getElementById('youtube-video-search-sidebar');
    if (sidebar) {
      sidebar.style.display = 'none';
    }
  }, []);

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <span>Search Captions</span>
        <button style={styles.closeButton} onClick={closeSidebar}>×</button>
      </div>

      <div style={styles.searchTypeToggle}>
        <button
          style={{
            ...styles.toggleButton,
            ...(searchType === 'regular' ? styles.toggleButtonActive : {})
          }}
          onClick={() => setSearchType('regular')}
        >
          Regular Search
        </button>
        <button
          style={{
            ...styles.toggleButton,
            ...(searchType === 'ai' ? styles.toggleButtonActive : {})
          }}
          onClick={() => setSearchType('ai')}
        >
          AI Search
        </button>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder={searchType === 'regular' ? "Search in captions..." : "Ask a question about the video..."}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && searchType === 'ai') {
              handleSearch();
            }
          }}
        />
        {searchType === 'ai' && (
          <button
            style={styles.searchButton}
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div style={styles.loading}>Searching...</div>
      ) : searchType === 'regular' ? (
        searchResults.length > 0 ? (
          <>
            <div style={styles.resultsCount}>
              Found {searchResults.length} results
            </div>
            <div style={styles.searchResultsContainer}>
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  style={styles.searchResult}
                  onClick={() => seekToTime(result.timestamp)}
                >
                  <div style={styles.timestamp}>
                    <svg style={styles.timestampIcon} viewBox="0 0 24 24">
                      <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                    </svg>
                    {result.timestamp}
                  </div>
                  <div style={styles.contextText}>
                    {result.highlightedText}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : searchQuery ? (
          <div style={styles.noResults}>No results found</div>
        ) : null
      ) : aiAnswer ? (
        <div style={styles.aiAnswer}>
          {aiAnswer}
        </div>
      ) : null}
    </div>
  );
}

// Render the sidebar component
const sidebarContainer = document.getElementById('youtube-video-search-sidebar');
if (sidebarContainer) {
  ReactDOM.render(<Sidebar />, sidebarContainer);
} 