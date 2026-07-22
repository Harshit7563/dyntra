import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchBrightPayCheckout, pollBrightPayStatus, formatPrice } from '../api';
import { COMPANY } from '../data/company';

export default function BrightPayPay() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email =
    searchParams.get('email') ||
    sessionStorage.getItem(`order-email-${orderNumber}`) ||
    '';

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('Waiting for payment…');

  useEffect(() => {
    if (!orderNumber || !email) {
      setError('Open this page from checkout after placing your order.');
      setLoading(false);
      return;
    }
    fetchBrightPayCheckout(orderNumber, email)
      .then((d) => {
        if (d.already_paid || d.payment_status === 'paid') {
          navigate(
            `/order-success/${orderNumber}?payment=success&email=${encodeURIComponent(email)}`,
            { replace: true }
          );
          return;
        }
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderNumber, email, navigate]);

  // Poll BrightPay intent_status until SUCCESS / FAILED
  useEffect(() => {
    if (!data?.intent_link || !orderNumber || !email) return undefined;
    let stopped = false;
    const tick = async () => {
      try {
        const s = await pollBrightPayStatus(orderNumber, email);
        if (stopped) return;
        if (s.intent_status === 'SUCCESS' || s.confirmed) {
          setStatusText('Payment received — confirming…');
          navigate(
            `/order-success/${orderNumber}?payment=success&email=${encodeURIComponent(email)}`,
            { replace: true }
          );
          return;
        }
        if (s.intent_status === 'FAILED') {
          setStatusText('Payment failed. You can retry from checkout.');
          setError('BrightPay reported FAILED for this order.');
          return;
        }
        setStatusText('Waiting for UPI payment…');
      } catch {
        /* keep polling */
      }
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [data?.intent_link, orderNumber, email, navigate]);

  const qrUrl = useMemo(() => {
    if (!data?.intent_link) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(data.intent_link)}`;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#1a0a10] text-white flex items-center justify-center px-4">
        <p className="text-xs tracking-widest uppercase text-gold/80">Creating BrightPay intent…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-[100dvh] bg-[#1a0a10] text-white flex flex-col items-center justify-center px-5 text-center">
        <p className="font-serif text-2xl text-gold mb-3">Pay Online</p>
        <p className="text-white/70 mb-8 max-w-md text-sm">{error}</p>
        <Link to="/checkout" className="px-6 py-3 bg-maroon text-xs uppercase tracking-widest">
          Back to checkout
        </Link>
      </div>
    );
  }

  const apps = [
    { href: data.gpay_uri, label: 'GPay' },
    { href: data.phonepe_uri, label: 'PhonePe' },
    { href: data.paytm_uri, label: 'Paytm' },
    { href: data.intent_link, label: 'Any UPI app' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#14080c] text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <p className="text-center text-[10px] tracking-[0.25em] uppercase text-gold/80 mb-2">
          Dyntra · BrightPay
        </p>
        <h1 className="font-serif text-3xl text-center text-gold mb-1">Pay {formatPrice(data.total)}</h1>
        <p className="text-center text-xs text-white/50 mb-6">Order {data.order_number}</p>

        {error ? <p className="text-center text-sm text-red-300 mb-4">{error}</p> : null}

        <div className="bg-white rounded-lg p-4 mx-auto w-fit mb-6">
          {qrUrl ? (
            <img src={qrUrl} alt="UPI QR" className="w-56 h-56" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-maroon text-sm">QR</div>
          )}
        </div>

        <p className="text-center text-xs text-white/60 mb-4">{statusText}</p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {apps.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className="py-3 text-center text-xs uppercase tracking-wider bg-maroon/90 hover:bg-maroon"
            >
              {a.label}
            </a>
          ))}
        </div>

        {data.upi_vpa ? (
          <p className="text-center text-[11px] text-white/40 mb-4">
            UPI: <span className="text-gold">{data.upi_vpa}</span>
          </p>
        ) : null}

        <p className="text-center text-[11px] text-white/35 leading-relaxed">
          Pay in your UPI app. This page updates automatically when BrightPay confirms
          (callback / status). Need help? WhatsApp {COMPANY.phone}
        </p>
      </div>
    </div>
  );
}
