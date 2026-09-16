import React from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  /** Gate the animation until the page is ready. */
  active?: boolean;
  delay?: number;
  stagger?: number;
}

/**
 * Per-character reveal for the hero name. Opacity and a small rise only, so it
 * reads as the text settling rather than as an effect.
 */
export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  active = true,
  delay = 0,
  stagger = 38,
}) => (
  <span className={'inline-block ' + className} aria-label={text}>
    {text.split('').map((ch, i) => (
      <span
        key={i}
        aria-hidden="true"
        className="inline-block"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? 'translate3d(0,0,0)' : 'translate3d(0,0.3em,0)',
          transition:
            'opacity 800ms cubic-bezier(0.16,1,0.3,1), transform 950ms cubic-bezier(0.16,1,0.3,1)',
          transitionDelay: delay + i * stagger + 'ms',
        }}
      >
        {ch === ' ' ? ' ' : ch}
      </span>
    ))}
  </span>
);
