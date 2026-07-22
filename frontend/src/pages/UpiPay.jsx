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
      <div className="min-h-[100dvh] bg-[#1a0a10] text-white flex items-center justify-center px-4">
        <p className="text-xs sm:text-sm tracking-widest uppercase text-gold/80 text-center">
          Preparing Dyntra Pay…
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-[100dvh] bg-[#1a0a10] text-white flex flex-col items-center justify-center px-5 text-center">
        <p className="font-serif text-2xl sm:text-3xl text-gold mb-3">Dyntra Pay</p>
        <p className="text-white/70 mb-8 max-w-md text-sm leading-relaxed">{error}</p>
        <Link
          to="/checkout"
          className="w-full max-w-xs py-3.5 bg-maroon text-white text-xs uppercase tracking-widest text-center"
        >
          Back to checkout
        </Link>
      </div>
    );
  }

  const appButtons = [
    { href: data.gpay_uri, label: 'GPay', tone: 'from-[#4285F4] to-[#34A853]' },
    { href: data.phonepe_uri, label: 'PhonePe', tone: 'from-[#5f259f] to-[#7b3fbf]' },
    { href: data.paytm_uri, label: 'Paytm', tone: 'from-[#00baf2] to-[#002e6e]' },
  ];

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden bg-[#14080c] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 0%, #7B1E3A66, transparent), radial-gradient(ellipse 60% 40% at 90% 20%, #C9A84C33, transparent), radial-gradient(ellipse 50% 50% at 50% 100%, #5C152955, transparent)',
        }}
      />

      <header className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-8 pb-3 flex items-center justify-between gap-3">
        <Link to="/" className="font-serif text-xl sm:text-2xl tracking-wide text-gold shrink-0">
          Dyntra
        </Link>
        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/50 text-right leading-tight">
          Secure UPI
          <span className="hidden xs:inline sm:inline"> Checkout</span>
        </p>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))] lg:pb-16">
        {/* Mobile-first: pay card first, then copy */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8 lg:gap-12 lg:items-start">
          <section className="lg:pt-10">
            <p className="text-gold text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-2 sm:mb-3">
              Pay with UPI
            </p>
            <h1 className="font-serif text-[1.85rem] leading-tight sm:text-5xl lg:text-6xl sm:leading-[1.05] mb-3 sm:mb-4">
              Complete your
              <span className="block text-gold italic">silk order</span>
            </h1>
            <p className="text-white/65 max-w-md text-sm leading-relaxed mb-5 sm:mb-8 hidden sm:block">
              On phone, tap GPay / PhonePe / Paytm below. On desktop, scan the QR —
              amount and order note are filled automatically.
            </p>
            <p className="text-white/65 text-sm leading-relaxed mb-5 sm:hidden">
              Tap GPay, PhonePe or Paytm to pay. Amount is already filled.
            </p>

            <div className="rounded-sm border border-gold/25 bg-white/5 backdrop-blur-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex justify-between items-end gap-3 mb-3 sm:mb-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-white/45">Amount due</p>
                  <p className="font-serif text-3xl sm:text-4xl text-gold mt-1 tabular-nums">
                    {formatPrice(data.total)}
                  </p>
                </div>
                <div className="text-right shrink-0 max-w-[45%]">
                  <p className="text-[10px] uppercase tracking-widest text-white/45">Order</p>
                  <p className="font-mono text-xs sm:text-sm mt-1 break-all">{data.order_number}</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2 text-sm text-white/70">
                <p className="truncate">
                  <span className="text-white/40">For </span>
                  {data.customer_name}
                </p>
                {data.items?.slice(0, 2).map((item, i) => (
                  <p key={i} className="text-xs text-white/50 truncate">
                    {item.quantity}× {item.product_name}
                  </p>
                ))}
                {(data.items?.length || 0) > 2 && (
                  <p className="text-xs text-white/40">+{data.items.length - 2} more</p>
                )}
              </div>
            </div>

            {!data.configured && (
              <p className="text-amber-200/90 text-xs sm:text-sm border border-amber-500/30 bg-amber-500/10 p-3 mb-4 leading-relaxed">
                UPI ID is not set in Admin → Payment yet. Add your VPA so customers can pay instantly.
              </p>
            )}

            {error && <p className="text-red-300 text-xs sm:text-sm mb-4">{error}</p>}

            {/* Desktop / tablet inline actions */}
            <div className="hidden lg:flex flex-row gap-3">
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
            <div className="relative rounded-sm border border-gold/30 bg-gradient-to-b from-[#2a1218] to-[#1a0a10] p-4 sm:p-6 lg:p-8 shadow-[0_0_60px_-20px_rgba(201,168,76,0.45)]">
              <div className="absolute -top-px left-6 right-6 sm:left-8 sm:right-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

              {/* Apps first on mobile — primary action */}
              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-gold mb-3 sm:mb-3 lg:order-none">
                Pay with app
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                {appButtons.map((app) => (
                  <a
                    key={app.label}
                    href={data.configured ? app.href : undefined}
                    aria-disabled={!data.configured}
                    className={`text-center py-3.5 sm:py-3 text-[10px] sm:text-[11px] uppercase tracking-wider font-medium rounded-sm bg-gradient-to-br ${app.tone} active:scale-[0.98] transition-transform ${
                      data.configured ? 'opacity-100' : 'opacity-40 pointer-events-none'
                    }`}
                  >
                    {app.label}
                  </a>
                ))}
              </div>

              <a
                href={data.configured ? data.upi_uri : undefined}
                className={`mb-5 sm:mb-6 block text-center py-3 border border-gold/35 text-xs uppercase tracking-widest text-gold active:bg-gold/10 transition-colors ${
                  !data.configured ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                Other UPI apps
              </a>

              <div className="flex items-center justify-between gap-2 sm:gap-3 bg-black/30 border border-gold/20 px-3 py-2.5 mb-5 sm:mb-6">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">UPI ID</p>
                  <p className="font-mono text-xs sm:text-sm text-gold truncate">
                    {data.upi_vpa || 'Not configured'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyVpa}
                  disabled={!data.upi_vpa}
                  className="shrink-0 text-[10px] uppercase tracking-wider px-3 py-2.5 border border-gold/40 text-gold active:bg-gold active:text-charcoal transition-colors disabled:opacity-40"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* QR — secondary on phone, useful on desktop */}
              <p className="text-center text-[10px] uppercase tracking-[0.35em] text-white/40 mb-3">
                <span className="sm:hidden">Or scan on another device</span>
                <span className="hidden sm:inline">Scan to pay</span>
              </p>
              <div className="mx-auto w-[min(200px,70vw)] sm:w-[240px] aspect-square bg-white p-2.5 sm:p-3 mb-1 shadow-inner">
                {qrUrl ? (
                  <img src={qrUrl} alt="UPI QR code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal/40 text-xs">QR</div>
                )}
              </div>
            </div>

            <p className="mt-5 sm:mt-6 text-center text-[10px] sm:text-[11px] text-white/35 leading-relaxed px-2">
              {COMPANY.brand} · {COMPANY.legalName}
              <br />
              Need help?{' '}
              <a
                href={COMPANY.whatsappUrl}
                className="text-gold/80 hover:text-gold underline-offset-2 hover:underline"
              >
                WhatsApp us
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Sticky mobile footer actions */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 border-t border-gold/20 bg-[#14080c]/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-5xl mx-auto flex gap-2">
          <button
            type="button"
            disabled={!!busy || !data.configured}
            onClick={finishPaid}
            className="flex-1 py-3.5 bg-gold text-charcoal text-[11px] uppercase tracking-widest font-medium disabled:opacity-50"
          >
            {busy === 'paid' ? 'Confirming…' : "I've paid"}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={finishDelivery}
            className="flex-1 py-3.5 border border-white/25 text-white text-[11px] uppercase tracking-widest disabled:opacity-50"
          >
            {busy === 'delivery' ? 'Saving…' : 'Pay on delivery'}
          </button>
        </div>
      </div>
    </div>
  );
}
