async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[EMAIL] RESEND_API_KEY not set — skipping email to', to);
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'reminders@gracechurch.org',
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[EMAIL] Resend error:', data);
      return { ok: false, error: data.message || 'Unknown error' };
    }

    console.log(`[EMAIL] Sent to ${to} — id: ${data.id}`);
    return { ok: true, id: data.id };
  } catch (err) {
    console.error('[EMAIL] Fetch error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendEmail };
