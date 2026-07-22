import { useFestival } from '../context/FestivalContext';

export default function AnnouncementBar() {
  const { theme } = useFestival();
  const messages = theme?.announcements?.length
    ? theme.announcements
    : [
        'Free Shipping on Orders Above ₹999',
        '100% Purchase Protection',
        'WhatsApp for Quick Orders',
        'Use code FIRST10 for 10% off! 🎉',
      ];

  const text = messages.join('  ·  ');

  return (
    <div className="bg-maroon text-gold-light text-xs sm:text-sm py-2 overflow-hidden">
      {theme?.active && theme?.label ? (
        <div className="text-center text-[10px] sm:text-xs tracking-[0.2em] uppercase pb-1 opacity-90">
          {theme.label}
          {theme.tagline ? ` — ${theme.tagline}` : ''}
        </div>
      ) : null}
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="px-4">{text}</span>
        <span className="px-4">{text}</span>
      </div>
    </div>
  );
}
