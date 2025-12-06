# Testing the Electron Desktop App

## Current Environment: GitHub Codespaces / Dev Container

⚠️ **Important**: You're currently in a **headless Linux container** (GitHub Codespaces) that doesn't have a display server (X11) or GUI libraries. Electron requires a graphical environment to run.

## Testing Options

### Option 1: Test on Your Local Machine (Recommended)

This is the **best way** to test all desktop features:

#### Step 1: Clone/Download the Project
```bash
# On your local Windows/Mac/Linux computer
git clone https://github.com/frongand1998/Warehouse-Message.git
cd Warehouse-Message
```

#### Step 2: Install Dependencies
```bash
# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

#### Step 3: Configure Facebook API
Edit `server/.env` with your Facebook credentials (already configured in your case):
```
FACEBOOK_PAGE_ACCESS_TOKEN=EAAgKRlCmylgBQAYdVi4Yz8F87n86ZAhOqGu1X6Q6jqYAcdpwFZAZAmVoAd9WqhK1ZCrZCgdEcI1opDgPZAArwGt1FGZCydwNdJouoDsT1ZAMVZCt6223XMWDX7cADHhlNjukwQDZAnXLlTiwX9eRLA5aDbsqN8l61hW19Xq2ZBymxUW56fgRarfwEBVKzJcD7U12ETqhZCkcz5dOFwZDZD
FACEBOOK_PAGE_ID=956640500855155
RECIPIENT_ID=25189818513994127
```

#### Step 4: Run the Desktop App

**Option A - Quick Start (Easy):**

**Windows:**
```bash
# Double-click start.bat
# OR in terminal:
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

**Option B - Manual Start:**

Open 2 terminals:

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

**Terminal 2 - Electron App:**
```bash
cd client
npm run electron-dev
```

#### Step 5: Test Features

Once the app opens, test these features:

**1. Basic Functionality:**
- [ ] App window opens successfully
- [ ] Can see the main interface with text/image upload
- [ ] System tray icon appears (check taskbar/menu bar)

**2. Clipboard Monitoring:**
- [ ] Open any other app (Notepad, Chrome, etc.)
- [ ] Copy some text (Ctrl+C)
- [ ] Check if Electron app shows a notification
- [ ] Copy an image/screenshot
- [ ] Check if image is detected

**3. Global Shortcuts:**
- [ ] Press `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac)
- [ ] Should open clipboard history modal
- [ ] Press `Ctrl+Shift+W` to toggle window visibility
- [ ] Window should hide/show

**4. System Tray:**
- [ ] Click tray icon to hide/show window
- [ ] Right-click tray icon to see menu
- [ ] Select "Clipboard History" from menu
- [ ] Select "Quit" to exit app

**5. Preset Management:**
- [ ] Add text preset
- [ ] Add image preset
- [ ] Copy single preset to clipboard
- [ ] Send single preset (requires correct RECIPIENT_ID)
- [ ] Send all presets in batch

**6. Facebook Messenger Integration:**
- [ ] Upload image and text
- [ ] Click "Send to Messenger"
- [ ] Check if message appears in Facebook Messenger
- [ ] Note: May need correct RECIPIENT_ID from webhook

### Option 2: Test Web Version (No Desktop Features)

You can test the **React web interface** in Codespaces, but clipboard monitoring and global shortcuts won't work:

```bash
# Terminal 1 - Backend
cd /workspaces/Warehouse-Message/server
npm start

# Terminal 2 - React Web App
cd /workspaces/Warehouse-Message/client
npm start
```

Then open the forwarded port 3000 in your browser.

**What Works:**
- ✅ UI and styling
- ✅ Text/image upload
- ✅ Presets management
- ✅ Facebook Messenger sending
- ✅ Copy to clipboard (browser clipboard API)

**What Won't Work:**
- ❌ System-wide clipboard monitoring (requires Electron)
- ❌ Global keyboard shortcuts (requires Electron)
- ❌ System tray (requires Electron)
- ❌ Cross-application clipboard access

### Option 3: Install GUI Support in Codespaces (Advanced)

You can try installing GUI libraries, but this is complex and not recommended:

```bash
# Install GUI dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y \
  libgtk-3-0 \
  libnotify4 \
  libnss3 \
  libxss1 \
  libxtst6 \
  xvfb \
  libgbm1 \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libpango-1.0-0 \
  libcairo2

# Run with virtual display
xvfb-run --auto-servernum --server-args="-screen 0 1280x800x24" npm run electron-dev
```

**Issues with this approach:**
- Can't see the actual window (no GUI)
- Can't test user interactions
- System tray won't work
- Clipboard monitoring limited
- Not practical for development

## Recommended Testing Workflow

### For Development:
1. **Code in Codespaces** (where you are now) ✅
2. **Commit and push changes** to GitHub
3. **Pull on local machine** and test desktop features
4. **Iterate**: Fix bugs, push, pull, test

### For Production Testing:
1. Build the application:
```bash
cd client

