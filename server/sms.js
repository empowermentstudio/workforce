async function sendSMS({ to, body }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;

  if (!accountSid || !authToken || !from) {
    console.warn('[SMS] Twilio credentials not set — skipping SMS to', to);
    return { ok: false, error: 'Twilio not configured' };
  }

  // Normalize phone number
  const toNormalized = to.replace(/\s/g, '');

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: toNormalized, Body: body }).toString(),
      }
    );

    const data = await res.json();

    if (!res.ok || data.status === 'failed') {
      console.error('[SMS] Twilio error:', data);
      return { ok: false, error: data.message || data.error_message || 'Unknown error' };
    }

    console.log(`[SMS] Sent to ${to} — sid: ${data.sid}`);
    return { ok: true, sid: data.sid };
  } catch (err) {
    console.error('[SMS] Fetch error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendSMS };
