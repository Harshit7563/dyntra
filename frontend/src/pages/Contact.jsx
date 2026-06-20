import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY, POLICY_LINKS } from '../data/company';
import { submitContactForm } from '../api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const res = await submitContactForm(form);
      setStatus(res.message);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">Contact Us</span>
      </nav>

      <h1 className="font-serif text-3xl sm:text-4xl text-maroon mb-8">Contact Us</h1>

      <div className="grid sm:grid-cols-2 gap-8 mb-10">
        <section className="bg-white border border-gold/20 p-6">
          <h2 className="font-serif text-xl text-maroon mb-4">Company Details</h2>
          <dl className="space-y-3 text-sm text-gray-600">
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Brand</dt>
              <dd>{COMPANY.brand}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Legal Name</dt>
              <dd>{COMPANY.legalName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">CIN</dt>
              <dd>{COMPANY.cin}</dd>
            </div>
          </dl>
        </section>

        <section className="bg-white border border-gold/20 p-6">
          <h2 className="font-serif text-xl text-maroon mb-4">Registered Office</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {COMPANY.address.line1}<br />
            {COMPANY.address.line2}<br />
            {COMPANY.address.city}, {COMPANY.address.state}<br />
            {COMPANY.address.country} – {COMPANY.address.pincode}
          </p>
        </section>
      </div>

      <section className="bg-white border border-gold/20 p-6 mb-8">
        <h2 className="font-serif text-xl text-maroon mb-4">Customer Support</h2>
        <div className="text-sm space-y-2 mb-6">
          <p>
            Phone:{' '}
            <a href={COMPANY.phoneTel} className="text-maroon hover:underline">
              {COMPANY.phone}
            </a>
          </p>
          <p>
            WhatsApp:{' '}
            <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline">
              {COMPANY.phone}
            </a>
          </p>
          <p>
            Email:{' '}
            <a href={`mailto:${COMPANY.email}`} className="text-maroon hover:underline">
              {COMPANY.email}
            </a>
          </p>
        </div>

        <h3 className="font-serif text-lg text-maroon mb-4">Send us a message</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</label>
              <input type="tel" pattern="[6-9][0-9]{9}" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Subject</label>
              <input value={form.subject} onChange={(e) => update('subject', e.target.value)}
                className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Message *</label>
            <textarea required rows={5} value={form.message} onChange={(e) => update('message', e.target.value)}
              className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {status && <p className="text-green-700 text-sm">{status}</p>}
          <button type="submit" disabled={loading}
            className="px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>

      <section className="pt-6 border-t border-gold/20">
        <p className="text-xs uppercase tracking-widest text-gold mb-3">Policies</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {POLICY_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-maroon hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
