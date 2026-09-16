import React, { useEffect, useRef } from 'react';
import { SITE } from '../../data/site';
import { SplitText } from '../TypeFX';
import { STAGE_LABELS, heroState, presence, smoothstep } from '../../lib/heroState';
import PathMinimap from './PathMinimap';

interface HeroPanelsProps {
  ready: boolean;
  onContact: () => void;
}

type Side = 'left' | 'right';

const panelClass = (side: Side) =>
  'pointer-events-none absolute inset-y-0 flex w-full flex-col justify-start px-6 pt-28 md:w-[50%] md:justify-center md:px-12 md:pt-0 ' +
  (side === 'left' ? 'left-0 md:pr-6' : 'right-0 md:pl-6');

/**
 * Backdrop behind a panel: a wash toward its edge so the copy stays readable
 * over chrome, and a warm pool of light that echoes the lamp in the scene.
 */
const backdrop = (side: Side) =>
  side === 'left'
    ? 'linear-gradient(90deg, rgba(4,4,5,0.92) 0%, rgba(4,4,5,0.72) 55%, rgba(4,4,5,0) 100%), radial-gradient(560px 460px at 28% 48%, rgba(255,233,207,0.055), transparent 70%)'
    : 'linear-gradient(270deg, rgba(4,4,5,0.92) 0%, rgba(4,4,5,0.72) 55%, rgba(4,4,5,0) 100%), radial-gradient(560px 460px at 72% 48%, rgba(255,233,207,0.055), transparent 70%)';

const LABEL = 'font-mono text-[10px] uppercase tracking-[0.34em] text-bone/30';
const BODY = 'text-[15px] leading-[1.75] text-bone/45';
const BTN_PRIMARY =
  'rounded-full bg-bone px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-obsidian transition-opacity duration-300 hover:opacity-85';
const BTN_GHOST =
  'rounded-full border border-bone/15 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/65 transition-colors duration-300 hover:border-bone/35 hover:text-bone';

/**
 * Everything the hero says, one panel per beat. A single rAF reads
 * heroState.offset and writes opacity/transform straight to the nodes, so
 * scrolling through five scenes costs zero React renders.
 *
 *   0.00  identity        left   name, role, lead, actions
 *   0.25  identity, near  left   the name grows toward the viewer; stats appear
 *   0.50  about           right  the car has slid left
 *   0.75  capabilities    left   the car is back on the right
 *   1.00  closing         right  the invitation, with the actions again
 */
