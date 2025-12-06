# Electron Desktop App Guide

## Overview

This application has been converted from a web-based MERN stack app to a full-featured **Electron desktop application**. It can now:

- ✅ Monitor clipboard changes across ALL applications (Chrome, Word, Excel, etc.)
- ✅ Run in the system tray in the background
- ✅ Use global keyboard shortcuts
- ✅ Send messages to Facebook Messenger
- ✅ Manage offline presets with localStorage
- ✅ Upload multiple images at once

## Key Features

### 1. System-Wide Clipboard Monitoring

The app monitors your clipboard every 500ms and tracks:
- **Text changes**: Whenever you copy text anywhere
- **Image changes**: Whenever you copy/screenshot images

**Features:**
- Stores up to 50 recent clipboard items
- Shows notification when clipboard changes
- Access clipboard history with `Ctrl+Shift+V`
- Works even when app is minimized or hidden

### 2. Global Keyboard Shortcuts

**`Ctrl+Shift+V`** (or `Cmd+Shift+V` on Mac)
- Opens the clipboard history modal
- Shows all recent copied text and images
- Works from any application

**`Ctrl+Shift+W`** (or `Cmd+Shift+W` on Mac)
- Toggle app window visibility
- Show window if hidden, hide if shown
- Useful for quick access

### 3. System Tray Integration

- **Icon in system tray**: App stays in tray when minimized
- **Left-click**: Toggle window visibility
- **Right-click menu**:
  - Show App
  - Clipboard History
  - Quit

**Important**: Closing the window doesn't quit the app - it minimizes to tray. Use "Quit" from tray menu to fully exit.

### 4. Preset Management

Save frequently used content for quick sending:

**Text Presets:**
- Save commonly used messages
- Copy/paste individual items
- Send to Facebook Messenger with one click
- Batch send all presets at once

**Image Presets:**
- Save frequently used images
- Preview thumbnails
- Send individually or in batch
- Supports multiple image formats

**Persistence:**
- All presets stored in localStorage
- Survives app restarts
- No database required

## How to Run

### Development Mode

**Step 1: Start Backend Server**
```bash
cd server
npm start
```

The server will run on `http://localhost:5000`

**Step 2: Start Electron App**

In a new terminal:
```bash
cd client
npm run electron-dev
```

This command will:
1. Start React dev server (port 3000)
2. Wait for React to be ready
3. Launch Electron window automatically
4. Enable hot reload for React changes
5. Open DevTools for debugging

### Web Browser Mode (Optional)

If you want to test the React app in a web browser:
```bash
cd client
npm start
```

Then open `http://localhost:3000` in your browser.

**Note**: Clipboard monitoring and global shortcuts won't work in browser mode - these are Electron-only features.

## Building for Distribution

Create standalone executables for distribution:

### Windows
```bash
cd client
npm run dist -- --win
```

Output: `client/dist/Warehouse Message Setup.exe`

### macOS
```bash
cd client
npm run dist -- --mac
```

Output: `client/dist/Warehouse Message.dmg`

### Linux
```bash
cd client
npm run dist -- --linux
```

Output: `client/dist/Warehouse Message.AppImage` and `.deb`

### All Platforms
```bash
cd client
npm run dist
```

## Architecture

### File Structure

```
client/
├── public/
│   ├── electron.js          # Electron main process
│   ├── index.html
│   └── favicon.ico          # Used for tray icon
├── src/
│   ├── App.js              # React UI with IPC listeners
│   ├── App.css             # Includes clipboard modal styles
│   └── index.js
└── package.json            # Electron scripts and config
```

### Electron Main Process (`electron.js`)

**Responsibilities:**
- Create and manage the main window
- Monitor system clipboard (text and images)
- Create system tray icon and menu
- Register global keyboard shortcuts
- Handle IPC communication with React

**Key Functions:**
- `createWindow()` - Creates BrowserWindow with Node integration
- `createTray()` - Creates system tray icon and menu
- `startClipboardMonitor()` - Monitors clipboard every 500ms
- IPC handlers: `copy-to-clipboard`, `get-clipboard-history`

### React Renderer Process (`App.js`)

**Electron Detection:**
```javascript
const isElectron = window && window.process && window.process.type === 'renderer';
```

**IPC Communication:**
```javascript
if (isElectron && window.require) {
  const { ipcRenderer } = window.require('electron');
  
  // Listen for clipboard updates
  ipcRenderer.on('clipboard-update', (event, data) => {
    // Handle clipboard change
  });
  
  // Request clipboard history
  ipcRenderer.send('get-clipboard-history');
}
```

### Communication Flow

