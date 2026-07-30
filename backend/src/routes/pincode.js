import { Router } from 'express';

const router = Router();

router.get('/:pin', async (req, res) => {
  const pin = String(req.params.pin || '').trim();
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ error: 'Valid 6-digit pincode required' });
  }

  try {
    const upstream = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    const data = await upstream.json();
    const row = Array.isArray(data) ? data[0] : null;
    const office = row?.Status === 'Success' && row.PostOffice?.[0];

    if (!office) {
      return res.status(404).json({ error: 'Invalid pincode', city: '', state: '' });
    }

    const city = String(office.District || office.Block || office.Name || '').trim();
    const state = String(office.State || '').trim();

    res.json({
      pincode: pin,
      city,
      state,
      district: office.District || '',
      country: office.Country || 'India',
    });
  } catch (err) {
    console.error('[pincode]', err.message);
    res.status(502).json({ error: 'Pincode lookup failed' });
  }
});

export default router;
