import React, { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site';
import { heroState } from '../lib/heroState';

const Icon = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <circle cx="12" cy="8" r="3.4" />
      <path strokeLinecap="round" d="M4.8 20c.9-3.6 3.8-5.4 7.2-5.4s6.3 1.8 7.2 5.4" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </svg>
  ),
  work: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <rect x="3" y="6.5" width="18" height="13" rx="2" />
      <path strokeLinecap="round" d="M8.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v1.5" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 5.6L20 7" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7 0-.7 0-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C16.9 4.7 17.9 5 17.9 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5ZM8 19H5V8h3v11ZM6.5 6.7a1.8 1.8 0 1 1 0-3.5 1.8 1.8 0 0 1 0 3.5ZM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.5V19Z" />
    </svg>
  ),
};

export interface NavTarget {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** When set, the item lives inside the 3D hero at this scroll offset. */
  seek?: number;
}

export const NAV_TARGETS: NavTarget[] = [
  { id: 'top', label: 'Home', icon: Icon.home, seek: 0 },
  { id: 'profile', label: 'About', icon: Icon.profile, seek: 0.5 },
  { id: 'capabilities', label: 'Capabilities', icon: Icon.grid, seek: 0.75 },
  { id: 'work', label: 'Work', icon: Icon.work },
  { id: 'contact', label: 'Contact', icon: Icon.mail },
];

const go = (item: NavTarget) => {
  if (item.seek !== undefined) {
    // Bring the hero back into view, then drive its inner scroll to the beat.
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const target = item.seek;
    const fire = () => heroState.seek?.(target);
    if (window.scrollY > 4) window.setTimeout(fire, 450);
    else fire();
    return;
  }
  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ------------------------------------------------------------------ */

export const TopBar: React.FC<{ onContact: () => void }> = ({ onContact }) => {
  const [progress, setProgress] = useState(0);
  const [solid, setSolid] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        setSolid(window.scrollY > 40);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="h-px origin-left bg-bone/25"
        style={{ transform: 'scaleX(' + progress + ')', transition: 'transform 120ms linear' }}
      />
      <div
        className="flex items-center justify-between px-6 py-5 md:px-12"
        style={{
          background: solid ? 'rgba(4,4,5,0.72)' : 'transparent',
          backdropFilter: solid ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: solid ? 'blur(14px)' : 'none',
          borderBottom: solid ? '1px solid var(--hairline)' : '1px solid transparent',
          transition: 'background 400ms, border-color 400ms',
        }}
      >
        <button
          type="button"
          onClick={() => go(NAV_TARGETS[0])}
          className="font-display text-sm font-light tracking-tight text-bone/85 transition-colors duration-300 hover:text-bone"
        >
          {SITE.shortName}
        </button>

        <div className="hidden items-center gap-8 font-mono text-[10px] uppercase tracking-[0.26em] text-bone/35 lg:flex">
          <span>{SITE.location}</span>
          <span className="tabular-nums text-bone/50">{clock}</span>
        </div>

        <button
          type="button"
          onClick={onContact}
          className="rounded-full border border-bone/15 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/70 transition-colors duration-300 hover:border-bone/35 hover:text-bone"
        >
          Start a project
        </button>
      </div>
    </header>
  );
};

/* ------------------------------------------------------------------ */

export const Dock: React.FC<{ active: string }> = ({ active }) => {
  const ref = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const host = ref.current;
    if (!host) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const onMove = (e: PointerEvent) => {
      itemsRef.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const scale = Math.max(1, 1.55 - d / 105);
        el.style.transform = 'scale(' + scale + ') translateY(' + (scale - 1) * -12 + 'px)';
      });
    };

    const onLeave = () => {
      itemsRef.current.forEach((el) => {
        if (el) el.style.transform = 'scale(1) translateY(0)';
      });
    };

    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const externals = [
    { id: 'gh', label: 'GitHub', icon: Icon.github, href: SITE.social[0].href },
    { id: 'ln', label: 'LinkedIn', icon: Icon.linkedin, href: SITE.social[1].href },
  ];

  return (
    <nav
      ref={ref}
      aria-label="Section navigation"
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-end gap-1 rounded-[22px] border border-bone/10 bg-ink/70 p-1.5 shadow-[0_20px_60px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl md:bottom-8"
    >
      {NAV_TARGETS.map((item, i) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            onClick={() => go(item)}
            aria-label={item.label}
            aria-current={isActive ? 'true' : undefined}
            className={
              'group relative flex h-10 w-10 origin-bottom items-center justify-center rounded-[14px] transition-colors duration-300 md:h-11 md:w-11 ' +
              (isActive ? 'bg-bone/[0.08] text-bone' : 'text-bone/35 hover:text-bone/75')
            }
            style={{ transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1), color 300ms, background 300ms' }}
          >
            {item.icon}
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-bone/10 bg-obsidian px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-bone opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {item.label}
            </span>
            {isActive ? (
              <span className="absolute -bottom-0.5 h-[3px] w-[3px] rounded-full bg-bone/60" />
            ) : null}
          </button>
        );
      })}

      <span className="mx-1 h-6 w-px self-center bg-bone/10" />

      {externals.map((item, i) => (
        <button
          key={item.id}
          type="button"
          ref={(el) => {
            itemsRef.current[NAV_TARGETS.length + i] = el;
          }}
          onClick={() => window.open(item.href, '_blank', 'noopener,noreferrer')}
          aria-label={item.label}
          className="group relative flex h-10 w-10 origin-bottom items-center justify-center rounded-[14px] text-bone/35 transition-colors duration-300 hover:text-bone/75 md:h-11 md:w-11"
          style={{ transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1), color 300ms' }}
        >
          {item.icon}
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-bone/10 bg-obsidian px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-bone opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};
