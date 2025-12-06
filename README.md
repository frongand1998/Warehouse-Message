# Warehouse Message

A cross-platform desktop application (Electron + React) for clipboard monitoring and message management.

## ✨ Key Features

### 🖥️ Desktop Application
- **Cross-platform**: Windows, macOS, Linux
- **System Tray**: Runs in background, minimize to tray
- **Global Hotkeys**: 
  - `Ctrl+Shift+V` (or `Cmd+Shift+V`) - Show clipboard history
  - `Ctrl+Shift+W` (or `Cmd+Shift+W`) - Toggle window visibility

### 📋 Clipboard Monitoring
- **System-wide monitoring**: Tracks clipboard across ALL applications
- **Multi-format support**: Text and images
- **History storage**: Up to 50 recent items
- **Real-time notifications**: Alerts on clipboard changes

### 💼 Message Management
- **Store messages**: Save text and images
- **Quick access**: View stored messages anytime
- **Offline storage**: Works without internet
- **Persistent**: Survives app restarts

### 💾 Preset Management
- **Offline storage**: Save frequently used content (localStorage)
- **Quick send**: One-click access to saved items
- **Copy/Paste**: Individual item clipboard operations
- **Persistent**: Survives app restarts

### 🎨 Modern UI
- **Responsive design**: Beautiful gradient interface
- **Image previews**: Grid view for multiple images
- **Drag & drop**: Easy file uploads
- **Ctrl+V paste**: Paste images directly from clipboard

## 🚀 Quick Start

### Desktop App (Recommended)
```bash
# Clone the repository
git clone https://github.com/frongand1998/Warehouse-Message.git
cd Warehouse-Message

# Quick start script
./start.sh       # Mac/Linux
start.bat        # Windows
```

### Manual Start
```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Electron App
cd client
npm install
npm run electron-dev
```

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide (Heroku, VPS, GitHub Releases)
- **[ELECTRON_GUIDE.md](ELECTRON_GUIDE.md)** - Electron architecture and features
- **[TEST_GUIDE.md](TEST_GUIDE.md)** - Testing checklist and troubleshooting
- **[README.md](README.md)** - This file (setup and usage)

## 🛠️ Tech Stack

- **Desktop Framework**: Electron (cross-platform desktop apps)
- **Frontend**: React.js 18.2.0
- **Backend**: Node.js + Express.js (simple API server)
- **Storage**: localStorage + in-memory
- **Build Tool**: electron-builder

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example (optional):
```bash
cp .env.example .env
```

4. Configure environment variables (optional):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/warehouse-message  # Optional: for persistent storage
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Usage

1. Open the desktop app
2. Use the clipboard monitoring feature to track copied content
3. View clipboard history with `Ctrl+Shift+V` (or `Cmd+Shift+V`)
4. Store important messages for later access
5. Manage presets for frequently used content
6. Toggle window with `Ctrl+Shift+W` (or `Cmd+Shift+W`)

## API Endpoints

### POST `/api/messages`
Store a message with optional images

**Request:**
- `text` (string, required): Message text
- `images` (files, optional): Up to 10 image files

**Response:**
```json
{
  "success": true,
  "message": "Message stored successfully",
  "data": {
    "id": "...",
    "text": "...",
    "images": [...]
  }
}
```

### GET `/api/messages`
Get recent messages (last 50)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "messages": [...]
}
```

## Project Structure

```
Warehouse-Message/
├── server/
│   ├── models/
│   │   └── Message.js       # MongoDB schema (optional)
│   ├── uploads/             # Uploaded images storage
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js            # Express API server
├── client/
│   ├── public/
│   │   ├── electron.js       # Electron main process
│   │   └── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js           # React app with Electron IPC
│   │   ├── index.css
│   │   └── index.js
│   ├── .gitignore
│   └── package.json          # Includes Electron scripts
└── README.md
```

## Running as Desktop Application

### Development Mode
1. Start the backend server (in one terminal):
```bash
cd server
npm start
```

2. Start the Electron app (in another terminal):
```bash
cd client
npm run electron-dev
```

This will:
- Start React dev server on port 3000
- Launch Electron window automatically
- Enable hot reload for React changes
- Open DevTools for debugging

### Desktop Features

**Clipboard Monitoring:**
- Automatically tracks all clipboard changes (text and images)
- Works across all applications (Chrome, Word, etc.)
- Stores up to 50 recent clipboard items
- Real-time notifications when clipboard changes

**Global Shortcuts:**
- `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) - Show clipboard history
- `Ctrl+Shift+W` (or `Cmd+Shift+W` on Mac) - Toggle window visibility

**System Tray:**
- Click tray icon to show/hide window
- Right-click for menu options
- Continues running in background when window is closed

**Preset Management:**
- Save text and image presets offline (localStorage)
- Send all presets at once (batch mode with 1-second delays)
- Send individual presets
- Copy/paste buttons for each preset item
- Persists across application restarts

### Building for Distribution

Build standalone executables for distribution:

```bash
cd client

# Build for your platform
npm run dist -- --win    # Windows .exe installer
npm run dist -- --mac    # macOS .dmg
npm run dist -- --linux  # Linux .AppImage + .deb

# Build for all platforms
npm run dist
```

**Output files** will be in `client/dist/`:
- Windows: `Warehouse Message Setup.exe`
- macOS: `Warehouse Message.dmg`
- Linux: `Warehouse Message.AppImage`, `warehouse-message_1.0.0_amd64.deb`

**Distribution options:**
- Upload to GitHub Releases
- Host on your own server
- Share via Google Drive/Dropbox
- Publish to Microsoft Store / Mac App Store

📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

## 🚢 Deployment

### Backend Server

Deploy the Express server to production:

**Quick Deploy (Vercel):**
```bash
cd server
# Deploy via Vercel dashboard at vercel.com
# Set root directory to "server"
# No environment variables required
```

**Other Options:**
- Railway.app (easiest)
- Heroku
- DigitalOcean VPS with PM2
- AWS EC2
- Your own server

### Desktop App Distribution

1. **Build** the app for your target platform(s)
2. **Upload** to GitHub Releases or file hosting
3. **Share** download link with users
4. **Optional**: Set up auto-updates with electron-updater

📖 Complete deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## 📖 Additional Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Server deployment, app distribution, auto-updates
- **[ELECTRON_GUIDE.md](ELECTRON_GUIDE.md)** - Electron architecture, clipboard monitoring, IPC
- **[TEST_GUIDE.md](TEST_GUIDE.md)** - Testing checklist, troubleshooting, known issues

## 🐛 Troubleshooting

## 🐛 Troubleshooting

### Electron Issues
- **App won't start**: Ensure backend (port 5000) is running first
- **Clipboard monitoring not working**: Check OS clipboard access permissions
- **Global shortcuts not responding**: Another app might be using same shortcuts
- **Tray icon missing**: Verify `public/favicon.ico` exists

### Server Issues
- **Port already in use**: Kill existing process on port 5000 or 3000
- **MongoDB errors**: MongoDB is optional - app works without it
- **CORS errors**: Check proxy setting in `client/package.json`
- **Image upload failed**: Ensure image is in supported format (JPEG/PNG/GIF)

📖 Detailed troubleshooting: [TEST_GUIDE.md](TEST_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- React framework
- electron-builder for packaging

## 📧 Support

For issues or questions:
- Check the documentation files (DEPLOYMENT.md, ELECTRON_GUIDE.md, TEST_GUIDE.md)
- Review console logs and error messages
- Open an issue on GitHub

---

**Made with ❤️ for efficient clipboard management**
