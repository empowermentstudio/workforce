# Church Volunteer Hub

A complete volunteer management system with real email (Resend) and SMS (Twilio) reminders.

---

## Features

- Volunteer profiles with roles & availability
- Task assignment & scheduling
- Sunday service schedule grid
- Auto email + SMS reminders (daily cron at 8 AM)
- Manual "send now" per volunteer or all at once
- Reminder delivery log
- Persistent JSON database (no external DB needed)

---

## Quick Start

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure credentials

```bash
cp .env.example .env
```

Open `server/.env` and fill in:

| Variable | Where to get it |
|---|---|
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys → Create key (free: 3,000 emails/month) |
| `EMAIL_FROM` | A verified sender in Resend. For testing use `onboarding@resend.dev` |
| `TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) → Account Info |
| `TWILIO_AUTH_TOKEN` | Same page as SID |
| `TWILIO_PHONE` | Twilio Console → Phone Numbers (free trial gives you one) |
| `CHURCH_NAME` | Your church name (appears in emails/SMS) |
| `REMINDER_DAYS_AHEAD` | How many days before a task to send advance reminder (default: 3) |

### 3. Start the server

```bash
cd server
npm start
```

The app runs at **http://localhost:3001**

For development with auto-reload:
```bash
npm run dev
```

---

## How Reminders Work

### Automatic (cron)
Every day at **8:00 AM**, the server:
1. Finds tasks due **today** → sends day-of reminders
2. Finds tasks due in **N days** (set by `REMINDER_DAYS_AHEAD`) → sends advance reminders
3. Logs all deliveries to `server/data.json`

### Manual
- **Per volunteer**: Click "Remind" next to any volunteer → sends email + SMS for all their active tasks
- **All at once**: Go to Reminders → "Send all reminders now"

---

## Email Template

Volunteers receive a branded HTML email showing:
- Task name and ministry
- Date (with "TODAY" or "in 3 days" label)
- Any task notes
- Church name and branding

## SMS Template

Concise single-line message:
> Hi Jane! Reminder from Grace Community Church: You're serving as "Lead Sunday Worship" on Apr 13, 2026 (in 3 days!). Thank you for volunteering! 🙏

---

## File Structure

```
church-volunteer-hub/
├── server/
│   ├── index.js        # Express server + cron job
│   ├── db.js           # JSON file database
│   ├── email.js        # Resend integration
│   ├── sms.js          # Twilio integration
│   ├── templates.js    # Email HTML + SMS templates
│   ├── .env.example    # Credentials template
│   ├── .env            # Your credentials (never commit this!)
│   ├── data.json       # Auto-created database file
│   └── package.json
└── frontend/
    └── index.html      # Complete single-file frontend
```

---

## Production Tips

- Run the server with **PM2** so it stays up: `pm2 start index.js --name volunteer-hub`
- Add your domain to Resend's verified senders for professional-looking emails
- Twilio trial requires verifying recipient numbers — upgrade to a paid account ($20+) for unrestricted SMS
- Back up `server/data.json` regularly (this is your database)

---

## Cost Estimate (typical small church, ~20 volunteers)

| Service | Cost |
|---|---|
| Resend email | Free (3,000/month) |
| Twilio SMS | ~$0.008/text × 2 texts × 20 volunteers × 4 Sundays = ~$1.28/month |
| Hosting (e.g. Railway/Render) | Free tier available |
| **Total** | **~$1–2/month** |
