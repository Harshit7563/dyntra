import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, shopWithAI } from '../api';
import { useCart } from '../context/CartContext';

const CHIPS = [
  'Wedding saree',
  'Daily wear',
  'Under ₹3000',
  'Banarasi',
  'Gift for mom',
];

const WELCOME = {
  role: 'assistant',
  content:
    'Namaste — I’m Dyntra’s silk stylist. Tell me the occasion, fabric, budget, or colour you have in mind, and I’ll suggest sarees from our collection.',
  products: [],
};

export default function ShopWithAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  useEffect(() => {
    const openPanel = () => setOpen(true);
    window.addEventListener('dyntra-open-ai', openPanel);
    return () => window.removeEventListener('dyntra-open-ai', openPanel);
  }, []);

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    setError('');
    setInput('');
    const userMsg = { role: 'user', content, products: [] };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const payload = nextHistory
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content: c }) => ({ role, content: c }));
      const excludeIds = nextHistory.flatMap((m) => (m.products || []).map((p) => p.id));
      const data = await shopWithAI(payload, excludeIds);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Here are a few options.',
          products: Array.isArray(data.products) ? data.products : [],
        },
      ]);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Sorry — I couldn’t reach the stylist just now. Please try again.',
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 bg-maroon text-white pl-3 pr-4 py-3 shadow-lg hover:bg-maroon/90 transition-colors"
        aria-label="Shop with AI"
      >
        <span className="w-8 h-8 bg-white/15 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </span>
        <span className="text-xs uppercase tracking-[0.15em] font-medium">Shop with AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close chat backdrop"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-md h-full sm:h-[min(100%,720px)] sm:max-h-[90vh] sm:m-4 sm:rounded-sm bg-cream border border-gold/20 shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Dyntra AI shopping stylist"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-maroon text-white">
              <div>
                <p className="font-serif text-lg leading-tight">Dyntra AI</p>
                <p className="text-[10px] uppercase tracking-wider text-white/70">Silk shopping stylist</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/10"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={`${msg.role}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] ${
                      msg.role === 'user'
                        ? 'bg-maroon text-white px-3 py-2 text-sm'
                        : 'bg-white border border-gold/20 px-3 py-2 text-sm text-charcoal'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.products?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p) => {
                          const href = p.product_url || `/products/${p.slug}`;
                          const external = /^https?:\/\//i.test(href);
                          const LinkOrA = external
                            ? ({ children, className }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => setOpen(false)}>
                                  {children}
                                </a>
                              )
                            : ({ children, className }) => (
                                <Link to={href} className={className} onClick={() => setOpen(false)}>
                                  {children}
                                </Link>
                              );
                          return (
                          <div key={p.id} className="flex gap-3 border border-gold/15 bg-cream/80 p-2">
                            <LinkOrA className="shrink-0">
                              <img
                                src={p.image_url || '/placeholder-saree.jpg'}
                                alt=""
                                className="w-14 h-[72px] object-cover bg-gray-100"
                              />
                            </LinkOrA>
                            <div className="min-w-0 flex-1">
                              <LinkOrA className="text-xs font-medium text-maroon line-clamp-2 hover:underline">
                                {p.name}
                              </LinkOrA>
                              <p className="text-xs text-gold mt-0.5">{formatPrice(p.price)}</p>
                              {p.reason && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{p.reason}</p>}
                              <div className="flex gap-2 mt-2">
                                <LinkOrA className="text-[10px] uppercase tracking-wider border border-maroon/40 px-2 py-1 hover:bg-maroon hover:text-white transition-colors">
                                  View
                                </LinkOrA>
                                <button
                                  type="button"
                                  disabled={Number(p.stock) <= 0}
                                  onClick={() => addToCart(p)}
                                  className="text-[10px] uppercase tracking-wider bg-maroon text-white px-2 py-1 disabled:opacity-40"
                                >
                                  Add to cart
                                </button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <p className="text-xs text-gray-500 uppercase tracking-wider">Stylist is thinking…</p>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    disabled={loading}
                    onClick={() => send(chip)}
                    className="text-[11px] uppercase tracking-wider border border-gold/40 bg-white px-2.5 py-1.5 hover:border-maroon hover:text-maroon transition-colors disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {error && messages.length === 0 && (
              <p className="px-4 text-xs text-red-700">{error}</p>
            )}

            <form onSubmit={onSubmit} className="border-t border-gold/20 p-3 flex gap-2 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Dyntra AI"
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gold/30 text-sm bg-cream focus:outline-none focus:border-maroon"
                maxLength={800}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-maroon text-white text-xs uppercase tracking-wider disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