```
┌─────────────────────────────────────────────┐
│         Electron Main Process               │
│                                             │
│  • System clipboard monitoring              │
│  • Global shortcuts registration            │
│  • Tray icon management                     │
└──────────────┬─────────────┬────────────────┘
               │             │
         IPC Events     IPC Events
               │             │
               ▼             ▼
┌──────────────────────────────────────────────┐
│         React Renderer Process               │
│                                              │
│  • UI rendering and user interactions        │
│  • API calls to backend                      │
│  • localStorage for presets                  │
└──────────────────────────────────────────────┘
               │
          HTTP Requests
               │
               ▼
┌──────────────────────────────────────────────┐
│         Express Backend Server               │
│                                              │
│  • Facebook Messenger API integration        │
│  • File upload handling                      │
│  • Optional MongoDB persistence              │
└──────────────────────────────────────────────┘
```

## Clipboard Monitoring Implementation

### How It Works

1. **Polling Interval**: Checks clipboard every 500ms
2. **Change Detection**: Compares with last known value
3. **History Storage**: Stores up to 50 recent items
4. **IPC Notification**: Sends update to React renderer
5. **UI Update**: Shows notification in app

### Code Example

```javascript
// In electron.js (main process)
function startClipboardMonitor() {
  setInterval(() => {
    const currentText = clipboard.readText();
    if (currentText && currentText !== lastClipboardText) {
      lastClipboardText = currentText;
      
      clipboardHistory.unshift({
        type: 'text',
        content: currentText,
        timestamp: Date.now()
      });
      
      mainWindow.webContents.send('clipboard-update', {
        type: 'text',
        content: currentText
      });
    }
  }, 500);
}
```

### Clipboard History Modal

Access with `Ctrl+Shift+V` or tray menu:

```
┌──────────────────────────────────────┐
│  📋 Clipboard History           [×]  │
├──────────────────────────────────────┤
│                                      │
│  [Text] Hello world                  │
│         2024-01-15 10:30:45         │
│                                      │
│  [Image] [thumbnail]                 │
│         2024-01-15 10:29:32         │
│                                      │
│  [Text] https://example.com          │
│         2024-01-15 10:28:10         │
│                                      │
└──────────────────────────────────────┘
```

## Security Considerations

### Node Integration

The app uses `nodeIntegration: true` to access Electron APIs from React:

```javascript
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false,
  enableRemoteModule: true
}
```

⚠️ **Warning**: This is suitable for internal/desktop apps but would be insecure for web-exposed content.

### Clipboard Privacy

- All clipboard data stays local (not sent to server unless explicitly requested)
- History stored in memory (cleared on app restart)
- Only last 50 items kept to prevent memory issues

## Troubleshooting

### Common Issues

**1. App Won't Start**
- Make sure backend server is running on port 5000
- Check if React dev server starts successfully
- Look for errors in terminal output

**2. Clipboard Monitoring Not Working**
- Check OS permissions (some OSes require clipboard access permission)
- Verify the app is actually running (check system tray)
- Look for errors in DevTools console

**3. Global Shortcuts Not Working**
- Another app might be using the same shortcuts
- Try changing shortcuts in `electron.js`:
```javascript
globalShortcut.register('Alt+Shift+V', () => {
  // Your custom shortcut
});
```

**4. Tray Icon Not Showing**
- Check if `public/favicon.ico` exists
- Some Linux systems need additional tray support packages
- Try using a PNG icon instead

**5. Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Electron cache
rm -rf ~/.electron
```

### Debug Mode

To see detailed Electron logs:

```javascript
// In electron.js
console.log('Clipboard changed:', data);
console.log('Current clipboard history:', clipboardHistory);
```

DevTools will open automatically in development mode.

## Performance Optimization

### Memory Management

- Clipboard history limited to 50 items
- Large images converted to data URLs (consider size limits)
- Old items automatically removed when limit reached

### CPU Usage

- 500ms polling interval is a good balance
- Can be adjusted in `electron.js`:
```javascript
setInterval(() => {
  // Monitor clipboard
}, 1000); // Change to 1 second for less CPU usage
```

## Future Enhancements

Potential improvements:

1. **OCR Integration**: Extract text from copied images
2. **Cloud Sync**: Sync clipboard history across devices
3. **Templates**: Pre-defined message templates with variables
4. **Scheduled Messages**: Queue messages for later sending
5. **Multi-Account**: Support multiple Facebook pages
6. **Custom Shortcuts**: Let users configure their own shortcuts
7. **Search**: Search through clipboard history
8. **Filters**: Filter clipboard by type (text/image/links)

## License

This is a custom internal tool. Use at your own discretion.

## Support

For issues or questions:
1. Check this guide first
2. Review console logs (DevTools)
3. Check server logs
4. Verify Facebook API credentials
