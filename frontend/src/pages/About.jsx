import { Link } from 'react-router-dom';
import { COMPANY } from '../data/company';

export default function About() {
  return (
    <div>
      <section className="relative h-[40vh] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/15181110/pexels-photo-15181110.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Silk weaving"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-white">Our Story</h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-6 text-center">
          {COMPANY.brand} · {COMPANY.legalName}
        </p>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p className="font-serif text-2xl text-maroon text-center mb-8">
            Every thread tells a story of India
          </p>

          <p>
            At {COMPANY.brand}, we partner with master weavers from Kanchipuram and beyond to bring you pure,
            handwoven silk sarees. Every piece celebrates tradition, craftsmanship, and the timeless
            beauty of Indian silk.
          </p>

          <p>
            {COMPANY.brand} is operated by {COMPANY.legalName}, a company incorporated in Maharashtra, India
            (CIN: {COMPANY.cin}). We work directly with weaving communities to ensure fair practices,
            authentic materials, and sarees that become heirlooms passed down through generations.
          </p>

          <p>
            Each saree in our collection is carefully curated — from the rich zari pallus of Kanjivaram
            silks to the delicate floral jaals of Banarasi Mashroo. We believe that wearing silk is
            not just about fashion; it is about carrying forward centuries of artistry.
          </p>

          <p>
            Whether you shop online or reach out to our team, our silk stylists are here to help you find
            the perfect saree for every occasion — from everyday elegance to wedding grandeur.
          </p>
        </div>

        <div className="mt-12 bg-cream border border-gold/20 p-6 text-sm text-gray-600">
          <h2 className="font-serif text-lg text-maroon mb-3">Registered Office</h2>
          <p className="leading-relaxed">
            <strong>{COMPANY.legalName}</strong><br />
            CIN: {COMPANY.cin}<br />
            {COMPANY.fullAddress}
          </p>
          <p className="mt-3">
            Phone / WhatsApp:{' '}
            <a href={COMPANY.phoneTel} className="text-maroon hover:underline">{COMPANY.phone}</a>
            {' · '}
            <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline">
              Chat on WhatsApp
            </a>
          </p>
          <Link to="/contact" className="inline-block mt-4 text-maroon hover:underline text-sm">
            Contact Us →
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
