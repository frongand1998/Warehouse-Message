# 🚀 Free Deployment Guide - Step by Step

You're deploying with the **FREE option**: Heroku (backend) + GitHub Releases (desktop app distribution)

**Total Cost**: $0/month 💰

---

## Part 1: Deploy Backend to Heroku (5 minutes)

### Step 1: Login to Heroku

```bash
heroku login -i
```

Enter your Heroku credentials:
- Email: your-email@example.com
- Password: your-password

**Don't have a Heroku account?**
- Sign up at: https://signup.heroku.com/ (free)
- Verify your email
- Then run `heroku login -i` again

### Step 2: Create Heroku App

```bash
cd /workspaces/Warehouse-Message/server
heroku create warehouse-message-server
```

**Note**: If that name is taken, try:
- `warehouse-message-server-YOUR_NAME`
- `fb-messenger-app-YOUR_NAME`
- Or let Heroku auto-generate: `heroku create` (no name)

### Step 3: Set Environment Variables

```bash
heroku config:set FACEBOOK_PAGE_ACCESS_TOKEN=EAAgKRlCmylgBQAYdVi4Yz8F87n86ZAhOqGu1X6Q6jqYAcdpwFZAZAmVoAd9WqhK1ZCrZCgdEcI1opDgPZAArwGt1FGZCydwNdJouoDsT1ZAMVZCt6223XMWDX7cADHhlNjukwQDZAnXLlTiwX9eRLA5aDbsqN8l61hW19Xq2ZBymxUW56fgRarfwEBVKzJcD7U12ETqhZCkcz5dOFwZDZD

heroku config:set FACEBOOK_PAGE_ID=956640500855155

heroku config:set RECIPIENT_ID=25189818513994127

heroku config:set WEBHOOK_VERIFY_TOKEN=my_webhook_token_123
```

### Step 4: Initialize Git and Deploy

```bash
# Initialize git (if not already)
git init

# Add files
git add .

# Commit
git commit -m "Deploy to Heroku"

# Connect to Heroku remote
heroku git:remote -a warehouse-message-server

# Deploy!
git push heroku main
```

**If you're on 'master' branch instead of 'main':**
```bash
git push heroku master
```

### Step 5: Verify Deployment

```bash
# Check if app is running
heroku ps

# View logs
heroku logs --tail

# Open in browser
heroku open
```

Your server is now live at: `https://warehouse-message-server.herokuapp.com`

---

## Part 2: Configure Facebook Webhook (Optional but Recommended)

Now that your server is public, update the Facebook webhook:

1. Go to: https://developers.facebook.com/apps/
2. Select your app
3. Go to **Messenger** → **Settings**
4. In **Webhooks** section, click **Add Callback URL**
5. Enter:
   - Callback URL: `https://warehouse-message-server.herokuapp.com/api/messenger/webhook`
   - Verify Token: `my_webhook_token_123`
6. Click **Verify and Save**
7. Subscribe to webhook fields: `messages`, `messaging_postbacks`

---

## Part 3: Build Desktop App (2 minutes)

### Step 1: Update API URL

```bash
cd /workspaces/Warehouse-Message/client

# Create production environment file
echo "REACT_APP_API_URL=https://warehouse-message-server.herokuapp.com" > .env.production
```

**Replace** `warehouse-message-server` with your actual Heroku app name!

### Step 2: Build the App

```bash
# Build React app
npm run build

# Build Electron app (this may take a few minutes)
npm run dist
```

**Expected output location:**
- Windows: `client/dist/Warehouse Message Setup 1.0.0.exe`
- Mac: `client/dist/Warehouse Message-1.0.0.dmg`
- Linux: `client/dist/Warehouse Message-1.0.0.AppImage`

**Note**: In Codespaces, you can only build for Linux. To build for Windows/Mac:
- Clone the repo on your local machine
- Run `npm run dist` there

---

## Part 4: Distribute via GitHub Releases (3 minutes)

### Step 1: Commit and Push Everything

```bash
cd /workspaces/Warehouse-Message

# Add all changes
git add .

# Commit
git commit -m "Production ready - Electron desktop app"

# Push to GitHub
git push origin main
```

### Step 2: Create GitHub Release

1. Go to: `https://github.com/frongand1998/Warehouse-Message/releases`
2. Click **"Draft a new release"**
3. Fill in:
   - **Tag version**: `v1.0.0`
   - **Release title**: `Warehouse Message v1.0.0 - Desktop App`
   - **Description**:
   ```
   # Warehouse Message Desktop App
   
   Facebook Messenger integration with clipboard monitoring.
   
   ## Features
   - Send text and images to Facebook Messenger
   - System-wide clipboard monitoring
   - Global keyboard shortcuts (Ctrl+Shift+V, Ctrl+Shift+W)
   - System tray integration
   - Preset management
   
   ## Download
   - Windows: Download `Warehouse Message Setup 1.0.0.exe`
   - macOS: Download `Warehouse Message-1.0.0.dmg`
   - Linux: Download `Warehouse Message-1.0.0.AppImage`
   
   ## Installation
   - Windows: Run the .exe file
   - macOS: Open .dmg, drag to Applications
   - Linux: `chmod +x *.AppImage && ./Warehouse-Message-1.0.0.AppImage`
   
   ## Setup
   Backend server: https://warehouse-message-server.herokuapp.com
   ```

