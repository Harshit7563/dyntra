import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { fetchOrder, confirmPayment, formatPrice } from '../api';
import { COMPANY } from '../data/company';

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  upi: 'UPI / PhonePe / GPay',
  card: 'Debit / Credit Card',
  online: 'Online Payment',
};

function getStoredOrderEmail(orderNumber) {
  return sessionStorage.getItem(`order-email-${orderNumber}`) || '';
}

function getPaymentReference(searchParams) {
  return (
    searchParams.get('txn_id') ||
    searchParams.get('payment_id') ||
    searchParams.get('transaction_id') ||
    searchParams.get('reference') ||
    searchParams.get('ref') ||
    null
  );
}

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentFailed, setPaymentFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError('');
      setPaymentFailed(false);

      try {
        const params = new URLSearchParams(location.search);
        const paymentStatus = params.get('payment');
        const email =
          location.state?.order?.email ||
          getStoredOrderEmail(orderNumber) ||
          params.get('email') ||
          '';

        if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
          if (!cancelled) setPaymentFailed(true);
        }

        if (paymentStatus === 'success') {
          const paymentRef = getPaymentReference(params) || 'gateway_return';
          try {
            await confirmPayment(orderNumber, paymentRef);
          } catch (confirmErr) {
            if (!confirmErr.message?.includes('already paid')) {
              // Order may already be confirmed via webhook — continue loading order
              const msg = confirmErr.message || '';
              if (!msg.includes('already paid') && !msg.includes('not found')) {
                throw confirmErr;
              }
            }
          }
        }

        const current = await fetchOrder(orderNumber, email);

        if (!cancelled) {
          setOrder(current);
          sessionStorage.removeItem(`order-email-${orderNumber}`);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          if (!location.state?.order) setOrder(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, location.state, location.search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-serif text-xl text-maroon animate-pulse">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 px-4">
        <p className="font-serif text-xl text-gray-500 mb-2">Order not found</p>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <Link to="/products" className="text-maroon underline">Continue Shopping</Link>
      </div>
    );
  }

  const items = order.items || [];
  const paymentLabel = PAYMENT_LABELS[order.payment_method] || order.payment_method;
  const isPending = order.payment_status === 'pending';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${paymentFailed || isPending ? 'bg-amber-100' : 'bg-green-100'}`}>
        {paymentFailed || isPending ? (
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl text-maroon mb-2">
        {paymentFailed ? 'Payment Not Completed' : isPending ? 'Payment Pending' : 'Order Confirmed!'}
      </h1>
      <p className="text-gray-600 mb-1">Thank you for shopping with Dyntra</p>
      <p className="text-xs text-gray-400 mb-2">DYNATRADEX PRIVATE LIMITED · CIN: U46901MH2025PTC463624</p>
      <p className="text-sm text-gray-500 mb-8">
        Order <span className="font-medium text-charcoal">{order.order_number || orderNumber}</span>
      </p>

      {(paymentFailed || isPending) && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-4 mb-8">
          {paymentFailed
            ? 'Your payment was not completed. You can retry checkout or contact us on WhatsApp.'
            : 'Complete payment at the gateway to confirm your order. Confirmation email is sent after payment is verified.'}
        </p>
      )}

      <div className="bg-white border border-gold/20 p-6 text-left mb-8">
        <h2 className="font-serif text-lg text-maroon mb-4">Order Details</h2>

        <div className="space-y-3 mb-5">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm border-b border-gold/10 pb-3 last:border-0">
              {item.image_url && (
                <img src={item.image_url} alt="" className="w-12 h-16 object-cover bg-gray-100 shrink-0" />
              )}
              <div className="flex-1">
                <p className="line-clamp-2">{item.product_name}</p>
                <p className="text-gray-500 text-xs mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="text-maroon shrink-0">{formatPrice(Number(item.price) * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm border-t border-gold/20 pt-4">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{Number(order.shipping) === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between font-medium text-lg pt-2">
            <span>Total</span><span className="text-maroon">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gold/20 text-sm text-gray-600 space-y-1">
          <p><span className="text-gray-400">Payment:</span> {paymentLabel}</p>
          {order.email && <p><span className="text-gray-400">Email:</span> {order.email}</p>}
          {order.phone && <p><span className="text-gray-400">Phone:</span> {order.phone}</p>}
          {order.address_line1 && (
            <p><span className="text-gray-400">Delivery:</span> {order.address_line1}, {order.city}, {order.state} – {order.pincode}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-8">
        {!isPending && !paymentFailed
          ? 'Order confirmation has been sent to your email. Expected delivery in 5–7 business days.'
          : 'Need help? Reach us on WhatsApp or email.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/products" className="px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors">
          Continue Shopping
        </Link>
        <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="px-8 py-3 border border-maroon text-maroon text-sm uppercase tracking-widest hover:bg-maroon hover:text-white transition-colors">
          WhatsApp Support
        </a>
      </div>
    </div>
  );
}
