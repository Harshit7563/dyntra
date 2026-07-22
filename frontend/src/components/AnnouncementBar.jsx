import { useFestival } from '../context/FestivalContext';

const DEFAULT_MESSAGES = [
  'Free Shipping on Orders Above ₹999',
  '100% Purchase Protection',
  'WhatsApp for Quick Orders',
  'Use code FIRST10 for 10% off!',
];

export default function AnnouncementBar() {
  const { theme } = useFestival();
  const messages = theme?.announcements?.length ? theme.announcements : DEFAULT_MESSAGES;
  const text = messages.join('  ·  ');

  return (
    <div className="bg-maroon text-gold-light text-xs sm:text-sm py-2.5 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex w-max">
        <span className="inline-block px-8">{text}</span>
        <span className="inline-block px-8" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}
