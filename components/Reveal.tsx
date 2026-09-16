import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  /** Direction the element travels in from. */
  from?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Adds a blur-in on top of the translate. */
  blur?: boolean;
  className?: string;
  threshold?: number;
  as?: 'div' | 'span' | 'li';
}

/**
 * Scroll reveal. Fires once, so content does not flicker back out when you
 * scroll past it and return.
 */
const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  from = 'up',
  blur = true,
  className = '',
  threshold = 0.15,
  as = 'div',
}) => {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const offset = () => {
    if (shown || from === 'none') return 'translate3d(0,0,0)';
    if (from === 'up') return 'translate3d(0,34px,0)';
    if (from === 'down') return 'translate3d(0,-34px,0)';
    if (from === 'left') return 'translate3d(-34px,0,0)';
    return 'translate3d(34px,0,0)';
  };

  // createElement rather than a dynamic <Tag>: with react-three-fiber's JSX
  // augmentation loaded, TypeScript collapses a dynamic ElementType to never.
  return React.createElement(
    as,
    {
      ref,
      className,
      style: {
        opacity: shown ? 1 : 0,
        transform: offset(),
        filter: blur && !shown ? 'blur(10px)' : 'blur(0px)',
        transition:
          'opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 1100ms cubic-bezier(0.16,1,0.3,1), filter 900ms cubic-bezier(0.16,1,0.3,1)',
        transitionDelay: delay + 'ms',
        willChange: shown ? 'auto' : 'opacity, transform, filter',
      } as React.CSSProperties,
    },
    children
  );
};

export default Reveal;
