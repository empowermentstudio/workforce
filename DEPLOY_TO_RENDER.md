# Deploying Church Volunteer Hub to Render

This guide gets your app live on the internet in about 10 minutes — no servers to manage.

---

## Why Render?

| Feature | Render free | Render Starter ($7/mo) |
|---|---|---|
| Node.js hosting | ✅ | ✅ |
| Cron jobs (daily reminders) | Built into app | Built into app |
| Persistent storage | ❌ data resets on deploy | ✅ 1GB disk |
| Custom domain | ✅ | ✅ |
| Auto SSL (HTTPS) | ✅ | ✅ |
| Sleep after inactivity | Yes (15 min) | No — always on |

**Recommendation:** Start on free to test, upgrade to Starter ($7/mo) before go-live so your volunteer data persists.

---

## Step 1 — Push to GitHub

You need your code in a GitHub repo for Render to deploy from.

```bash
# In the church-volunteer-hub folder:
git init
git add .
git commit -m "Initial commit"

# Create a repo at github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/church-volunteer-hub.git
git push -u origin main
```

---

## Step 2 — Create a Render account

Go to [render.com](https://render.com) and sign up (free, no credit card needed for the free tier).

---

## Step 3 — Deploy from GitHub

1. In the Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account and select the `church-volunteer-hub` repo
3. Render will auto-detect the `render.yaml` file and pre-fill all settings
4. Review and click **"Create Web Service"**

That's it — Render builds and deploys your app automatically.

---

## Step 4 — Add your credentials (Environment Variables)

In your Render service dashboard → **Environment** tab, add these variables:

| Variable | Value |
|---|---|
| `CHURCH_NAME` | Grace Community Church |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) → API Keys |
| `EMAIL_FROM` | Your verified sender (e.g. `reminders@yourchurch.org`) |
| `TWILIO_ACCOUNT_SID` | From [console.twilio.com](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_PHONE` | Your Twilio number (e.g. `+19725550200`) |
| `REMINDER_DAYS_AHEAD` | `3` |
| `DATA_DIR` | `/data` |

After saving, Render will automatically redeploy with the new variables.

---

## Step 5 — Add a Persistent Disk (Starter plan only)

To make sure your volunteer data survives deployments:

1. In your service → **Disks** tab → **"Add Disk"**
2. Set **Mount Path** to `/data`
3. Set **Size** to `1 GB`
4. Save — Render redeploys with the disk attached

> **Free plan note:** Without a persistent disk, data.json resets on every deploy. For a working church app, the Starter plan ($7/mo) is strongly recommended.

---

## Step 6 — Visit your live app

Your app will be live at:
```
https://church-volunteer-hub.onrender.com
```
(or whatever name Render assigns — you can add a custom domain too)

---

## How daily reminders work on Render

The app includes a built-in cron job that runs every morning at 8:00 AM. As long as your Render service is running, it fires automatically — no extra configuration needed.

On the **free tier**, the service sleeps after 15 minutes of inactivity, which could cause the 8 AM reminder to miss. To fix this either:
- Upgrade to **Starter ($7/mo)** — service never sleeps
- Or use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping your `/api/health` endpoint every 5 minutes, keeping it awake

---

## Updating the app

Any time you push to your GitHub repo's `main` branch, Render automatically rebuilds and redeploys:

```bash
# Make changes, then:
git add .
git commit -m "Update message template"
git push
```

---

## Cost summary

| Item | Cost |
|---|---|
| Render Starter plan | $7/month |
| Resend email | Free (3,000 emails/month) |
| Twilio SMS | ~$1–2/month for typical church |
| **Total** | **~$8–9/month** |

For a completely free setup (with limitations): use the Render free tier + UptimeRobot to keep it awake. Data will reset on deploys until you add a paid disk.
