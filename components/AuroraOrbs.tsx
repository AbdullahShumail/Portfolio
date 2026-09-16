import React from 'react';

/**
 * The slow-moving glow behind everything. Kept because the page should never
 * feel completely static, but pulled right back: cool greys with one faint warm
 * orb, all at low alpha so the ground reads as near-black.
 *
 * Painted as radial gradients rather than `filter: blur()` circles. A large
 * blur has to be recomposited every frame while it drifts, which measured at
 * roughly 45fps of cost across four orbs.
 */
const orb = (rgb: string, alpha: number) =>
  'radial-gradient(circle at 50% 50%, rgba(' +
  rgb +
  ',' +
  alpha +
  ') 0%, rgba(' +
  rgb +
  ',' +
  alpha * 0.4 +
  ') 34%, rgba(' +
  rgb +
  ',' +
  alpha * 0.1 +
  ') 58%, transparent 74%)';

const SLATE = '108,120,148';
const WARM = '190,132,96';

const ORBS: { className: string; style: React.CSSProperties }[] = [
  {
    className: 'left-[4%] top-[8%] h-[56vw] w-[56vw] max-h-[720px] max-w-[720px]',
    style: { backgroundImage: orb(SLATE, 0.075), animation: 'drift 34s ease-in-out infinite' },
  },
  {
    className: 'right-[2%] top-[36%] h-[44vw] w-[44vw] max-h-[580px] max-w-[580px]',
    style: {
      backgroundImage: orb(WARM, 0.05),
      animation: 'drift 44s ease-in-out infinite reverse',
      animationDelay: '-9s',
    },
  },
  {
    className: 'left-[26%] top-[72%] h-[46vw] w-[46vw] max-h-[600px] max-w-[600px]',
    style: {
      backgroundImage: orb(SLATE, 0.06),
      animation: 'drift 38s ease-in-out infinite',
      animationDelay: '-16s',
    },
  },
];

const AuroraOrbs: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {ORBS.map((o, i) => (
      <div key={i} className={'absolute rounded-full ' + o.className} style={o.style} />
    ))}
    {/* vignette so the screen edges stay black and type keeps its contrast */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(4,4,5,0.82)_100%)]" />
  </div>
);

export default AuroraOrbs;
