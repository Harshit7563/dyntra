import { Link } from 'react-router-dom';
import { COMPANY, POLICY_LINKS } from '../data/company';

export default function PolicyLayout({ title, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{title}</span>
      </nav>

      <h1 className="font-serif text-3xl sm:text-4xl text-maroon mb-2">{title}</h1>
      <p className="text-xs text-gray-500 mb-8">
        Operated by {COMPANY.legalName} · CIN: {COMPANY.cin} · Last updated: {COMPANY.lastUpdated}
      </p>

      <div className="prose-policy space-y-6 text-gray-600 leading-relaxed text-sm">
        {children}
      </div>

      <section className="mt-12 pt-8 border-t border-gold/20">
        <h2 className="font-serif text-lg text-maroon mb-3">Contact Us</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {COMPANY.legalName}<br />
          {COMPANY.fullAddress}<br />
          Phone:{' '}
          <a href={COMPANY.phoneTel} className="text-maroon hover:underline">
            {COMPANY.phone}
          </a>
          <br />
          WhatsApp:{' '}
          <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline">
            {COMPANY.phone}
          </a>
          <br />
          Email:{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-maroon hover:underline">
            {COMPANY.email}
          </a>
        </p>
      </section>

      <section className="mt-8 pt-6 border-t border-gold/20">
        <p className="text-xs uppercase tracking-widest text-gold mb-3">Related Policies</p>
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
