# Deployment Guide - Warehouse Message Desktop App

This guide covers deploying your Electron desktop application for distribution to end users.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Server Deployment](#backend-server-deployment)
3. [Desktop App Distribution](#desktop-app-distribution)
4. [Auto-Update Setup](#auto-update-setup)
5. [Security Considerations](#security-considerations)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Tested the app on your local machine
- ✅ Facebook API credentials (Page Access Token, Page ID)
- ✅ Correct RECIPIENT_ID obtained via webhook
- ✅ Node.js 14+ installed
- ✅ Git repository (for version control)

---

## Backend Server Deployment

The backend (Express server) needs to run 24/7 to handle Facebook Messenger API calls.

### Option 1: Deploy to Heroku (Free/Easy)

#### Step 1: Prepare for Heroku

Create `Procfile` in the `server/` directory:
```bash
cd server
echo "web: node server.js" > Procfile
```

#### Step 2: Update server.js for production

The server already uses `process.env.PORT`, which is perfect for Heroku.

#### Step 3: Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app
cd server
heroku create warehouse-message-server

# Set environment variables
heroku config:set FACEBOOK_PAGE_ACCESS_TOKEN=your_token_here
heroku config:set FACEBOOK_PAGE_ID=956640500855155
heroku config:set RECIPIENT_ID=25189818513994127
heroku config:set WEBHOOK_VERIFY_TOKEN=my_webhook_token_123

# Deploy
git init
git add .
git commit -m "Initial server deployment"
heroku git:remote -a warehouse-message-server
git push heroku main

# View logs
heroku logs --tail
```

Your server will be available at: `https://warehouse-message-server.herokuapp.com`

#### Step 4: Update Client Configuration

Update the API URL in your Electron app:

**In `client/src/App.js`**, add at the top:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

Then replace all `/api/messenger` calls with `${API_URL}/api/messenger`.

Create `client/.env.production`:
```bash
REACT_APP_API_URL=https://warehouse-message-server.herokuapp.com
```

### Option 2: Deploy to VPS (DigitalOcean, AWS, etc.)

#### Step 1: Set Up VPS

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 2: Upload Your Code

```bash
# On your local machine
cd server
scp -r . root@your-server-ip:/var/www/warehouse-message-server/

# Or use Git
ssh root@your-server-ip
cd /var/www
git clone https://github.com/frongand1998/Warehouse-Message.git
cd Warehouse-Message/server
```

#### Step 3: Configure Environment

```bash
# On the server
cd /var/www/warehouse-message-server
nano .env
```

Add your credentials:
```env
PORT=5000
FACEBOOK_PAGE_ACCESS_TOKEN=your_token_here
FACEBOOK_PAGE_ID=956640500855155
RECIPIENT_ID=25189818513994127
WEBHOOK_VERIFY_TOKEN=my_webhook_token_123
```

#### Step 4: Start with PM2

```bash
# Install dependencies
npm install

# Start with PM2
pm2 start server.js --name warehouse-server

# Make PM2 start on boot
pm2 startup
pm2 save

# View logs
pm2 logs warehouse-server
```

#### Step 5: Set Up Nginx (Optional but recommended)

```bash
# Install Nginx
sudo apt-get install nginx

# Configure
sudo nano /etc/nginx/sites-available/warehouse-message
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/warehouse-message /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Set Up SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Your server is now at: `https://your-domain.com`

### Option 3: Deploy to Railway.app (Easiest)

1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `server` folder
4. Add environment variables in the Railway dashboard
5. Deploy automatically on push

---

## Desktop App Distribution

### Build the Desktop Application

#### For Windows

```bash
cd client

# Build for Windows (must be on Windows or use cross-compilation)
npm run dist -- --win

# Output: client/dist/Warehouse Message Setup.exe
```

#### For macOS

```bash
cd client

# Build for macOS (must be on Mac)
npm run dist -- --mac

# Output: client/dist/Warehouse Message.dmg
```

#### For Linux

```bash
cd client

# Build for Linux
npm run dist -- --linux

# Output: 
# - client/dist/Warehouse Message.AppImage
# - client/dist/warehouse-message_1.0.0_amd64.deb
```

#### Build for All Platforms (requires appropriate OS)

```bash
npm run dist
```

### Distribution Options

#### Option 1: Direct Download (Simple)

1. **Upload to File Hosting:**
   - Google Drive
   - Dropbox
   - Your own server
   - Amazon S3

2. **Share the Link:**
   ```
   Windows: https://your-storage.com/Warehouse-Message-Setup.exe
   Mac: https://your-storage.com/Warehouse-Message.dmg
   Linux: https://your-storage.com/Warehouse-Message.AppImage
   ```

3. **Users Download and Install:**
   - Windows: Double-click `.exe`
   - Mac: Open `.dmg`, drag to Applications
   - Linux: `chmod +x *.AppImage && ./Warehouse-Message.AppImage`

#### Option 2: GitHub Releases (Professional)

```bash
# Create a new release on GitHub
# 1. Go to your repository
# 2. Click "Releases" → "Create a new release"
# 3. Tag version: v1.0.0
# 4. Upload the built files:
#    - Warehouse Message Setup.exe (Windows)
#    - Warehouse Message.dmg (macOS)
#    - Warehouse Message.AppImage (Linux)
# 5. Publish release
```

Users can download from:
```
https://github.com/frongand1998/Warehouse-Message/releases/latest
```

#### Option 3: Microsoft Store / Mac App Store (Advanced)

**Windows Store:**
- Requires Windows Developer Account ($19/year)
- Package with `electron-builder` using appx target
- Submit for review (can take days/weeks)

**Mac App Store:**
- Requires Apple Developer Account ($99/year)
- Sign with certificates
- Notarize the app
- Submit for review

#### Option 4: Auto-Update with electron-updater

See [Auto-Update Setup](#auto-update-setup) below.

---

## Auto-Update Setup

Enable automatic updates so users always have the latest version.

### Step 1: Install electron-updater

```bash
cd client
npm install electron-updater --save
```

### Step 2: Update package.json

Add publish configuration:

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "frongand1998",
        "repo": "Warehouse-Message"
      }
    ]
  }
}
```

### Step 3: Update electron.js

Add auto-update code to `client/public/electron.js`:

```javascript
const { app, BrowserWindow, autoUpdater } = require('electron');

// Add this after app.whenReady()
if (!isDev) {
  const server = 'https://your-update-server.com';
  const url = `${server}/update/${process.platform}/${app.getVersion()}`;
  
  autoUpdater.setFeedURL({ url });
  
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 60000); // Check every minute
  
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart to apply updates.'
    };
    
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });
}
```

### Step 4: Publish Updates

```bash
# Build and publish to GitHub Releases
npm run dist -- --publish always

