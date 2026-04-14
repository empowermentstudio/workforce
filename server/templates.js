const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${MONTHS[+m - 1]} ${d}, ${y}`;
}

function buildEmailBody(vol, task, label = '') {
  const church = process.env.CHURCH_NAME || 'Grace Community Church';
  const dateLabel = label ? ` (${label})` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0; }
    .header { background: #185FA5; color: #fff; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .header p { margin: 4px 0 0; font-size: 14px; opacity: 0.85; }
    .body { padding: 28px 32px; }
    .greeting { font-size: 16px; color: #111; margin-bottom: 16px; }
    .task-card { background: #f0f6ff; border: 1px solid #c3daff; border-radius: 8px; padding: 16px 20px; margin: 18px 0; }
    .task-card h2 { margin: 0 0 8px; font-size: 17px; color: #0C447C; }
    .task-card .row { font-size: 13px; color: #444; margin: 4px 0; }
    .task-card .row span { font-weight: 600; color: #111; }
    .note { font-size: 13px; color: #555; margin-top: 18px; line-height: 1.6; }
    .footer { border-top: 1px solid #eee; padding: 18px 32px; font-size: 12px; color: #999; text-align: center; }
    .cross { font-size: 22px; display: block; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>✝ ${church}</h1>
      <p>Volunteer Reminder</p>
    </div>
    <div class="body">
      <p class="greeting">Hi ${vol.first},</p>
      <p style="font-size:14px;color:#333;">
        This is a friendly reminder that you have an upcoming volunteer commitment${dateLabel}. 
        We're so grateful for your service to our church family!
      </p>
      <div class="task-card">
        <h2>${task.name}</h2>
        <div class="row">Ministry: <span>${task.ministry}</span></div>
        <div class="row">Date: <span>${fmtDate(task.date)}${dateLabel}</span></div>
        ${task.notes ? `<div class="row">Notes: <span>${task.notes}</span></div>` : ''}
      </div>
      <p class="note">
        If you have any questions or need to make changes, please contact your ministry leader or 
        reply to this email. Please arrive a few minutes early so we can get started on time.
      </p>
      <p class="note" style="margin-top:12px;">
        God bless you and thank you for serving! 🙏
      </p>
    </div>
    <div class="footer">
      <span class="cross">✝</span>
      ${church} · Volunteer Management System<br>
      You're receiving this because you're a registered volunteer.
    </div>
  </div>
</body>
</html>`;
}

function buildSMSBody(vol, task, label = '') {
  const church = process.env.CHURCH_NAME || 'Grace Community Church';
  const dateLabel = label ? ` (${label}!)` : '';
  return `Hi ${vol.first}! Reminder from ${church}: You're serving as "${task.name}" on ${fmtDate(task.date)}${dateLabel}. Thank you for volunteering! 🙏 Questions? Reply to this message.`;
}

module.exports = { buildEmailBody, buildSMSBody };
