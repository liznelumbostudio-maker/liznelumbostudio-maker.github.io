export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Obtener Access Token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'No se pudo obtener token' });
    }

    // Obtener eventos del calendario
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/liznelumbostudio%40gmail.com/events?timeMin=${now.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    const calData = await calRes.json();
    res.status(200).json({ items: calData.items || [] });

  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
}
