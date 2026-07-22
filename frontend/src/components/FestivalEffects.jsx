import { useMemo } from 'react';
import { useFestival } from '../context/FestivalContext';

/** Lightweight overlay particles — only when festival theme is active */
export default function FestivalEffects() {
  const { theme } = useFestival();
  const anim = theme?.active ? theme.animation || 'shimmer' : 'none';

  const bits = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);

  if (!theme?.active || anim === 'none') return null;

  return (
    <div
      className={`festival-fx festival-fx--${anim}`}
      aria-hidden="true"
    >
      {bits.map((i) => (
        <span key={i} className="festival-fx__bit" style={{ '--i': i }} />
      ))}
    </div>
  );
}
