# YouTube Caption Search Extension

A powerful Chrome extension that enhances YouTube video navigation with advanced caption search capabilities, including AI-powered semantic search.

## Features

### 🔍 Smart Caption Search
- Real-time search through video captions
- Instant navigation to specific timestamps
- Keyboard shortcut support (Ctrl/Cmd + Shift + F)
- Clean, intuitive sidebar interface

### 🤖 AI-Powered Search
- Ask natural language questions about the video
- Get context-aware answers with timestamp references
- Powered by DeepSeek's advanced language model
- Semantic understanding of video content

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (coming soon)
2. Search for "YouTube Caption Search"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the extension directory

## Usage

1. **Setup**
   - Click the extension icon to open settings
   - Enter your DeepSeek API key (required for AI search)
   - Configure your preferences

2. **Basic Search**
   - Open any YouTube video
   - Press Ctrl/Cmd + Shift + F or click the red "SEARCH" tab
   - Type your search query
   - Click on results to jump to specific timestamps

3. **AI Search**
   - Switch to "AI Search" mode
   - Ask natural language questions about the video
   - Get contextual answers with relevant timestamps
   - Click timestamps to navigate to specific points

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Python 3.x (for icon generation)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/farazsaudagar/youtube-search-extension.git
   cd youtube-search-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   pip install Pillow  # for icon generation
   ```

3. Generate icons:
   ```bash
   python icons/generate_icons.py
   ```

4. Development build:
   ```bash
   npm run watch
   ```

5. Production build:
   ```bash
   npm run build
   ```

### Project Structure
```
youtube-search-extension/
├── src/
│   ├── popup/           # React popup component
│   ├── content.js       # Content script with sidebar
│   └── background.js    # Service worker
├── dist/               # Built files
├── icons/              # Extension icons
└── manifest.json       # Extension manifest
```

## Deployment Checklist

1. Update version in `manifest.json` and `package.json`
2. Run production build: `npm run build`
3. Test the built extension thoroughly
4. Create a ZIP file of the following:
   - manifest.json
   - dist/
   - icons/
   - popup.html
5. Submit to Chrome Web Store

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/farazsaudagar/youtube-search-extension/issues) page
2. Open a new issue if needed
3. Provide detailed information about your problem
