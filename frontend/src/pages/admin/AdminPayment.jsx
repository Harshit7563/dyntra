import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const PROVIDERS = [
  { id: 'custom', label: 'Custom / Any Gateway' },
  { id: 'razorpay', label: 'Razorpay' },
  { id: 'paytm', label: 'Paytm' },
  { id: 'phonepe', label: 'PhonePe' },
  { id: 'payu', label: 'PayU' },
  { id: 'cashfree', label: 'Cashfree' },
  { id: 'stripe', label: 'Stripe' },
];

const URL_HELP = 'Payment URL placeholders: {amount} {order_number} {email} {phone} {name} {callback_url}. Callback should include ?payment=success&email={email}. Webhook: POST /api/payment/webhook with header X-Payment-Secret.';

const emptyGateway = {
  name: '',
  provider: 'custom',
  payment_url: '',
  api_url: '',
  ip_whitelist: '',
  merchant_id: '',
  api_key: '',
  secret_key: '',
  callback_url: 'https://dyntra.in/order-success/{order_number}?payment=success&email={email}',
  webhook_url: 'http://localhost:5001/api/payment/webhook',
  is_enabled: true,
  test_mode: true,
  notes: '',
};

const PRESETS = {
  razorpay: {
    payment_url: 'https://your-payment-page.com/pay?amount={amount}&order_id={order_number}&email={email}&phone={phone}',
    api_url: 'https://api.razorpay.com/v1/',
  },
  paytm: {
    payment_url: 'https://securegw.paytm.in/order/process?orderid={order_number}&amount={amount}',
    api_url: 'https://securegw.paytm.in/',
  },
  phonepe: {
    payment_url: 'https://your-phonepe-url.com/pay?amount={amount}&order={order_number}',
    api_url: 'https://api.phonepe.com/apis/hermes/',
  },
  custom: {
    payment_url: 'https://your-gateway.com/checkout?amount={amount}&order={order_number}&email={email}',
    api_url: '',
  },
};

