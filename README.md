# Cynxio LinkedIn Extension

A Chrome extension that extracts LinkedIn profile data and seamlessly imports it into the Cynxio resume builder at jobai.cynxio.com.

## Features

- **Automatic Page Detection**: Detects LinkedIn profile pages and injects a "Generate Resume" button
- **Smart Data Extraction**: Extracts comprehensive profile data including:
  - Basic information (name, headline, location)
  - Work experience with dates and descriptions
  - Education history
  - Skills list
- **Seamless Integration**: Automatically opens or focuses Cynxio tabs and transfers data
- **Auth0 Integration**: Works with existing Cynxio authentication
- **Real-time Form Population**: Auto-fills resume forms with extracted data

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Development mode with auto-rebuild
npm run dev
```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder
4. The extension should now be installed and ready to use

## Project Structure

```
cynxio-linkedin-extension/
├── manifest.json                 # Chrome extension manifest
├── src/
│   ├── types.ts                 # TypeScript type definitions
│   ├── linkedin-content-script.ts  # LinkedIn page interaction
│   ├── cynxio-content-script.ts    # Cynxio site integration
│   └── background.ts               # Tab management service worker
├── styles/
│   └── linkedin-inject.css         # Button styling
├── popup.html                      # Extension popup UI
├── webpack.config.js               # Build configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies and scripts
```

## How It Works

### 1. Page Detection
The extension monitors LinkedIn pages and detects profile URLs (`/in/*`) to inject the "Generate Resume" button.

### 2. Data Extraction
When the button is clicked, the extension extracts:
- **Profile Info**: Name, headline, location, about section
- **Experience**: Company, role, dates, descriptions
- **Education**: School, degree, field, dates
- **Skills**: Complete skills list

### 3. Data Transfer
The extension uses Chrome's messaging API to:
- Check for existing Cynxio tabs
- Focus existing tabs or create new ones
- Send extracted data to the Cynxio content script

### 4. API Integration
The Cynxio content script:
- Receives LinkedIn data via Chrome messaging
- Sends data to `/api/linkedin-import` endpoint
- Auto-populates resume forms with extracted data
- Shows success/error notifications

## Security & Privacy

- Only extracts data when explicitly requested by user
- Works only on the user's own LinkedIn profile
- Data is sent directly to Cynxio API with user authentication
- No data is stored locally by the extension

## Browser Support

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## API Endpoint

The extension expects a `/api/linkedin-import` endpoint on the Cynxio site that:
- Accepts POST requests with LinkedIn profile data
- Validates Auth0 authentication
- Returns success/error responses
- Associates data with user accounts

## Troubleshooting

### Button Not Appearing
- Ensure you're on your own LinkedIn profile page
- Check that the extension is enabled in Chrome
- Try refreshing the page

### Data Not Transferring
- Check browser console for error messages
- Ensure you're logged into Cynxio
- Verify the API endpoint is responding

### Build Issues
```bash
# Clean build
npm run clean
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Future Enhancements

- Job application page integration
- Company research features
- Network analysis tools
- Enhanced form field detection
- Support for multiple resume formats