export default function AnnouncementBar() {
  const messages = [
    'Free Shipping on Orders Above ₹999',
    '100% Purchase Protection',
    'WhatsApp for Quick Orders',
    'Use code FIRST10 for 10% off! 🎉',
  ];

  const text = messages.join('  ·  ');

  return (
    <div className="bg-maroon text-gold-light text-xs sm:text-sm py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="px-4">{text}</span>
        <span className="px-4">{text}</span>
      </div>
    </div>
  );
}