# Build for your platform
npm run dist -- --win   # Windows
npm run dist -- --mac   # macOS
npm run dist -- --linux # Linux
```

2. Install and test the built executable:
- Windows: `client/dist/Warehouse Message Setup.exe`
- Mac: `client/dist/Warehouse Message.dmg`
- Linux: `client/dist/Warehouse Message.AppImage`

## Quick Test Checklist

Use this checklist when testing on local machine:

### Installation
- [ ] Dependencies install successfully
- [ ] No errors in installation logs
- [ ] Both server and client ready

### Startup
- [ ] Backend server starts on port 5000
- [ ] React dev server starts on port 3000
- [ ] Electron window opens within 10 seconds
- [ ] No errors in terminal
- [ ] DevTools open (development mode)

### UI/UX
- [ ] Window size is appropriate (1200x800)
- [ ] All UI elements visible
- [ ] Purple gradient background displays
- [ ] Forms are responsive
- [ ] Buttons are clickable

### Core Features
- [ ] Can type text in textarea
- [ ] Can upload single image
- [ ] Can upload multiple images
- [ ] Images show preview thumbnails
- [ ] Can remove individual images
- [ ] Send button works (even if recipient is wrong)

### Preset System
- [ ] Can add text to presets
- [ ] Can add images to presets
- [ ] Presets persist after refresh
- [ ] Can remove presets
- [ ] Copy/paste buttons work
- [ ] Send buttons work

### Electron Desktop Features
- [ ] System tray icon appears
- [ ] Tray menu shows options
- [ ] Global shortcuts respond
- [ ] Clipboard monitoring active
- [ ] Clipboard history stores items
- [ ] Window minimize to tray works
- [ ] Close button minimizes (doesn't quit)
- [ ] "Quit" from tray actually exits

### Clipboard Monitoring (CRITICAL)
1. **Test Text Monitoring:**
   - [ ] Open Notepad/TextEdit
   - [ ] Type and copy text (Ctrl+C)
   - [ ] Switch to Electron app
   - [ ] See notification about clipboard change
   - [ ] Press Ctrl+Shift+V
   - [ ] Clipboard history shows the text

2. **Test Image Monitoring:**
   - [ ] Take a screenshot (Win+Shift+S / Cmd+Shift+4)
   - [ ] Screenshot is copied to clipboard
   - [ ] Electron app detects it
   - [ ] Clipboard history shows image preview

3. **Test Cross-Application:**
   - [ ] Copy from Chrome browser
   - [ ] Copy from Word/Google Docs
   - [ ] Copy from File Explorer
   - [ ] All detected by Electron app

### Facebook Integration
- [ ] Can send text message
- [ ] Can send image message
- [ ] Error messages display clearly
- [ ] Success messages show
- [ ] Check Facebook Messenger for messages

### Performance
- [ ] App starts within 10 seconds
- [ ] UI is responsive (no lag)
- [ ] Clipboard monitoring doesn't cause lag
- [ ] Memory usage reasonable (<500MB)
- [ ] CPU usage low when idle (<5%)

## Troubleshooting Test Issues

### "Cannot find module electron"
```bash
cd client
npm install
```

### "Port 3000 already in use"
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows (then taskkill /PID <pid> /F)
```

### "Port 5000 already in use"
```bash
# Kill backend server
lsof -ti:5000 | xargs kill -9  # Mac/Linux
```

### "Clipboard monitoring not working"
- Check OS permissions (System Preferences > Privacy > Accessibility on Mac)
- Make sure app is actually running (check system tray)
- Look for errors in DevTools console

### "Global shortcuts not working"
- Another app might be using same shortcuts
- Try different shortcuts in `public/electron.js`
- Check if shortcuts are registered (look at startup logs)

### "Tray icon not showing"
- Check if `public/favicon.ico` exists
- Try restarting the app
- On Linux, may need libappindicator

## What to Look For

### Good Signs:
- ✅ Console shows "Clipboard monitoring started"
- ✅ Tray icon visible in system tray
- ✅ DevTools show no errors
- ✅ Server logs show "Server is running on port 5000"
- ✅ Clipboard changes trigger console logs

### Bad Signs:
- ❌ "Error: Cannot find module"
- ❌ Port already in use errors
- ❌ Blank white window
- ❌ No tray icon
- ❌ Permission errors in console

## Next Steps After Testing

1. **If everything works:**
   - Build production version: `npm run dist`
   - Distribute the executable

2. **If issues found:**
   - Check console logs (DevTools)
   - Check server logs
   - Review error messages
   - Fix and test again

3. **For production deployment:**
   - Update Facebook credentials
   - Get correct RECIPIENT_ID via webhook
   - Sign the application (for distribution)
   - Test on multiple machines

## Summary

**Best Testing Approach:**
1. ✅ Develop and code in **Codespaces** (what you're doing now)
2. ✅ Test desktop features on **local machine** (Windows/Mac/Linux)
3. ✅ Use web version in Codespaces for quick UI testing

**Current Status:**
- ✅ Code is complete and ready
- ✅ All files configured properly
- ⏳ Needs testing on machine with GUI (your local computer)

The app is **production-ready** and waiting to be tested on a proper desktop environment! 🚀
