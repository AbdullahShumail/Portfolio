import React, { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site';
import { SECTIONS, presence, scrollState } from '../lib/scrollState';
import { SplitText } from './TypeFX';
import ContactForm from './ContactForm';

interface OverlayProps {
  ready: boolean;
}

const NAV: { id: 'hero' | 'projects' | 'contact'; label: string; at: number }[] = [
  { id: 'hero', label: 'Home', at: SECTIONS.hero },
  { id: 'projects', label: 'Projects', at: SECTIONS.projects },
  { id: 'contact', label: 'Contact', at: SECTIONS.contact },
];

/**
 * Everything DOM that sits over the canvas: the nav buttons, the hero copy,
 * the contact panel, and a small progress readout. Positioning is written
 * straight to the nodes from one rAF that reads scrollState, so scrolling
 * costs no React renders. The nav's active state is the one exception, and
 * it only sets state when the section actually changes.
 */
const Overlay: React.FC<OverlayProps> = ({ ready }) => {
  const hero = useRef<HTMLDivElement>(null);
  const about = useRef<HTMLDivElement>(null);
  const drive = useRef<HTMLDivElement>(null);
  const contact = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const tValue = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<'hero' | 'drive' | 'projects' | 'contact'>('hero');

  useEffect(() => {
    let raf = 0;
    let lastSection = '';

    const place = (el: HTMLElement | null, p: number, dx: number) => {
      if (!el) return;
      el.style.opacity = p.toFixed(3);
      el.style.transform = 'translate3d(' + (dx * (1 - p)).toFixed(1) + 'px,0,0)';
      el.style.visibility = p < 0.01 ? 'hidden' : 'visible';
      // controls inside opt in with pointer-events-auto; the panel itself never
      // takes the pointer, so touch and wheel over the copy reach the scroll
      el.querySelectorAll<HTMLElement>('button, a, input, textarea, select').forEach((c) => {
        c.style.pointerEvents = p > 0.6 ? 'auto' : 'none';
      });
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const o = scrollState.offset;

      place(hero.current, presence(o, -1, -0.5, 0.04, 0.1), -40);
      place(about.current, presence(o, 0.115, 0.15, 0.185, 0.22), 40);
      place(drive.current, presence(o, 0.27, 0.33, 0.38, 0.43), 0);
      place(contact.current, presence(o, 0.9, 0.97, 2, 3), 40);

      if (bar.current) bar.current.style.transform = 'scaleX(' + o.toFixed(4) + ')';
      if (tValue.current) tValue.current.textContent = o.toFixed(3);

      if (scrollState.section !== lastSection) {
        lastSection = scrollState.section;
        setActive(scrollState.section);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const go = (at: number) => scrollState.seek?.(at);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {/* ---------------- top: progress line, name, readout ---------------- */}
      <div className="absolute inset-x-0 top-0 h-px bg-bone/10">
        <div ref={bar} className="h-px origin-left bg-bone/70" style={{ transform: 'scaleX(0)' }} />
      </div>
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-10">
        <button type="button" onClick={() => go(0)} className="pointer-events-auto text-sm font-bold tracking-tight text-bone">
          {SITE.shortName}
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-bone/30">
          t = <span ref={tValue} className="tabular-nums text-bone/55">0.000</span>
        </span>
      </header>

      {/* ---------------- bottom dock: the nav ---------------- */}
      <nav className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-bone/10 bg-obsidian/70 p-1.5 shadow-[0_20px_60px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl md:bottom-8">
        {NAV.map((n) => {
          const isActive = active === n.id || (n.id === 'hero' && active === 'drive');
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.at)}
              className={
                'rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ' +
                (isActive ? 'bg-bone text-obsidian' : 'text-bone/55 hover:text-bone')
              }
            >
              {n.label}
            </button>
          );
        })}
        <span className="mx-1 h-5 w-px bg-bone/10" />
        {SITE.social.map((s) => (
          <a
            key={s.short}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-bone/55 transition-colors hover:text-bone"
          >
            {s.short}
          </a>
        ))}
      </nav>

      {/* ---------------- hero copy, left ---------------- */}
      <div ref={hero} className="absolute inset-y-0 left-0 flex w-full flex-col justify-center px-6 md:w-[52%] md:px-10" style={{ willChange: 'opacity, transform', pointerEvents: 'none' }}>
        <div className="max-w-[540px]">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-bone/40">{SITE.hero.eyebrow}</p>
          <h1 className="text-[clamp(2.8rem,6.6vw,6.2rem)] font-bold leading-[0.95] tracking-tight text-bone">
            <span className="block overflow-hidden">
              <SplitText text="Abdullah" active={ready} delay={250} />
            </span>
            <span className="block overflow-hidden text-bone/55">
              <SplitText text="Shumail" active={ready} delay={400} />
            </span>
          </h1>
          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.24em] text-bone/60">
            AI Engineer &nbsp;/&nbsp; Full-Stack Developer
          </p>
          <p className="mt-6 max-w-md text-[15px] font-medium leading-[1.7] text-bone/55">{SITE.hero.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => go(SECTIONS.projects)} className="rounded-full bg-bone px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian transition-opacity hover:opacity-85">
              See the work
            </button>
            <button type="button" onClick={() => go(SECTIONS.contact)} className="rounded-full border border-bone/20 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-bone/70 transition-colors hover:border-bone/40 hover:text-bone">
              Get in touch
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- about, right, while the camera is over the bonnet ---------------- */}
      <div ref={about} className="absolute inset-y-0 right-0 flex w-full flex-col justify-center px-6 md:w-[50%] md:px-10" style={{ opacity: 0, willChange: 'opacity, transform', pointerEvents: 'none' }}>
        <div className="ml-auto w-full max-w-[520px]">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-bone/40">About</p>
          <h2 className="text-[clamp(1.7rem,3vw,2.7rem)] font-bold leading-[1.08] tracking-tight text-bone">
            I sit where the model meets the interface, and I own every layer in between.
          </h2>
          <div className="mt-6 space-y-4">
            {SITE.about.body.map((para, i) => (
              <p key={i} className="text-[15px] font-medium leading-[1.7] text-bone/55">
                {para}
              </p>
            ))}
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-bone/10 pt-6 sm:grid-cols-4">
            {[
              { k: 'Currently', v: SITE.about.now },
              { k: 'Based in', v: SITE.location.split('—')[0].trim() },
              { k: 'Focus', v: SITE.roles[0] },
              { k: 'Also', v: SITE.roles[1] },
            ].map((item) => (
              <div key={item.k}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bone/35">{item.k}</dt>
                <dd className="mt-1.5 text-[14px] font-bold tracking-tight text-bone/85">{item.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {SITE.about.stats.map((st) => (
              <div key={st.label}>
                <p className="text-3xl font-bold tracking-tight text-bone">{st.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-bone/40">{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- a single line while driving through the set ---------------- */}
      <div ref={drive} className="absolute inset-x-0 top-[18%] flex justify-center px-6" style={{ opacity: 0 }}>
        <p className="text-center text-[clamp(1.4rem,2.6vw,2.2rem)] font-bold tracking-tight text-bone/85">
          Four things I have shipped. <span className="text-bone/40">Keep scrolling.</span>
        </p>
      </div>

      {/* ---------------- contact, right ---------------- */}
      <div ref={contact} className="absolute inset-y-0 right-0 flex w-full flex-col justify-center px-6 md:w-[50%] md:px-10" style={{ opacity: 0, willChange: 'opacity, transform', pointerEvents: 'none' }}>
        <div className="ml-auto w-full max-w-[520px]">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-bone/40">Contact</p>
          <h2 className="text-[clamp(2rem,3.8vw,3.4rem)] font-bold leading-[1.02] tracking-tight text-bone">Tell me what you are building.</h2>
          <p className="mt-4 text-[15px] font-medium leading-[1.7] text-bone/55">
            If it needs a model, an interface, or both held together properly, it is probably my kind of problem.
          </p>
          <div className="mt-8">
            <ContactForm compact />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold text-bone/45">
            <a href={'mailto:' + SITE.email} className="transition-colors hover:text-bone">
              {SITE.email}
            </a>
            {SITE.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-bone">
                {s.label}
              </a>
            ))}
          </div>
          <p className="mt-8 text-[10px] font-medium leading-relaxed text-bone/25">
            3D model: 1975 Porsche 911 (930) Turbo by Lionsharp Studios, CC BY 4.0. &copy; {new Date().getFullYear()} {SITE.name}.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Overlay;