# Or set GH_TOKEN environment variable
export GH_TOKEN="your_github_token"
npm run dist
```

---

## Security Considerations

### 1. Protect Your Credentials

**Never commit `.env` files!**

Add to `.gitignore`:
```
server/.env
client/.env.local
client/.env.production
```

### 2. Code Signing (Highly Recommended)

**Windows:**
- Purchase code signing certificate (~$100-300/year)
- Sign the `.exe` file to avoid "Unknown Publisher" warnings

**macOS:**
- Requires Apple Developer Account ($99/year)
- Sign and notarize the app

**Linux:**
- No signing required for AppImage/deb

### 3. Secure the Backend

- Use HTTPS only (SSL certificate)
- Implement rate limiting
- Add API authentication if needed
- Keep dependencies updated: `npm audit fix`

### 4. Environment Variables

For production desktop app, create `client/.env.production`:
```bash
REACT_APP_API_URL=https://your-production-server.com
```

### 5. Hide Developer Tools

In production, hide DevTools:

```javascript
// In electron.js
if (!isDev) {
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });
}
```

---

## Deployment Checklist

Before releasing to users:

### Backend Server
- [ ] Server deployed and accessible
- [ ] Environment variables configured
- [ ] HTTPS enabled (SSL certificate)
- [ ] Facebook webhook configured with production URL
- [ ] Server logs monitored (PM2, Heroku logs, etc.)
- [ ] Database configured (if using MongoDB)

### Desktop Application
- [ ] Built for target platforms (Windows/Mac/Linux)
- [ ] API URL points to production server
- [ ] Tested on clean machine (fresh install)
- [ ] Code signed (Windows/Mac)
- [ ] Icon/branding updated
- [ ] Version number updated in package.json

### Distribution
- [ ] Executable uploaded to hosting/GitHub releases
- [ ] Download links shared with users
- [ ] Installation instructions provided
- [ ] Auto-update configured (optional)

### Documentation
- [ ] User guide created
- [ ] Known issues documented
- [ ] Support contact provided
- [ ] FAQ prepared

---

## Update Workflow

When releasing updates:

1. **Make changes** in your code
2. **Update version** in `client/package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```
3. **Build new version**:
   ```bash
   cd client
   npm run dist
   ```
4. **Upload to GitHub Releases** or your hosting
5. **If using auto-update**, users get it automatically
6. **Otherwise**, notify users to download new version

---

## Monitoring & Maintenance

### Server Monitoring

**Check server status:**
```bash
# Heroku
heroku ps