const HeroPanels: React.FC<HeroPanelsProps> = ({ ready, onContact }) => {
  const identity = useRef<HTMLDivElement>(null);
  const nameEl = useRef<HTMLHeadingElement>(null);
  const identityLead = useRef<HTMLDivElement>(null);
  const identityStats = useRef<HTMLDivElement>(null);
  const about = useRef<HTMLDivElement>(null);
  const caps = useRef<HTMLDivElement>(null);
  const closing = useRef<HTMLDivElement>(null);

  const stageIndex = useRef<HTMLSpanElement>(null);
  const stageLabel = useRef<HTMLSpanElement>(null);
  const tValue = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastStage = -1;

    const place = (el: HTMLElement | null, p: number, dir: 1 | -1) => {
      if (!el) return;
      el.style.opacity = p.toFixed(3);
      el.style.transform = 'translate3d(' + (dir * (1 - p) * 34).toFixed(1) + 'px,0,0)';
      el.style.visibility = p < 0.01 ? 'hidden' : 'visible';
      const blur = (1 - p) * 8;
      el.style.filter = blur < 0.1 ? 'none' : 'blur(' + blur.toFixed(2) + 'px)';
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const o = heroState.offset;

      // ---- identity: holds through the wheel beat, then leaves ----
      place(identity.current, presence(o, -1, -0.5, 0.33, 0.44), -1);
      if (nameEl.current) {
        // "comes near": scale up as the camera closes on the wheel
        const near = smoothstep(0.04, 0.25, o) * (1 - smoothstep(0.3, 0.42, o));
        const s = 1 + near * 0.34;
        nameEl.current.style.transform = 'translate3d(0,' + (near * -10).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      }
      if (identityLead.current) {
        const k = 1 - smoothstep(0.06, 0.18, o);
        identityLead.current.style.opacity = k.toFixed(3);
        identityLead.current.style.transform = 'translate3d(0,' + ((1 - k) * 18).toFixed(1) + 'px,0)';
        identityLead.current.style.pointerEvents = k > 0.5 ? 'auto' : 'none';
      }
      if (identityStats.current) {
        const k = smoothstep(0.15, 0.27, o) * (1 - smoothstep(0.32, 0.42, o));
        identityStats.current.style.opacity = k.toFixed(3);
        identityStats.current.style.transform = 'translate3d(0,' + ((1 - k) * 18).toFixed(1) + 'px,0)';
      }

      // ---- the other three ----
      place(about.current, presence(o, 0.36, 0.47, 0.56, 0.66), 1);
      place(caps.current, presence(o, 0.62, 0.72, 0.82, 0.9), -1);
      place(closing.current, presence(o, 0.86, 0.95, 2, 3), 1);

      // ---- readout ----
      if (bar.current) bar.current.style.transform = 'scaleY(' + o.toFixed(4) + ')';
      if (tValue.current) tValue.current.textContent = o.toFixed(3);
      if (heroState.stage !== lastStage) {
        lastStage = heroState.stage;
        if (stageIndex.current) stageIndex.current.textContent = '0' + (lastStage + 1);
        if (stageLabel.current) stageLabel.current.textContent = STAGE_LABELS[lastStage];
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* ============ 0 / 1 — identity ============ */}
      <div ref={identity} className={panelClass('left')} style={{ background: backdrop('left') }}>
        <div className="max-w-[560px]">
          <p className={LABEL + ' mb-10 md:mb-14'}>{SITE.hero.eyebrow}</p>

          <h1
            ref={nameEl}
            className="origin-left font-display font-light leading-[0.94] tracking-tight text-bone"
            style={{ fontSize: 'clamp(2.6rem, 6.2vw, 5.8rem)', willChange: 'transform' }}
          >
            <span className="block overflow-hidden">
              <SplitText text="Abdullah" active={ready} delay={300} />
            </span>
            <span className="block overflow-hidden text-bone/55">
              <SplitText text="Shumail" active={ready} delay={460} />
            </span>
          </h1>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/50 md:mt-10">
            AI Engineer &nbsp;/&nbsp; Full-Stack Developer
          </p>

          {/* lead + actions cross-fade with the stats in the same slot */}
          <div className="relative">
          <div ref={identityLead} style={{ willChange: 'opacity, transform' }}>
            <p className={BODY + ' mt-8 max-w-md'}>{SITE.hero.lead}</p>
            <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
              <a href="#work" className={BTN_PRIMARY}>
                View projects
              </a>
              <button type="button" onClick={onContact} className={BTN_GHOST}>
                Get in touch
              </button>
            </div>
          </div>

          <div
            ref={identityStats}
            className="absolute inset-x-0 top-0 grid grid-cols-3 gap-6 pt-10"
            style={{ opacity: 0, willChange: 'opacity, transform' }}
          >
            {SITE.about.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-light tracking-tight text-bone md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-bone/35">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* ============ 2 — about (car has slid left) ============ */}
      <div ref={about} className={panelClass('right')} style={{ background: backdrop('right'), opacity: 0 }}>
        <div className="max-w-[560px]">
          <p className={LABEL + ' mb-10'}>About</p>
          <h2
            className="font-display font-light leading-[1.12] tracking-tight text-bone"
            style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.5rem)' }}
          >
            I sit where the model meets the interface, and I own every layer in between.
          </h2>
          <div className="mt-8 space-y-5">
            {SITE.about.body.map((para, i) => (
              <p key={i} className={BODY}>
                {para}
              </p>
            ))}
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-bone/[0.08] pt-6">
            {[
              { k: 'Currently', v: SITE.about.now },
              { k: 'Based in', v: SITE.location.split('—')[0].trim() },
            ].map((item) => (
              <div key={item.k}>
                <dt className="font-mono text-[9px] uppercase tracking-[0.24em] text-bone/25">{item.k}</dt>
                <dd className="mt-2 font-display text-[15px] font-light tracking-tight text-bone/85">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ============ 3 — capabilities (car back on the right) ============ */}
      <div ref={caps} className={panelClass('left')} style={{ background: backdrop('left'), opacity: 0 }}>
        <div className="max-w-[560px]">
          <p className={LABEL + ' mb-10'}>Capabilities</p>
          <div className="border-t border-bone/[0.08]">
            {SITE.capabilities.map((cap) => (
              <div key={cap.index} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-bone/[0.08] py-5">
                <span className="pt-1 font-mono text-[10px] tracking-[0.2em] text-bone/25">{cap.index}</span>
                <div>
                  <h3 className="font-display text-lg font-light tracking-tight text-bone md:text-xl">{cap.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.65] text-bone/45">{cap.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ 4 — closing (car left again) ============ */}
      <div ref={closing} className={panelClass('right')} style={{ background: backdrop('right'), opacity: 0 }}>
        <div className="max-w-[560px]">
          <p className={LABEL + ' mb-10'}>Next</p>
          <h2
            className="font-display font-light leading-[1.08] tracking-tight text-bone"
            style={{ fontSize: 'clamp(1.9rem, 3.4vw, 3.3rem)' }}
          >
            Let&rsquo;s build something
            <br />
            <span className="text-bone/55">worth shipping.</span>
          </h2>
          <p className={BODY + ' mt-8 max-w-md'}>
            The work below is a sample. If it needs a model, an interface, or both held together
            properly, it is probably my kind of problem.
          </p>
          <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
            <a href="#work" className={BTN_PRIMARY}>
              View projects
            </a>
            <button type="button" onClick={onContact} className={BTN_GHOST}>
              Get in touch
            </button>
          </div>
          <a
            href={'mailto:' + SITE.email}
            className="pointer-events-auto mt-8 inline-block font-display text-base font-light tracking-tight text-bone/55 transition-colors hover:text-bone"
          >
            {SITE.email}
          </a>
        </div>
      </div>

      {/* ============ readout + minimap ============ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-6 pb-24 md:px-12 md:pb-28">
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-px overflow-hidden bg-bone/10">
            <div ref={bar} className="absolute inset-x-0 top-0 h-full origin-top bg-bone/70" style={{ transform: 'scaleY(0)' }} />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/40">
            <div>
              <span ref={stageIndex} className="text-bone/70">01</span>
              <span className="mx-2 text-bone/20">/</span>
              <span>05</span>
              <span className="mx-3 text-bone/20">—</span>
              <span ref={stageLabel}>{STAGE_LABELS[0]}</span>
            </div>
            <div className="mt-2 text-bone/25">
              t = <span ref={tValue} className="tabular-nums text-bone/45">0.000</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <PathMinimap />
        </div>
      </div>
    </>
  );
};

export default HeroPanels;
