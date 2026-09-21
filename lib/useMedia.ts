import { useEffect, useState } from 'react';

/** Reactive matchMedia. False until mounted, so SSR and first paint agree. */
export const useMedia = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [query]);
  return matches;
};

/** Phone-sized layout: copy stacks above the car, cards become a bottom sheet. */
export const PHONE = '(max-width: 768px)';

/** Lower render cost: small screens and anything with a touch-first pointer. */
export const LOW_POWER = '(max-width: 768px), (pointer: coarse)';
