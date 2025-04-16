import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [settings, setSettings] = useState({
    autoOpenSidebar: false,
    searchShortcut: 'Ctrl+Shift+F',
    defaultSearchMode: 'regular'
  });
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    // Load saved settings on mount
    chrome.storage.local.get(['deepseekApiKey', 'settings'], (result) => {
      if (result.deepseekApiKey) {
        setApiKey(result.deepseekApiKey);
      }
      if (result.settings) {
        setSettings(prev => ({ ...prev, ...result.settings }));
      }
    });
  }, []);

  const showStatus = (message, type) => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 3000);
  };

  const handleSaveApiKey = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    if (!trimmedKey.startsWith('sk-')) {
      showStatus('Invalid API key format', 'error');
      return;
    }

    chrome.storage.local.set({ deepseekApiKey: trimmedKey }, () => {
      showStatus('API key saved successfully', 'success');
    });
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    chrome.storage.local.set({ settings: newSettings }, () => {
      showStatus('Settings saved successfully', 'success');
    });
  };

  return (
    <div className="container">
      <div className="header">
        <svg className="settings-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
        </svg>
        <h1>Extension Settings</h1>
      </div>

      <div className="section">
        <h2>API Configuration</h2>
        <p className="description">
          Enter your DeepSeek API key for AI-powered search. Get one from{' '}
          <a href="https://platform.deepseek.com" target="_blank" rel="noreferrer">
            DeepSeek Platform
          </a>
        </p>
        <div className="input-group">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
          <button onClick={handleSaveApiKey}>Save</button>
        </div>
      </div>

      <div className="section">
        <h2>General Settings</h2>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.autoOpenSidebar}
              onChange={(e) => handleSettingChange('autoOpenSidebar', e.target.checked)}
            />
            Auto-open sidebar on video load
          </label>
        </div>
        <div className="setting-item">
          <label>Default Search Mode</label>
          <select
            value={settings.defaultSearchMode}
            onChange={(e) => handleSettingChange('defaultSearchMode', e.target.value)}
          >
            <option value="regular">Regular Search</option>
            <option value="ai">AI Search</option>
          </select>
        </div>
      </div>

      <div className="section">
        <h2>Keyboard Shortcuts</h2>
        <div className="shortcut-info">
          <p>Toggle Sidebar: {settings.searchShortcut}</p>
          <small>You can change Chrome extension shortcuts in chrome://extensions/shortcuts</small>
        </div>
      </div>

      {status.message && (
        <div className={`status-message ${status.type}-message`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default App; 