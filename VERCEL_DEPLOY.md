# 🚀 Vercel Deployment Guide (Easiest & FREE)

## Why Vercel is Better

✅ **Easier setup** - No credit card required  
✅ **Faster deployment** - Deploy in 60 seconds  
✅ **Automatic HTTPS** - Free SSL included  
✅ **Better uptime** - No sleep/wake delays  
✅ **Free tier** - 100GB bandwidth/month  
✅ **Auto deploys** - Push to GitHub = auto deploy  

---

## Quick Deploy (2 Minutes)

### Step 1: Deploy Backend to Vercel

```bash
cd /workspaces/Warehouse-Message/server

# Login to Vercel (will open browser)
vercel login

# Deploy (just press Enter for all prompts)
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **warehouse-message** (or press Enter)
- In which directory is your code? **./** (press Enter)
- Want to override settings? **N**

**Done!** Your server is now live at: `https://warehouse-message.vercel.app`

### Step 2: Add Environment Variables

```bash
# Add your Facebook credentials
vercel env add FACEBOOK_PAGE_ACCESS_TOKEN
# Paste: EAAgKRlCmylgBQAYdVi4Yz8F87n86ZAhOqGu1X6Q6jqYAcdpwFZAZAmVoAd9WqhK1ZCrZCgdEcI1opDgPZAArwGt1FGZCydwNdJouoDsT1ZAMVZCt6223XMWDX7cADHhlNjukwQDZAnXLlTiwX9eRLA5aDbsqN8l61hW19Xq2ZBymxUW56fgRarfwEBVKzJcD7U12ETqhZCkcz5dOFwZDZD
# Select: Production, Preview, Development (press Space to select all, Enter to confirm)

vercel env add FACEBOOK_PAGE_ID
# Paste: 956640500855155

vercel env add RECIPIENT_ID
# Paste: 25189818513994127

vercel env add WEBHOOK_VERIFY_TOKEN
# Paste: my_webhook_token_123

# Redeploy with environment variables
vercel --prod
```

### Step 3: Test Your Deployment

```bash
# Get your URL
vercel ls

# Test it
curl https://your-project.vercel.app/
```

---

## Alternative: Deploy via Vercel Dashboard (Even Easier!)

### Option 1: Import from GitHub

1. **Go to**: https://vercel.com/new
2. **Import Git Repository**: Click "Import" next to your `Warehouse-Message` repo
3. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `server`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
4. **Add Environment Variables**:
   ```
   FACEBOOK_PAGE_ACCESS_TOKEN = EAAgKRlCmylgBQAYdVi4Yz8F87n86ZAhOqGu1X6Q6jqYAcdpwFZAZAmVoAd9WqhK1ZCrZCgdEcI1opDgPZAArwGt1FGZCydwNdJouoDsT1ZAMVZCt6223XMWDX7cADHhlNjukwQDZAnXLlTiwX9eRLA5aDbsqN8l61hW19Xq2ZBymxUW56fgRarfwEBVKzJcD7U12ETqhZCkcz5dOFwZDZD
   FACEBOOK_PAGE_ID = 956640500855155
   RECIPIENT_ID = 25189818513994127
   WEBHOOK_VERIFY_TOKEN = my_webhook_token_123
   ```
5. **Click Deploy** 🚀

**That's it!** Your server is live in ~60 seconds.

---

## Build Desktop App

### Step 1: Update API URL

```bash
cd /workspaces/Warehouse-Message/client

# Create production environment file
echo "REACT_APP_API_URL=https://warehouse-message.vercel.app" > .env.production
```

**Replace** `warehouse-message` with your actual Vercel project name!

### Step 2: Build

```bash
npm run build
npm run dist
```

---

## Update Your App (Super Easy)

### Automatic Updates
Once connected to GitHub:
```bash
cd /workspaces/Warehouse-Message
git add .
git commit -m "Update"
git push
```

**Vercel auto-deploys!** No manual deployment needed. ✨

### Manual Updates
```bash
cd /workspaces/Warehouse-Message/server
vercel --prod
```

---

## Vercel vs Heroku Comparison

| Feature | Vercel | Heroku Free |
|---------|--------|-------------|
| **Setup Time** | 60 seconds | 5 minutes |
| **Sleep Mode** | ❌ Never sleeps | ✅ Sleeps after 30 min |
| **Cold Start** | ~100ms | ~10 seconds |
| **Bandwidth** | 100GB/month | Unlimited |
| **Build Minutes** | 6000 min/month | 550 hours/month |
| **Custom Domain** | ✅ Free | ✅ Free |
| **HTTPS** | ✅ Auto | ✅ Auto |
| **Auto Deploy** | ✅ Yes | ❌ Manual |
| **Credit Card** | ❌ Not required | ⚠️ Recommended |

