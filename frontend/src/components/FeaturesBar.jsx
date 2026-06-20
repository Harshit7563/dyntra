function IconWrap({ children, inline = false }) {
  if (inline) {
    return (
      <div className="w-9 h-9 shrink-0 rounded-full bg-maroon/5 border border-gold/30 flex items-center justify-center text-maroon">
        {children}
      </div>
    );
  }
  return (
    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-maroon/5 to-gold/10 border border-gold/40 flex items-center justify-center text-maroon shadow-sm">
      {children}
    </div>
  );
}

function Svg({ children, className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {children}
    </svg>
  );
}

export function SilkCertifiedIcon({ inline = false }) {
  return (
    <IconWrap inline={inline}>
      <Svg>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </Svg>
    </IconWrap>
  );
}

export function FreeShippingIcon({ inline = false }) {
  return (
    <IconWrap inline={inline}>
      <Svg>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 8h12v7H2V8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h3l2.5 3v2H14v-5z" />
        <circle cx="6" cy="17" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none" />
        <path strokeLinecap="round" d="M2 11h12" opacity="0.5" />
      </Svg>
    </IconWrap>
  );
}

export function ReturnsIcon({ inline = false }) {
  return (
    <IconWrap inline={inline}>
      <Svg>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h10a3 3 0 013 3v1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11L5 8l3-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 16H9a3 3 0 01-3-3v-1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 13l3 3-3 3" />
      </Svg>
    </IconWrap>
  );
}

export function WhatsAppIcon({ inline = false }) {
  return (
    <IconWrap inline={inline}>
      <Svg>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 17.5L5 20l2.6-.8A7.5 7.5 0 1012 4.5a7.5 7.5 0 00-4.5 13z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 10.5c.3.8 1.2 1.7 2 2l1-1.5" />
      </Svg>
    </IconWrap>
  );
}

export function CustomersIcon({ inline = false }) {
  return (
    <IconWrap inline={inline}>
      <Svg>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.2 4.5 5 .7-3.6 3.5.9 5L12 13.8 7.5 15.7l.9-5L4.8 7.2l5-.7L12 2z" />
      </Svg>
    </IconWrap>
  );
}

const FEATURES = [
  { Icon: SilkCertifiedIcon, title: 'Pure Silk Certified', desc: 'Authentic handloom silk' },
  { Icon: FreeShippingIcon, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { Icon: ReturnsIcon, title: '7-Day Returns', desc: 'Easy exchange & returns' },
  { Icon: WhatsAppIcon, title: 'WhatsApp Support', desc: 'Chat with our silk stylists' },
  { Icon: CustomersIcon, title: '1000+ Customers', desc: 'Trusted by saree lovers' },
];

export default function FeaturesBar() {
  return (
    <section className="border-y border-gold/20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-6 lg:gap-8 sm:overflow-visible">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="text-center group min-w-[140px] sm:min-w-0 snap-start shrink-0 sm:shrink">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <Icon />
              </div>
              <h3 className="font-serif text-sm sm:text-base font-medium text-maroon">{title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { FEATURES };
