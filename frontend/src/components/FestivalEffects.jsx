import { useMemo } from 'react';
import { useFestival } from '../context/FestivalContext';

const COUNT = {
  confetti: 36,
  bonfire: 28,
  kites: 14,
  rice_grain: 26,
  bihu_fire: 24,
  tricolor: 28,
  yellow_petals: 26,
  bilva_glow: 20,
  prayer_flags: 18,
  holika_fire: 30,
  gulal: 40,
  garba: 28,
  mango_leaf: 22,
  gudi: 16,
  saffron_glow: 22,
  lotus_blue: 20,
  wheat: 26,
  vishu_kani: 24,
  kolam: 30,
  bihu_dance: 28,
  saffron_ember: 26,
  solemn: 14,
  pastel_egg: 22,
  lotus_moon: 18,
  gold_coins: 24,
  dhanteras_gold: 26,
  crescent: 16,
  crescent_teal: 16,
  crescent_gold: 16,
  chariot: 18,
  wisdom_glow: 20,
  pot_colors: 32,
  solemn_soft: 12,
  rakhi_ribbon: 22,
  serpent_green: 18,
  peacock: 24,
  pookalam: 30,
  tricolor_wave: 28,
  navroz_spark: 26,
  ganesh_modak: 24,
  craft_sparks: 28,
  nuakhai_grain: 24,
  garba_night: 32,
  dhak_petals: 28,
  victory_flame: 26,
  moonrise: 14,
  soft_quill: 16,
  diya_small: 22,
  diya_lights: 30,
  mountain_glow: 20,
  sibling_ribbon: 20,
  sun_rays: 18,
  nishan_glow: 18,
  balloons: 16,
  snow_pine: 40,
  tribal_feather: 22,
  fireworks: 34,
  shimmer: 24,
};

/** Per-festival particle overlay */
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
        size: 4 + (seed % 12),
        delay: -((i * 0.35) % 14),
        duration: 6.5 + (seed % 9),
        drift: -45 + (seed % 90),
        opacity: 0.4 + (seed % 45) / 100,
      };
    });
  }, [anim]);

  if (!theme?.active || anim === 'none') return null;

  return (
    <div
      className={`festival-fx festival-fx--${anim}`}
      aria-hidden="true"
      style={{
        '--fx-a': theme.accent_primary || '#7B1E3A',
        '--fx-b': theme.accent_secondary || '#C9A84C',
      }}
    >
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
            '--spin': `${120 + (b.i % 5) * 72}deg`,
          }}
        />
      ))}
    </div>
  );
}
