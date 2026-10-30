import React, { useMemo } from 'react';

interface LuxuryBackgroundProps {
  /** Optional photo shown very faintly under the glow layers. */
  imageUrl?: string;
}

/**
 * Fixed, non-interactive dark-luxury backdrop:
 * obsidian base, drifting burgundy + gold glows, film grain, vignette
 * and a few slowly rising golden embers.
 */
export const LuxuryBackground: React.FC<LuxuryBackgroundProps> = ({ imageUrl }) => {
  const embers = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 61 + 7) % 100,
        size: 2 + (i % 4),
        delay: (i * 1.3) % 14,
        duration: 12 + (i % 6) * 3,
        drift: ((i % 5) - 2) * 18
      })),
    []
  );

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#050506]" />
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.07] mix-blend-luminosity"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="lux-orb lux-orb-burgundy" />
      <div className="lux-orb lux-orb-gold" />
      <div className="absolute inset-0 lux-vignette" />
      <div className="absolute inset-0 lux-grain" />
      {embers.map((e, i) => (
        <span
          key={i}
          className="lux-ember"
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDelay: `-${e.delay}s`,
              animationDuration: `${e.duration}s`,
              '--drift': `${e.drift}px`
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
