export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const { name, phone, day, time, service } = body || {};

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.RECIPIENT_NUMBER;

  if (!sid || !token || !from || !to) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const message = [
    'New EJ Cuts Booking',
    `Name: ${name}`,
    `Number: ${phone}`,
    `Day: ${day}`,
    `Time: ${time}`,
    `Service: ${service}`
  ].join('\n');

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ From: from, To: to, Body: message })
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: data.message || 'Twilio error', code: data.code });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
