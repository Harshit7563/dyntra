import { useMemo } from 'react';
import { useFestival } from '../context/FestivalContext';

const COUNT = {
  lights: 28,
  sparkle: 32,
  colors: 36,
  petals: 24,
  ribbon: 20,
  crescent: 18,
  moon: 18,
  glow: 22,
  snow: 40,
  embers: 26,
  harvest: 22,
  kites: 14,
  tricolor: 24,
  shimmer: 28,
};

/** Festive overlay — particle shapes + soft ambient glow */
export default function FestivalEffects() {
  const { theme } = useFestival();
  const anim = theme?.active ? theme.animation || 'shimmer' : 'none';

  const bits = useMemo(() => {
    const n = COUNT[anim] || 24;
    return Array.from({ length: n }, (_, i) => {
      const seed = (i * 47) % 100;
      return {
        i,
        left: `${(i * 37 + seed * 0.3) % 100}%`,
        size: 4 + (seed % 10),
        delay: -((i * 0.38) % 12),
        duration: 7 + (seed % 8),
        drift: -40 + (seed % 80),
        opacity: 0.35 + (seed % 50) / 100,
      };
    });
  }, [anim]);

  if (!theme?.active || anim === 'none') return null;

  return (
    <div className={`festival-fx festival-fx--${anim}`} aria-hidden="true">
      <div className="festival-fx__glow" />
      {bits.map((b) => (
        <span
          key={b.i}
          className="festival-fx__bit"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            '--drift': `${b.drift}px`,
            '--spin': `${120 + (b.i % 5) * 60}deg`,
          }}
        />
      ))}
    </div>
  );
}
