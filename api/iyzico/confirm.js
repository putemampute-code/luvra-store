import crypto from 'crypto';

const IYZICO_API_URL = 'https://sandbox-api.iyzipay.com';
const IYZICO_API_KEY = process.env.IYZICO_API_KEY;
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, conversationId } = req.body;

    const hashStr = IYZICO_API_KEY + conversationId + paymentId;
    const hmac = crypto.createHmac('sha256', IYZICO_SECRET_KEY).update(hashStr).digest('base64');

    const response = await fetch(`${IYZICO_API_URL}/payment/auth/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `IYZWSv2:${hmac}`
      },
      body: JSON.stringify({
        locale: 'tr',
        conversationId,
        paymentId
      })
    });

    const result = await response.json();

    if (result.status === 'success') {
      return res.status(200).json({
        status: 'success',
        paymentId: result.paymentId,
        price: result.price,
        paidPrice: result.paidPrice
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: result.errorMessage || 'Ödeme onaylanamadı'
      });
    }
  } catch (error) {
    console.error('Iyzico confirm error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Ödeme onayı sırasında bir hata oluştu' 
    });
  }
}
