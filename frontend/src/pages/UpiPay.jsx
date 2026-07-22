import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { confirmPayment, fetchUpiCheckout, formatPrice } from '../api';
import { COMPANY } from '../data/company';

export default function UpiPay() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromQuery = searchParams.get('email') || '';
  const email =
    emailFromQuery ||
    sessionStorage.getItem(`order-email-${orderNumber}`) ||
    '';

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber || !email) {
      setError('Open this page from checkout after placing your UPI order.');
      setLoading(false);
      return;
    }
    fetchUpiCheckout(orderNumber, email)
      .then((d) => {
        setData(d);
        if (d.payment_status === 'paid' || d.status === 'confirmed') {
          navigate(`/order-success/${orderNumber}?email=${encodeURIComponent(email)}`, { replace: true });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderNumber, email, navigate]);

  const qrUrl = useMemo(() => {
    if (!data?.upi_uri) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(data.upi_uri)}`;
  }, [data]);

  const copyVpa = async () => {
    if (!data?.upi_vpa) return;
    try {
      await navigator.clipboard.writeText(data.upi_vpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy UPI ID');
    }
  };

  const finishPaid = async () => {
    setBusy('paid');
    setError('');
    try {
      await confirmPayment(orderNumber, 'upi_paid');
      navigate(`/order-success/${orderNumber}?payment=success&email=${encodeURIComponent(email)}`, {
        state: { order: data },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const finishDelivery = async () => {
    setBusy('delivery');
    setError('');
    try {
      await confirmPayment(orderNumber, 'pay_on_delivery');
      navigate(`/order-success/${orderNumber}?email=${encodeURIComponent(email)}`, {
        state: { order: data },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0a10] text-white flex items-center justify-center">
        <p className="text-sm tracking-widest uppercase text-gold/80">Preparing Dyntra Pay…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#1a0a10] text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="font-serif text-3xl text-gold mb-3">Dyntra Pay</p>
        <p className="text-white/70 mb-8 max-w-md">{error}</p>
        <Link to="/checkout" className="px-6 py-3 bg-maroon text-white text-xs uppercase tracking-widest">
          Back to checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#14080c] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 0%, #7B1E3A66, transparent), radial-gradient(ellipse 60% 40% at 90% 20%, #C9A84C33, transparent), radial-gradient(ellipse 50% 50% at 50% 100%, #5C152955, transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C9A84C\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <header className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-wide text-gold">
          Dyntra
        </Link>
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Secure UPI Checkout</p>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
          <section className="pt-4 lg:pt-10">
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">Pay with UPI</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-4">
              Complete your
              <span className="block text-gold italic">silk order</span>
            </h1>
            <p className="text-white/65 max-w-md text-sm sm:text-base leading-relaxed mb-8">
              Scan the QR with GPay, PhonePe or any UPI app. Or open your preferred app below —
              amount and order note are filled automatically.
            </p>

            <div className="rounded-sm border border-gold/25 bg-white/5 backdrop-blur-sm p-5 sm:p-6 mb-6">
              <div className="flex justify-between items-end gap-4 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/45">Amount due</p>
                  <p className="font-serif text-4xl text-gold mt-1">{formatPrice(data.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/45">Order</p>
                  <p className="font-mono text-sm mt-1">{data.order_number}</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2 text-sm text-white/70">
                <p>
                  <span className="text-white/40">For </span>
                  {data.customer_name}
                </p>
                {data.items?.slice(0, 3).map((item, i) => (
                  <p key={i} className="text-xs text-white/50 truncate">
                    {item.quantity}× {item.product_name}
                  </p>
                ))}
                {(data.items?.length || 0) > 3 && (
                  <p className="text-xs text-white/40">+{data.items.length - 3} more</p>
                )}
              </div>
            </div>

            {!data.configured && (
              <p className="text-amber-200/90 text-sm border border-amber-500/30 bg-amber-500/10 p-3 mb-4">
                UPI ID is not set in Admin → Payment yet. Add your VPA so customers can pay instantly.
              </p>
            )}

            {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={!!busy || !data.configured}
                onClick={finishPaid}
                className="flex-1 py-3.5 bg-gold text-charcoal text-xs uppercase tracking-widest font-medium hover:bg-[#d4b55e] transition-colors disabled:opacity-50"
              >
                {busy === 'paid' ? 'Confirming…' : "I've paid"}
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={finishDelivery}
                className="flex-1 py-3.5 border border-white/25 text-white text-xs uppercase tracking-widest hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
              >
                {busy === 'delivery' ? 'Saving…' : 'Pay on delivery'}
              </button>
            </div>
          </section>

          <section className="lg:pt-6">
            <div className="relative rounded-sm border border-gold/30 bg-gradient-to-b from-[#2a1218] to-[#1a0a10] p-6 sm:p-8 shadow-[0_0_60px_-20px_rgba(201,168,76,0.45)]">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="text-center text-[10px] uppercase tracking-[0.35em] text-gold mb-5">Scan to pay</p>

              <div className="mx-auto w-[240px] h-[240px] bg-white p-3 mb-5 shadow-inner">
                {qrUrl ? (
                  <img src={qrUrl} alt="UPI QR code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal/40 text-xs">QR</div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 bg-black/30 border border-gold/20 px-3 py-2.5 mb-6">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">UPI ID</p>
                  <p className="font-mono text-sm text-gold truncate">{data.upi_vpa || 'Not configured'}</p>
                </div>
                <button
                  type="button"
                  onClick={copyVpa}
                  disabled={!data.upi_vpa}
                  className="shrink-0 text-[10px] uppercase tracking-wider px-3 py-2 border border-gold/40 text-gold hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-40"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Open app</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { href: data.gpay_uri, label: 'GPay', tone: 'from-[#4285F4] to-[#34A853]' },
                  { href: data.phonepe_uri, label: 'PhonePe', tone: 'from-[#5f259f] to-[#7b3fbf]' },
                  { href: data.paytm_uri, label: 'Paytm', tone: 'from-[#00baf2] to-[#002e6e]' },
                ].map((app) => (
                  <a
                    key={app.label}
                    href={data.configured ? app.href : undefined}
                    aria-disabled={!data.configured}
                    className={`text-center py-3 text-[11px] uppercase tracking-wider font-medium bg-gradient-to-br ${app.tone} ${
                      data.configured ? 'opacity-100 hover:brightness-110' : 'opacity-40 pointer-events-none'
                    }`}
                  >
                    {app.label}
                  </a>
                ))}
              </div>

              <a
                href={data.configured ? data.upi_uri : undefined}
                className={`mt-3 block text-center py-3 border border-gold/35 text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors ${
                  !data.configured ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                Other UPI apps
              </a>
            </div>

            <p className="mt-6 text-center text-[11px] text-white/35 leading-relaxed">
              {COMPANY.brand} · {COMPANY.legalName}
              <br />
              Need help?{' '}
              <a href={COMPANY.whatsappUrl} className="text-gold/80 hover:text-gold underline-offset-2 hover:underline">
                WhatsApp us
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
