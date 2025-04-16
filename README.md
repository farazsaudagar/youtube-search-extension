# YouTube Search Extension

A powerful Chrome extension that enhances your YouTube viewing experience with advanced search capabilities and AI-powered insights.

## Features

### 1. Smart Caption Search
- **Regular Search**: Instantly search through video captions as you type
- **Timestamp Navigation**: Click on any search result to jump to that exact moment in the video
- **Real-time Filtering**: Results update automatically as you type

### 2. AI-Powered Search
- **Natural Language Questions**: Ask questions about the video content in plain English
- **Context-Aware Responses**: Get intelligent answers that reference specific timestamps in the video
- **DeepSeek Integration**: Powered by DeepSeek's advanced language model for accurate responses

## Installation

1. Clone the repository:
```bash
git clone https://github.com/farazsaudagar/youtube-search-extension.git
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory

## Usage

1. **Setting up the Extension**:
   - After installation, click the extension icon
   - Enter your DeepSeek API key in the popup (required for AI search)
   - You can get an API key from [DeepSeek Platform](https://platform.deepseek.com)

2. **Using the Search Feature**:
   - Navigate to any YouTube video
   - Click the "Search Captions" button that appears on the video page
   - Choose between Regular Search or AI Search
   - For Regular Search: Start typing to see instant results
   - For AI Search: Type your question and click Search

3. **Navigating Results**:
   - Click any timestamp to jump to that point in the video
   - In AI responses, timestamps are highlighted and clickable
   - Regular search highlights matching text in the captions

## Development

### Project Structure
```
├── src/
│   ├── backend.py        # Flask backend for transcript and AI processing
│   ├── content.js        # Content script for YouTube integration
│   ├── sidebar.js        # React component for search interface
│   └── background.js     # Extension background script
├── dist/                 # Built files
├── icons/               # Extension icons
└── webpack.config.js    # Webpack configuration
```

### Running Locally
1. Start the backend server:
```bash
python src/backend.py
```

2. Watch for changes during development:
```bash
npm run watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
