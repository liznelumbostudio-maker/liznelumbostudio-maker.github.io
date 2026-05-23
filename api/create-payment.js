export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, mode } = req.body;

  if (!amount || amount < 500) {
    return res.status(400).json({ error: 'El monto mínimo es $500 MXN' });
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'line_items[0][price_data][currency]': 'mxn',
        'line_items[0][price_data][product_data][name]': mode === 'deposit' ? 'Depósito Tatuaje' : 'Total Cotización Tatuaje',
        'line_items[0][price_data][unit_amount]': String(amount * 100),
        'line_items[0][quantity]': '1',
        'after_completion[type]': 'redirect',
        'after_completion[redirect][url]': 'https://liznelumbostudio-maker.github.io?pago=exitoso',
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.status(200).json({ url: data.url });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear el link de pago' });
  }
}
