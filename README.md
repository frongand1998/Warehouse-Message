# Warehouse Message

A cross-platform desktop application (Electron + MERN stack) that sends messages to Facebook Messenger with system-wide clipboard monitoring across all applications.

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

### 📱 Facebook Messenger Integration
- **Text messages**: Send formatted text to Messenger
- **Multiple images**: Upload and send multiple images at once
- **Batch operations**: Send all presets sequentially
- **Status tracking**: Real-time delivery confirmation

### 💼 Preset Management
- **Offline storage**: Save frequently used content (localStorage)
- **Quick send**: One-click sending of saved items
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
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (optional, works without it)
- **API**: Facebook Graph API (Messenger Send API)
- **Build Tool**: electron-builder

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (optional - running locally or MongoDB Atlas)
- A Facebook Page and App with Messenger enabled

## Facebook Setup

### Step 1: Create a Facebook Page (if you don't have one)
1. Go to [Facebook Pages](https://www.facebook.com/pages/creation/)
2. Create a new page for your business/project
3. Complete the page setup

### Step 2: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in your app details (name, contact email)
5. Click "Create App"

### Step 3: Add Messenger Product
1. In your app dashboard, find "Add Products" section
2. Locate "Messenger" and click "Set Up"
3. Scroll down to "Access Tokens" section

### Step 4: Generate a Page Access Token
1. In the Messenger settings, find "Access Tokens" section
2. Click "Add or Remove Pages"
3. Select the Facebook Page you want to use
4. Grant the required permissions
5. Your Page Access Token will appear - **copy this token**
6. This token is needed for your `.env` file as `FACEBOOK_PAGE_ACCESS_TOKEN`

**Important Notes:**
- Page Access Tokens can expire. For production, generate a long-lived token
- To generate a long-lived token, use the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- Keep your token secure and never commit it to version control

### Step 5: Get the Recipient PSID (Page-Scoped ID)

**⚠️ Important:** You cannot read conversations without special permissions that require Facebook App Review. Instead, use the webhook method below:

**Method 1: Using Webhook (Recommended & Easiest)**
1. Make sure your server is running and accessible from the internet (use ngrok for local testing)
2. In Facebook Developers, go to your app → Messenger → Settings
3. Scroll to "Webhooks" section
4. Click "Add Callback URL"
5. Enter your webhook URL: `https://your-domain.com/api/messenger/webhook`
   - For local testing with ngrok: `https://xxxx.ngrok.io/api/messenger/webhook`
6. Enter the verify token from your `.env` file (default: `my_webhook_token_123`)
7. Subscribe to webhook fields: `messages`, `messaging_postbacks`
8. **Send a message to your Facebook Page from your personal account**
9. Check your server console logs - you'll see the PSID printed:
   ```
   📩 Message received from PSID: 1234567890
   👉 Use this as your RECIPIENT_ID in .env file!
   ```
10. Copy that PSID and add it to your `.env` file

**Method 2: Use Your Own User ID (Quick Test)**
- You can try using your Facebook User ID (`25189818513994127` from your access token info)
- This might work for testing, but the actual PSID from the webhook is more reliable

**Method 3: For Production**
- Set up the webhook as described in Method 1
- When users message your page, store their PSIDs in your database
- Use those PSIDs to send messages back to specific users

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

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/warehouse-message
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_PAGE_ID=your_page_id_here
RECIPIENT_ID=your_recipient_psid_here
WEBHOOK_VERIFY_TOKEN=my_webhook_token_123
```

**Note:** You'll get the RECIPIENT_ID after setting up the webhook (see Facebook Setup section)

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

1. Open the web app in your browser
2. Enter your message text (required)
3. Optionally upload an image (JPEG, PNG, or GIF, max 10MB)
4. Optionally enter a specific recipient PSID (otherwise uses the default from .env)
5. Click "Send to Messenger"
6. View the message history below the form

## API Endpoints

### POST `/api/messenger/send`
Send a message with optional image to Facebook Messenger

**Request:**
- `text` (string, required): Message text
- `image` (file, optional): Image file
- `recipientId` (string, optional): Recipient PSID

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "...",
    "recipientId": "...",
    "text": "...",
    "imageUrl": "..."
  }
}
```

### GET `/api/messenger/messages`
Get recent messages

**Response:**
```json
{
  "success": true,
  "messages": [...]
}
```

### GET `/api/messenger/messages/:id`
Get a specific message by ID

## Project Structure

```
Warehouse-Message/
├── server/
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   └── messenger.js
│   ├── uploads/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
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

**Quick Deploy (Heroku):**
```bash
cd server
heroku create warehouse-message-server
heroku config:set FACEBOOK_PAGE_ACCESS_TOKEN=xxx
heroku config:set FACEBOOK_PAGE_ID=xxx
heroku config:set RECIPIENT_ID=xxx
git init && git add . && git commit -m "Deploy"
git push heroku main
```

**Other Options:**
- Railway.app (easiest)
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

### Facebook API Errors
- **Error 190 (Invalid Token)**: Check `FACEBOOK_PAGE_ACCESS_TOKEN` in `.env`
- **Error 100 (Invalid Recipient)**: Use webhook method to get correct PSID
- **Image upload failed**: Ensure image is under 10MB and in supported format (JPEG/PNG/GIF)

### Server Issues
- **Port already in use**: Kill existing process on port 5000 or 3000
- **MongoDB errors**: MongoDB is optional - app works without it
- **CORS errors**: Check proxy setting in `client/package.json`

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
- React framework by Facebook
- Facebook Messenger API
- electron-builder for packaging

## 📧 Support

For issues or questions:
- Check the documentation files (DEPLOYMENT.md, ELECTRON_GUIDE.md, TEST_GUIDE.md)
- Review console logs and error messages
- Open an issue on GitHub

---

**Made with ❤️ for easier Facebook Messenger communication**