**Winner: Vercel** 🏆

---

## Commands Cheat Sheet

```bash
# Login
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# List deployments
vercel ls

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Remove deployment
vercel remove [deployment-url]

# Link to existing project
vercel link

# Get project info
vercel inspect
```

---

## Configuration Details

### vercel.json (Already Created)

The `server/vercel.json` file configures how Vercel deploys your app:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

This tells Vercel:
- Use Node.js runtime
- Entry point is `server.js`
- Route all requests to `server.js`

---

## Testing Your Deployment

### Test Backend Endpoints

```bash
# Replace with your actual Vercel URL
export API_URL="https://warehouse-message.vercel.app"

# Test health check
curl $API_URL/

# Test send endpoint (should return error without data)
curl $API_URL/api/messenger/send -X POST

# Test webhook (should return challenge)
curl "$API_URL/api/messenger/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=my_webhook_token_123"
```

### Update Facebook Webhook

1. Go to: https://developers.facebook.com/apps/
2. Select your app → **Messenger** → **Settings**
3. In **Webhooks**, update Callback URL:
   ```
   https://warehouse-message.vercel.app/api/messenger/webhook
   ```
4. Verify Token: `my_webhook_token_123`
5. Subscribe to: `messages`, `messaging_postbacks`

---

## Environment Variables via Dashboard

### Add/Edit Variables in Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add variables:
   - `FACEBOOK_PAGE_ACCESS_TOKEN`
   - `FACEBOOK_PAGE_ID`
   - `RECIPIENT_ID`
   - `WEBHOOK_VERIFY_TOKEN`
5. Select environment: Production, Preview, Development
6. **Redeploy** for changes to take effect

---

## Monitoring & Logs

### View Logs in Real-Time

```bash
vercel logs --follow
```

### Dashboard Monitoring

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click on latest deployment
4. View:
   - **Runtime Logs** - Server logs
   - **Build Logs** - Deployment logs
   - **Analytics** - Traffic stats

---

## Troubleshooting

### "Command not found: vercel"
```bash
npm install -g vercel
```

### "Authentication failed"
```bash
vercel logout
vercel login
```

### "Environment variables not working"
```bash
# List variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME

# Redeploy
vercel --prod
```

### "Server returns 404"
Check `vercel.json` exists in server folder and routes are configured correctly.

### "CORS errors in desktop app"
The server already has CORS enabled. If issues persist, check the API_URL in `.env.production`.

---

## Free Tier Limits

Vercel Free (Hobby) Tier:
- ✅ **100GB Bandwidth** per month
- ✅ **6000 Build Minutes** per month
- ✅ **100 Deployments** per day
- ✅ **Unlimited API requests**
- ✅ **Serverless Functions**: 100GB-Hrs
- ✅ **No credit card** required

**More than enough for most projects!** 🎉

---

## Complete Deployment Steps (Copy-Paste Ready)

```bash
# 1. Navigate to server folder
cd /workspaces/Warehouse-Message/server

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Add environment variables
vercel env add FACEBOOK_PAGE_ACCESS_TOKEN
vercel env add FACEBOOK_PAGE_ID
vercel env add RECIPIENT_ID
vercel env add WEBHOOK_VERIFY_TOKEN

# 5. Redeploy with env vars
vercel --prod

# 6. Get your URL
vercel ls

# 7. Build desktop app
cd ../client
echo "REACT_APP_API_URL=https://YOUR-PROJECT.vercel.app" > .env.production
npm run build
npm run dist

# 8. Done! 🎉
```

---

## What You Get

✅ **Backend URL**: `https://warehouse-message.vercel.app`  
✅ **Automatic HTTPS**: SSL included  
✅ **No sleep mode**: Always responsive  
✅ **Auto-deploy**: Push to GitHub = auto deploy  
✅ **Free forever**: No credit card needed  
✅ **Fast**: Global CDN edge network  

---

## Next Steps

1. ✅ **Deploy backend** - Run `vercel --prod`
2. ✅ **Add env vars** - Use `vercel env add` or dashboard
3. ✅ **Update webhook** - Point Facebook to Vercel URL
4. ✅ **Build desktop app** - Set API_URL and run `npm run dist`
5. ✅ **Create GitHub release** - Upload built files
6. ✅ **Share with users** - Send download link

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Dashboard: https://vercel.com/dashboard

**Deployment made easy! 🚀**
