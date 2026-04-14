require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./db');
const { sendEmail } = require('./email');
const { sendSMS } = require('./sms');
const { buildEmailBody, buildSMSBody } = require('./templates');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(require('path').join(__dirname, 'public')));

// ── Volunteers ──────────────────────────────────────────────
app.get('/api/volunteers', (req, res) => {
  res.json(db.getAll('volunteers'));
});

app.post('/api/volunteers', (req, res) => {
  const vol = db.insert('volunteers', req.body);
  res.json(vol);
});

app.put('/api/volunteers/:id', (req, res) => {
  const updated = db.update('volunteers', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/volunteers/:id', (req, res) => {
  db.remove('volunteers', req.params.id);
  res.json({ ok: true });
});

// ── Tasks ────────────────────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  res.json(db.getAll('tasks'));
});

app.post('/api/tasks', (req, res) => {
  const task = db.insert('tasks', req.body);
  res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const updated = db.update('tasks', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
  db.remove('tasks', req.params.id);
  res.json({ ok: true });
});

// ── Sunday Slots ─────────────────────────────────────────────
app.get('/api/slots', (req, res) => {
  res.json(db.getAll('slots'));
});

app.post('/api/slots', (req, res) => {
  const slot = db.insert('slots', req.body);
  res.json(slot);
});

app.delete('/api/slots/:id', (req, res) => {
  db.remove('slots', req.params.id);
  res.json({ ok: true });
});

// ── Reminder Log ─────────────────────────────────────────────
app.get('/api/log', (req, res) => {
  res.json(db.getAll('log'));
});

// ── Manual: remind one volunteer ─────────────────────────────
app.post('/api/remind/volunteer/:id', async (req, res) => {
  const vol = db.getById('volunteers', req.params.id);
  if (!vol) return res.status(404).json({ error: 'Volunteer not found' });

  const tasks = db.getAll('tasks').filter(t => t.volId === vol.id && t.status !== 'done');
  if (!tasks.length) return res.status(400).json({ error: 'No active tasks for this volunteer' });

  const results = [];
  for (const task of tasks) {
    const emailBody = buildEmailBody(vol, task);
    const smsBody = buildSMSBody(vol, task);

    const emailResult = await sendEmail({
      to: vol.email,
      subject: `Reminder: ${task.name} on ${task.date}`,
      html: emailBody,
    });

    const smsResult = vol.phone ? await sendSMS({ to: vol.phone, body: smsBody }) : { skipped: true };

    const logEntry = {
      volName: `${vol.first} ${vol.last}`,
      task: task.name,
      date: task.date,
      emailStatus: emailResult.ok ? 'sent' : 'failed',
      smsStatus: smsResult.skipped ? 'no phone' : smsResult.ok ? 'sent' : 'failed',
      sentAt: new Date().toISOString(),
    };
    db.insert('log', logEntry);
    results.push(logEntry);
  }

  res.json({ ok: true, results });
});

// ── Manual: remind ALL volunteers ────────────────────────────
app.post('/api/remind/all', async (req, res) => {
  const volunteers = db.getAll('volunteers');
  const allResults = [];

  for (const vol of volunteers) {
    const tasks = db.getAll('tasks').filter(t => t.volId === vol.id && t.status !== 'done');
    for (const task of tasks) {
      const emailBody = buildEmailBody(vol, task);
      const smsBody = buildSMSBody(vol, task);

      const emailResult = await sendEmail({
        to: vol.email,
        subject: `Reminder: ${task.name} on ${task.date}`,
        html: emailBody,
      });

      const smsResult = vol.phone ? await sendSMS({ to: vol.phone, body: smsBody }) : { skipped: true };

      const logEntry = {
        volName: `${vol.first} ${vol.last}`,
        task: task.name,
        date: task.date,
        emailStatus: emailResult.ok ? 'sent' : 'failed',
        smsStatus: smsResult.skipped ? 'no phone' : smsResult.ok ? 'sent' : 'failed',
        sentAt: new Date().toISOString(),
      };
      db.insert('log', logEntry);
      allResults.push(logEntry);
    }
  }

  res.json({ ok: true, count: allResults.length, results: allResults });
});

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    email: !!process.env.RESEND_API_KEY,
    sms: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  });
});

// ── Scheduled auto-reminders ─────────────────────────────────
// Runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running daily reminder check...');
  const daysAhead = parseInt(process.env.REMINDER_DAYS_AHEAD || '3', 10);
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysAhead);
  const targetStr = targetDate.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const tasks = db.getAll('tasks').filter(t =>
    (t.date === targetStr || t.date === todayStr) && t.status !== 'done'
  );

  console.log(`[CRON] Found ${tasks.length} task(s) needing reminders`);

  for (const task of tasks) {
    const vol = db.getById('volunteers', task.volId);
    if (!vol) continue;

    const label = task.date === todayStr ? 'TODAY' : `in ${daysAhead} days`;
    const emailBody = buildEmailBody(vol, task, label);
    const smsBody = buildSMSBody(vol, task, label);

    await sendEmail({ to: vol.email, subject: `Reminder: ${task.name} ${label}`, html: emailBody });
    if (vol.phone) await sendSMS({ to: vol.phone, body: smsBody });

    db.insert('log', {
      volName: `${vol.first} ${vol.last}`,
      task: task.name,
      date: task.date,
      emailStatus: 'sent',
      smsStatus: vol.phone ? 'sent' : 'no phone',
      sentAt: new Date().toISOString(),
      auto: true,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Church Volunteer Hub running on http://localhost:${PORT}`));
