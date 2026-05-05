export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone, day, time, service } = req.body;

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.RECIPIENT_NUMBER;

  const body = [
    '📅 New EJ Cuts Booking',
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
        body: new URLSearchParams({ From: from, To: to, Body: body })
      }
    );

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const err = await response.json();
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