export default function AdminPayment() {
  const [settings, setSettings] = useState({ cod_enabled: true, upi_enabled: true, upi_vpa: '', active_gateway_id: null });
  const [gateways, setGateways] = useState([]);
  const [form, setForm] = useState(emptyGateway);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { alert, busy, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.paymentSettings();
      setSettings(data.settings);
      setGateways(data.gateways);
    } catch (err) {
      await run(() => Promise.reject(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    await run(async () => {
      const updated = await adminApi.updatePaymentSettings(settings);
      setSettings(updated);
    }, 'Payment settings saved');
  };

  const applyPreset = (provider) => {
    const preset = PRESETS[provider] || PRESETS.custom;
    setForm((prev) => ({
      ...prev,
      provider,
      payment_url: prev.payment_url || preset.payment_url,
      api_url: prev.api_url || preset.api_url,
    }));
  };

  const saveGateway = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      name: form.name.trim(),
      payment_url: form.payment_url.trim(),
      api_url: form.api_url.trim(),
      ip_whitelist: form.ip_whitelist.trim(),
      merchant_id: form.merchant_id.trim(),
      api_key: form.api_key.trim(),
      secret_key: form.secret_key.trim(),
      callback_url: form.callback_url.trim(),
      webhook_url: form.webhook_url.trim(),
    };

    await run(async () => {
      if (editId) await adminApi.updatePaymentGateway(editId, payload);
      else await adminApi.createPaymentGateway(payload);
      setForm(emptyGateway);
      setEditId(null);
      await load();
    }, editId ? 'Gateway updated' : 'Gateway added');
  };

  const activate = async (id) => {
    await run(async () => {
      const updated = await adminApi.activatePaymentGateway(id);
      setSettings((prev) => ({ ...prev, active_gateway_id: updated.active_gateway_id }));
      await load();
    }, 'Gateway activated for checkout');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this payment gateway?')) return;
    await run(async () => {
      await adminApi.deletePaymentGateway(id);
      if (editId === id) { setEditId(null); setForm(emptyGateway); }
      await load();
    }, 'Gateway deleted');
  };

  const startEdit = (g) => {
    setEditId(g.id);
    setForm({
      name: g.name,
      provider: g.provider,
      payment_url: g.payment_url || '',
      api_url: g.api_url || '',
      ip_whitelist: g.ip_whitelist || '',
      merchant_id: g.merchant_id || '',
      api_key: g.api_key || '',
      secret_key: g.secret_key || '',
      callback_url: g.callback_url || '',
      webhook_url: g.webhook_url || '',
      is_enabled: g.is_enabled,
      test_mode: g.test_mode,
      notes: g.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-2">Payment Gateway</h1>
      <p className="text-sm text-gray-500 mb-6">
        Add any payment gateway — just paste URL, API endpoint, Merchant ID &amp; keys. No code changes needed.
      </p>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <section className="bg-white border border-gold/20 p-4 sm:p-6 mb-8">
            <h2 className="font-serif text-lg text-maroon mb-4">Checkout Options</h2>
            <form onSubmit={saveSettings} className="space-y-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={settings.cod_enabled} onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })} />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={settings.upi_enabled} onChange={(e) => setSettings({ ...settings, upi_enabled: e.target.checked })} />
                UPI / Manual payment
              </label>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">UPI ID (optional)</label>
                <input value={settings.upi_vpa || ''} onChange={(e) => setSettings({ ...settings, upi_vpa: e.target.value })} placeholder="yourname@upi" className="w-full max-w-sm px-3 py-2 border text-sm" />
              </div>
              <button type="submit" disabled={busy} className="px-4 py-2 bg-maroon text-white text-sm uppercase disabled:opacity-60">Save Options</button>
            </form>
          </section>

          <section className="bg-white border border-gold/20 p-4 sm:p-6 mb-8">
            <h2 className="font-serif text-lg text-maroon mb-1">{editId ? `Edit Gateway #${editId}` : 'Add Payment Gateway'}</h2>
            <p className="text-xs text-gray-500 mb-4">{URL_HELP}</p>

            <form onSubmit={saveGateway} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-1">Gateway Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Razorpay / Paytm / My Gateway" className="w-full px-3 py-2 border text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-1">Provider</label>
                  <select value={form.provider} onChange={(e) => { setForm({ ...form, provider: e.target.value }); applyPreset(e.target.value); }} className="w-full px-3 py-2 border text-sm bg-white">
                    {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Payment URL (redirect link) *</label>
                <input required value={form.payment_url} onChange={(e) => setForm({ ...form, payment_url: e.target.value })} placeholder="https://gateway.com/pay?amount={amount}&order={order_number}" className="w-full px-3 py-2 border text-sm font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">API URL / IP</label>
                <input value={form.api_url} onChange={(e) => setForm({ ...form, api_url: e.target.value })} placeholder="https://api.gateway.com/v1/ or IP: 103.x.x.x" className="w-full px-3 py-2 border text-sm font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">IP Whitelist (optional)</label>
                <input value={form.ip_whitelist} onChange={(e) => setForm({ ...form, ip_whitelist: e.target.value })} placeholder="103.21.244.0, 103.22.244.0" className="w-full px-3 py-2 border text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-1">Merchant ID / Key ID</label>
                  <input value={form.merchant_id} onChange={(e) => setForm({ ...form, merchant_id: e.target.value })} className="w-full px-3 py-2 border text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-1">API Key</label>
                  <input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} className="w-full px-3 py-2 border text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-1">Secret Key</label>
                  <input type="password" value={form.secret_key} onChange={(e) => setForm({ ...form, secret_key: e.target.value })} className="w-full px-3 py-2 border text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Callback URL (after payment)</label>
                <input value={form.callback_url} onChange={(e) => setForm({ ...form, callback_url: e.target.value })} className="w-full px-3 py-2 border text-sm font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Webhook URL (register in gateway dashboard)</label>
                <input value={form.webhook_url} onChange={(e) => setForm({ ...form, webhook_url: e.target.value })} className="w-full px-3 py-2 border text-sm font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border text-sm" />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} /> Enabled</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.test_mode} onChange={(e) => setForm({ ...form, test_mode: e.target.checked })} /> Test Mode</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={busy} className="px-4 py-2 bg-maroon text-white text-sm uppercase disabled:opacity-60">
                  {busy ? 'Saving...' : editId ? 'Update Gateway' : 'Add Gateway'}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setForm(emptyGateway); }} className="px-4 py-2 border text-sm">Cancel</button>
                )}
              </div>
            </form>
          </section>

          <section>
            <h2 className="font-serif text-lg text-maroon mb-4">Installed Gateways ({gateways.length})</h2>
            {gateways.length === 0 ? (
              <p className="text-gray-500 bg-white border border-gold/20 p-6 text-center">No gateways yet. Add one above.</p>
            ) : (
              <div className="space-y-3">
                {gateways.map((g) => (
                  <div key={g.id} className={`bg-white border p-4 ${settings.active_gateway_id === g.id ? 'border-maroon ring-1 ring-maroon/30' : 'border-gold/20'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium flex items-center gap-2 flex-wrap">
                          {g.name}
                          <span className="text-xs text-gray-400 uppercase">{g.provider}</span>
                          {settings.active_gateway_id === g.id && (
                            <span className="text-xs bg-maroon text-white px-2 py-0.5 uppercase">Active</span>
                          )}
                          {g.test_mode && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5">Test</span>}
                          {!g.is_enabled && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5">Disabled</span>}
                        </p>
                        {g.payment_url && <p className="text-xs text-gray-500 mt-1 truncate font-mono">{g.payment_url}</p>}
                        {g.api_url && <p className="text-xs text-gray-400 truncate">API: {g.api_url}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {g.is_enabled && settings.active_gateway_id !== g.id && (
                          <button type="button" onClick={() => activate(g.id)} className="px-3 py-1.5 bg-maroon text-white text-xs uppercase">Activate</button>
                        )}
                        <button type="button" onClick={() => startEdit(g)} className="px-3 py-1.5 border text-xs">Edit</button>
                        <button type="button" onClick={() => remove(g.id)} className="px-3 py-1.5 border border-red-200 text-red-500 text-xs">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
