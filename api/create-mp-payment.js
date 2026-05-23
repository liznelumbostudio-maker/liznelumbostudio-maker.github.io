export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, mode } = req.body;

  if (!amount || amount < 500) {
    return res.status(400).json({ error: 'El monto mínimo es $500 MXN' });
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          title: mode === 'deposit' ? 'Depósito Tatuaje' : 'Total Cotización Tatuaje',
          quantity: 1,
          unit_price: amount,
          currency_id: 'MXN',
        }],
        back_urls: {
          success: 'https://liznelumbostudio-maker.github.io?pago=exitoso',
          failure: 'https://liznelumbostudio-maker.github.io?pago=fallido',
        },
        auto_return: 'approved',
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.message });
    }

    return res.status(200).json({ url: data.init_point });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear el pago' });
  }
}