# PM2 on VPS
pm2 status
pm2 logs
```

**Monitor uptime:**
- Use [UptimeRobot](https://uptimerobot.com/) (free)
- Set up alerts for downtime

### Error Tracking

**For Backend:**
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay

**For Desktop App:**
- Use Electron's crash reporter
- Log errors to a file or service

### Analytics (Optional)

Track usage with:
- Google Analytics for Electron
- Mixpanel
- Custom analytics endpoint

---

## Troubleshooting Deployment Issues

### "Cannot find module" errors
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
# Clear Electron cache
rm -rf ~/.electron

# Rebuild
npm run dist
```

### App won't connect to server
- Check CORS settings in server
- Verify API_URL in production env
- Check firewall/security groups

### Code signing fails
- Verify certificate is installed
- Check certificate hasn't expired
- Ensure certificate matches app ID

---

## Cost Estimation

### Free Option
- **Server**: Heroku free tier or Railway free plan
- **Distribution**: GitHub Releases (free)
- **Domain**: Use Heroku subdomain (free)
- **Total**: $0/month

### Professional Option
- **Server**: DigitalOcean Droplet ($6/month)
- **Domain**: Namecheap (.com $12/year)
- **SSL**: Let's Encrypt (free)
- **Code Signing**: Windows cert ($100-300/year, one-time)
- **Apple Developer**: $99/year (for Mac distribution)
- **Total**: ~$10-15/month + certificates

---

## Quick Deploy Commands

### Deploy Backend to Heroku
```bash
cd server
heroku create
heroku config:set FACEBOOK_PAGE_ACCESS_TOKEN=xxx
heroku config:set FACEBOOK_PAGE_ID=xxx
heroku config:set RECIPIENT_ID=xxx
git init && git add . && git commit -m "Deploy"
git push heroku main
```

### Build Desktop App
```bash
cd client
npm run build
npm run dist
```

### Publish Update
```bash
cd client
# Update version in package.json first
npm run dist -- --publish always
```

---

## Support & Updates

After deployment:

1. **Monitor Issues**: Check GitHub Issues regularly
2. **Release Schedule**: Plan regular updates (monthly/quarterly)
3. **Security**: Keep dependencies updated with `npm audit`
4. **Backup**: Backup server data and configuration
5. **Documentation**: Keep README and guides updated

---

## Summary

**Simplest Deployment Path:**

1. ✅ Deploy backend to **Heroku** or **Railway** (5 minutes)
2. ✅ Build desktop app with `npm run dist` (2 minutes)
3. ✅ Upload to **GitHub Releases** (3 minutes)
4. ✅ Share download link with users
5. ✅ **Total time: ~15 minutes** ⚡

**Production-Ready Path:**

1. Deploy backend to VPS with PM2 + Nginx + SSL
2. Build and code-sign desktop apps
3. Set up auto-updates
4. Configure monitoring and analytics
5. Create user documentation
6. **Total time: 2-4 hours** 🚀

Your app is now ready for deployment! 🎉
