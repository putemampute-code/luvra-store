export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CJ_API_KEY = process.env.VITE_CJ_API_KEY;
  const CJ_API_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

  try {
    const { endpoint, body } = req.body;

    const response = await fetch(`${CJ_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': CJ_API_KEY
      },
      body: JSON.stringify(body || {})
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('CJ API error:', error);
    return res.status(500).json({ 
      code: 500, 
      message: 'CJ API bağlantı hatası: ' + error.message 
    });
  }
}