4. **Attach files**: Drag and drop the built files from `client/dist/`
5. Click **"Publish release"**

### Step 3: Get Download Link

Your download link will be:
```
https://github.com/frongand1998/Warehouse-Message/releases/latest
```

---

## Part 5: Test Everything

### Test Backend

```bash
# Test if server is responding
curl https://warehouse-message-server.herokuapp.com/

# Test send endpoint (should get error without proper data)
curl https://warehouse-message-server.herokuapp.com/api/messenger/send -X POST
```

### Test Desktop App

1. Download the app from your GitHub release
2. Install it on your computer
3. Run the app
4. Test features:
   - [ ] App opens successfully
   - [ ] Can see UI
   - [ ] System tray icon appears
   - [ ] Try sending a message to Facebook
   - [ ] Copy text in another app (should be detected)
   - [ ] Press Ctrl+Shift+V (should show clipboard history)

---

## 📊 What You've Deployed

✅ **Backend Server**
- URL: `https://warehouse-message-server.herokuapp.com`
- Cost: FREE (Heroku free tier - 550 dyno hours/month)
- Uptime: 24/7 (sleeps after 30 min inactivity, wakes on request)

✅ **Desktop App**
- Distribution: GitHub Releases (FREE)
- Platforms: Windows, macOS, Linux
- Updates: Manual (users download new version)

---

## 🎉 You're Live!

Share this with users:
```
Download Warehouse Message Desktop App:
https://github.com/frongand1998/Warehouse-Message/releases/latest

Features:
- Send messages to Facebook Messenger
- Monitor clipboard across all apps
- Global shortcuts (Ctrl+Shift+V, Ctrl+Shift+W)
- System tray integration
```

---

## 📈 Monitoring Your App

### Check Server Status
```bash
# View logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart if needed
heroku restart
```

### Check Usage
- Dashboard: https://dashboard.heroku.com/apps/warehouse-message-server
- Free tier limits:
  - 550 dyno hours/month (enough for 24/7 if verified)
  - Sleeps after 30 min inactivity
  - 10,000 rows database (if using Postgres)

---

## 🔄 Updating Your App

### Update Backend
```bash
cd /workspaces/Warehouse-Message/server
# Make changes
git add .
git commit -m "Update backend"
git push heroku main
```

### Update Desktop App
```bash
cd /workspaces/Warehouse-Message/client
# Make changes
# Update version in package.json: "version": "1.0.1"
npm run build
npm run dist
# Upload new files to a new GitHub release (v1.0.1)
```

---

## ⚠️ Important Notes

### Heroku Free Tier Limits
- App sleeps after 30 min inactivity
- First request after sleep takes ~10 seconds
- 550 dyno hours/month (22.9 days)
- To get more hours: Verify account with credit card (no charge)

### Facebook Token Expiration
- Page Access Tokens can expire
- Generate long-lived tokens (60 days or never expire)
- Update with: `heroku config:set FACEBOOK_PAGE_ACCESS_TOKEN=new_token`

### Getting Correct RECIPIENT_ID
If sending messages fails:
1. Send a message to your Facebook Page
2. Check Heroku logs: `heroku logs --tail`
3. Look for: "Message received from PSID: XXXXXXXXX"
4. Update: `heroku config:set RECIPIENT_ID=XXXXXXXXX`

---

## 💡 Next Steps

1. ✅ **Verify deployment works** - Test sending a message
2. ✅ **Share with users** - Send them the GitHub release link
3. ✅ **Monitor logs** - Check for errors: `heroku logs --tail`
4. ✅ **Get feedback** - Ask users to report issues
5. ✅ **Plan updates** - Schedule regular improvements

---

## 🆘 Troubleshooting

### "App not found"
```bash
heroku apps
heroku git:remote -a YOUR_ACTUAL_APP_NAME
```

### "Authentication failed"
```bash
heroku login -i
```

### "Push rejected"
```bash
git remote -v  # Check if heroku remote exists
heroku git:remote -a warehouse-message-server
```

### "Build failed"
```bash
heroku logs --tail  # Check error logs
```

### "App crashes on startup"
```bash
heroku logs --tail
# Common issue: Missing environment variables
heroku config  # Check if all vars are set
```

---

## 📞 Need Help?

- Heroku Docs: https://devcenter.heroku.com/
- GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github
- Check: [DEPLOYMENT.md](DEPLOYMENT.md) for more options
- Check: [TEST_GUIDE.md](TEST_GUIDE.md) for testing tips

**Congratulations! Your app is deployed and free! 🎉**
