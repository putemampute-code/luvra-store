import crypto from 'crypto';

const IYZICO_API_URL = 'https://sandbox-api.iyzipay.com';
const IYZICO_API_KEY = process.env.IYZICO_API_KEY;
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY;

function generateAuthorizationHeader(request) {
  const hashStr = IYZICO_API_KEY + request.conversationId + request.paidPrice + request.basketId;
  const hmac = crypto.createHmac('sha256', IYZICO_SECRET_KEY).update(hashStr).digest('base64');
  return `IYZWSv2:${hmac}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price, paidPrice, basketId, user, cardInfo, shippingAddress, billingAddress, items } = req.body;

    const conversationId = `LVR-${Date.now()}`;

    const request = {
      locale: 'tr',
      conversationId,
      price: price.toString(),
      paidPrice: paidPrice.toString(),
      currency: 'TRY',
      basketId: basketId.toString(),
      paymentCard: {
        cardHolderName: cardInfo.holderName,
        cardNumber: cardInfo.number,
        expireMonth: cardInfo.expireMonth,
        expireYear: cardInfo.expireYear,
        cvc: cardInfo.cvc
      },
      buyer: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        gsmNumber: user.phone || '+905000000000',
        email: user.email,
        identityNumber: user.identityNumber || '74300864791',
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: user.address || '',
        ip: user.ip || '85.34.78.112',
        city: user.city || 'İstanbul',
        country: 'Türkiye',
        zipCode: user.zipCode || '34732'
      },
      shippingAddress: {
        contactName: shippingAddress.name,
        city: shippingAddress.city,
        country: 'Türkiye',
        address: shippingAddress.address,
        zipCode: shippingAddress.zipCode || '34732'
      },
      billingAddress: {
        contactName: billingAddress.name,
        city: billingAddress.city,
        country: 'Türkiye',
        address: billingAddress.address,
        zipCode: billingAddress.zipCode || '34732'
      },
      basketItems: items.map(item => ({
        id: item.id.toString(),
        name: item.title,
        category1: item.category,
        itemType: 'PHYSICAL',
        price: item.price.toString()
      }))
    };

    const authHeader = generateAuthorizationHeader(request);

    const response = await fetch(`${IYZICO_API_URL}/payment/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();

    if (result.status === 'success') {
      return res.status(200).json({
        status: 'success',
        paymentId: result.paymentId,
        conversationId,
        price: result.price,
        paidPrice: result.paidPrice,
        cardMaskedNumber: result.cardMaskedNumber
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: result.errorMessage || 'Ödeme başarısız',
        errorCode: result.errorCode
      });
    }
  } catch (error) {
    console.error('Iyzico error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Ödeme sırasında bir hata oluştu' 
    });
  }
}
