import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, placeOrder, fetchPaymentConfig, buildPaymentRedirect } from '../api';
import { calcOrderTotals, FREE_SHIPPING_MIN, COD_MAX_PRODUCT_PRICE } from '../utils/order';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const DEFAULT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_METHODS);

  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    payment_method: 'cod',
  });

  const [paymentConfig, setPaymentConfig] = useState(null);

  useEffect(() => {
    fetchPaymentConfig()
      .then((config) => {
        setPaymentConfig(config);
        const codMax = config.cod_max_product_price ?? COD_MAX_PRODUCT_PRICE;
        const codEligible = items.every((item) => Number(item.price) <= codMax);
        const available = (config.methods || []).filter(
          (m) => m.id !== 'cod' || codEligible
        );
        if (available.length) {
          setPaymentMethods(available);
          setForm((prev) => ({
            ...prev,
            payment_method: available.some((m) => m.id === prev.payment_method)
              ? prev.payment_method
              : available[0].id,
          }));
        }
      })
      .catch(console.error);
  }, [items]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: user.name || prev.customer_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const codMax = paymentConfig?.cod_max_product_price ?? COD_MAX_PRODUCT_PRICE;
  const codEligible = items.every((item) => Number(item.price) <= codMax);
  const codBlockedItems = items.filter((item) => Number(item.price) > codMax);

  const { shipping, discount, total: grandTotal } = calcOrderTotals(total, appliedCoupon);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'FIRST10') {
      setAppliedCoupon('FIRST10');
      setCouponMsg('10% discount applied!');
    } else {
      setAppliedCoupon('');
      setCouponMsg('Invalid coupon code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: { pathname: '/checkout' } } });
      return;
    }
    setError('');
    setLoading(true);
    try {
      const order = await placeOrder({
        ...form,
        coupon_code: appliedCoupon,
        items: items.map(({ id, quantity }) => ({ id, quantity })),
      });

      if (form.payment_method === 'online') {
        sessionStorage.setItem(`order-email-${order.order_number}`, form.email.trim().toLowerCase());
        const { payment_url } = await buildPaymentRedirect({
          order_number: order.order_number,
          total: order.total,
          email: form.email,
          phone: form.phone,
          customer_name: form.customer_name,
        });
        clearCart();
        window.location.href = payment_url;
        return;
      }

      if (form.payment_method === 'upi') {
        clearCart();
        sessionStorage.setItem(`order-email-${order.order_number}`, form.email.trim().toLowerCase());
        navigate(
          `/pay/${order.order_number}?email=${encodeURIComponent(form.email.trim().toLowerCase())}`,
          { state: { order } }
        );
        return;
      }

      clearCart();
      sessionStorage.setItem(`order-email-${order.order_number}`, form.email.trim().toLowerCase());
      navigate(`/order-success/${order.order_number}`, { state: { order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/checkout' } }} />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-maroon mb-4">Checkout</h1>
        <p className="text-gray-500 mb-8">Your cart is empty</p>
        <Link to="/products" className="inline-block px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-xs text-gray-500 mb-6">
        <Link to="/cart" className="hover:text-maroon">Cart</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">Checkout</span>
      </nav>

      <h1 className="font-serif text-3xl text-maroon mb-8">Checkout</h1>

      <form id="checkout-form" onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10 pb-24 lg:pb-0">
        <div className="lg:col-span-2 space-y-8">
          {/* Contact */}
          <section className="bg-white border border-gold/20 p-6">
            <h2 className="font-serif text-xl text-maroon mb-5">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Full Name *</label>
                <input required value={form.customer_name} onChange={(e) => updateField('customer_name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Phone *</label>
                <input required type="tel" pattern="[6-9][0-9]{9}" value={form.phone} onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" placeholder="10-digit mobile" />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="bg-white border border-gold/20 p-6">
            <h2 className="font-serif text-xl text-maroon mb-5">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Address Line 1 *</label>
                <input required value={form.address_line1} onChange={(e) => updateField('address_line1', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" placeholder="House no, street, area" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Address Line 2</label>
                <input value={form.address_line2} onChange={(e) => updateField('address_line2', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" placeholder="Landmark (optional)" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">City *</label>
                  <input required value={form.city} onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">State *</label>
                  <select required value={form.state} onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm bg-white">
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Pincode *</label>
                  <input required pattern="\d{6}" maxLength={6} value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" placeholder="560001" />
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white border border-gold/20 p-6">
            <h2 className="font-serif text-xl text-maroon mb-5">Payment Method</h2>
            {!codEligible && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 mb-4">
                Cash on Delivery is available only for products up to {formatPrice(codMax)}.
                {codBlockedItems.length > 0 && (
                  <> Remove {codBlockedItems.map((i) => `"${i.name}"`).join(', ')} or choose online payment.</>
                )}
              </p>
            )}
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <label key={pm.id} className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${form.payment_method === pm.id ? 'border-maroon bg-maroon/5' : 'border-gold/20 hover:border-gold'}`}>
                  <input type="radio" name="payment" value={pm.id} checked={form.payment_method === pm.id}
                    onChange={() => updateField('payment_method', pm.id)} className="mt-1 accent-maroon" />
                  <div>
                    <p className="font-medium text-sm">{pm.label}</p>
                    <p className="text-xs text-gray-500">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gold/20 p-6 sticky top-24 sm:top-28">
            <h2 className="font-serif text-xl text-maroon mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <img src={item.image_url} alt="" className="w-12 h-16 object-cover bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-2 text-xs">{item.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-maroon text-xs shrink-0">{formatPrice(Number(item.price) * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code"
                className="flex-1 px-3 py-2 border border-gold/30 text-sm focus:outline-none focus:border-maroon" />
              <button type="button" onClick={applyCoupon}
                className="px-4 py-2 border border-maroon text-maroon text-xs uppercase tracking-wider hover:bg-maroon hover:text-white transition-colors">
                Apply
              </button>
            </div>
            {couponMsg && <p className={`text-xs mb-4 ${appliedCoupon ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}

            <div className="space-y-2 text-sm border-t border-gold/20 pt-4">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(total)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount (FIRST10)</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-gold/20">
                <span>Total</span><span className="text-maroon">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              By placing your order, you agree to our{' '}
              <Link to="/terms-and-conditions" className="text-maroon hover:underline">Terms</Link>,{' '}
              <Link to="/shipping-policy" className="text-maroon hover:underline">Shipping</Link> &amp;{' '}
              <Link to="/refund-policy" className="text-maroon hover:underline">Refund Policies</Link>.
            </p>

            <button type="submit" disabled={loading}
              className="w-full mt-6 py-3.5 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors disabled:opacity-60">
              {loading
                ? 'Placing Order...'
                : form.payment_method === 'online' || form.payment_method === 'upi'
                  ? 'Continue to Pay'
                  : 'Place Order'}
            </button>

            {total < FREE_SHIPPING_MIN && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                Add {formatPrice(FREE_SHIPPING_MIN - total)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </form>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gold/20 p-4 z-40 shadow-lg">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-medium text-maroon">{formatPrice(grandTotal)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="flex-1 max-w-xs py-3 bg-maroon text-white text-sm uppercase tracking-widest disabled:opacity-60"
          >
            {loading
              ? 'Placing...'
              : form.payment_method === 'online' || form.payment_method === 'upi'
                ? 'Continue to Pay'
                : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
