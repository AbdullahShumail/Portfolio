import React, { useEffect, useRef } from 'react';

type Tone = 'ember' | 'plasma' | 'mixed';

interface NeuralFieldProps {
  /** data-target-id of the element the field should currently wrap around. */
  activeTarget: string | null;
  /** Colour bias of the field, driven by the section in view. */
  tone?: Tone;
}

// Deliberately near-monochrome. The field should read as a quiet starfield,
// not as coloured confetti, so the only variation is a cool grey minority.
const DUST: [number, number, number] = [226, 224, 218];
const DUST_COOL: [number, number, number] = [150, 158, 178];
const NODE: [number, number, number] = [214, 212, 206];
const NODE_COOL: [number, number, number] = [136, 146, 168];

/** Soft radial sprite. Cheaper and prettier than per-particle shadowBlur. */
const makeSprite = (rgb: [number, number, number], size = 24) => {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  const [rr, gg, bb] = rgb;
  grad.addColorStop(0, 'rgba(' + rr + ',' + gg + ',' + bb + ',1)');
  grad.addColorStop(0.35, 'rgba(' + rr + ',' + gg + ',' + bb + ',0.55)');
  grad.addColorStop(1, 'rgba(' + rr + ',' + gg + ',' + bb + ',0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
};

class Dust {
  ox = 0;
  oy = 0;
  x = 0;
  y = 0;
  r = 1;
  depth = 1;
  seed = 0;
  ease = 0.06;
  alpha = 0;
  baseAlpha = 0.18;
  sprite = 0;
  wanderR = 0;
  wanderS = 0;

  constructor(w: number, h: number) {
    this.ox = Math.random() * w;
    this.oy = Math.random() * h;
    this.x = this.ox;
    this.y = this.oy;
    this.depth = 0.35 + Math.random() * 0.65;
    this.r = (0.6 + Math.random() * 1.5) * this.depth;
    this.seed = Math.random() * 10000;
    this.ease = 0.045 + Math.random() * 0.05;
    this.baseAlpha = (0.05 + Math.random() * 0.15) * this.depth;
    this.alpha = this.baseAlpha;
    this.sprite = Math.random() < 0.82 ? 0 : 2;
    this.wanderR = 8 + Math.random() * 26;
    this.wanderS = 0.00008 + Math.random() * 0.00022;
  }
}

class Node {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  r = 1;
  sprite = 0;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    const sp = 0.09 + Math.random() * 0.16;
    const a = Math.random() * Math.PI * 2;
    this.vx = Math.cos(a) * sp;
    this.vy = Math.sin(a) * sp;
    this.r = 1.1 + Math.random() * 1.6;
    this.sprite = Math.random() < 0.8 ? 1 : 3;
  }
}

const NeuralField: React.FC<NeuralFieldProps> = ({ activeTarget, tone = 'mixed' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetIdRef = useRef<string | null>(activeTarget);
  const toneRef = useRef<Tone>(tone);

  targetIdRef.current = activeTarget;
  toneRef.current = tone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sprites = [makeSprite(DUST), makeSprite(NODE), makeSprite(DUST_COOL), makeSprite(NODE_COOL)];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let dust: Dust[] = [];
    let nodes: Node[] = [];
    let raf = 0;
    let running = true;

    const mouse = { x: -9999, y: -9999, active: false };
    // Smoothed pointer, so the field trails the cursor instead of snapping to it.
    const smooth = { x: -9999, y: -9999 };

    // Blend factor between ambient drift and being wrapped around the target.
    let morph = 0;
    let toneMix = 0.5; // 0 = ember, 1 = plasma
    let cachedRect: DOMRect | null = null;
    let cachedShape = 'frame';

    const sizeFor = (area: number) => {
      if (reduced) return { d: 200, n: 26 };
      if (area < 500000) return { d: 460, n: 38 };
      if (area < 1200000) return { d: 740, n: 54 };
      return { d: 1080, n: 68 };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const counts = sizeFor(w * h);
      dust = Array.from({ length: counts.d }, () => new Dust(w, h));
      nodes = Array.from({ length: counts.n }, () => new Node(w, h));
    };

    /** Where a dust mote should sit when wrapped around the active element. */
    const shapePoint = (p: Dust, rect: DOMRect, shape: string, t: number) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      if (shape === 'rail') {
        const spread = (p.seed * 7.13) % 1;
        return {
          x: rect.left - 16 - ((p.seed * 3.7) % 10),
          y: rect.top + spread * rect.height,
        };
      }

      if (shape === 'ring') {
        const rad = Math.max(rect.width, rect.height) / 2 + 18 + ((p.seed * 2.1) % 14);
        const a = (p.seed * 0.017 + t * 0.00016) % (Math.PI * 2);
        return { x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad };
      }

      if (shape === 'orbit') {
        const a = (p.seed * 0.021 + t * 0.00022) % (Math.PI * 2);
        const rx = rect.width / 2 + 34 + ((p.seed * 5.3) % 26);
        const ry = rect.height / 2 + 16 + ((p.seed * 3.1) % 18);
        const tilt = (Math.floor(p.seed) % 2 === 0 ? 1 : -1) * 0.32;
        const px = Math.cos(a) * rx;
        const py = Math.sin(a) * ry;
        return {
          x: cx + px * Math.cos(tilt) - py * Math.sin(tilt),
          y: cy + px * Math.sin(tilt) + py * Math.cos(tilt),
        };
      }

      if (shape === 'grid') {
        const cols = Math.max(2, Math.round(rect.width / 26));
        const rows = Math.max(2, Math.round(rect.height / 26));
        const i = Math.floor(p.seed * 13) % (cols * rows);
        return {
          x: rect.left + ((i % cols) + 0.5) * (rect.width / cols),
          y: rect.top + (Math.floor(i / cols) + 0.5) * (rect.height / rows),
        };
      }

      // frame: walk the perimeter
      const pad = 12;
      const rw = rect.width + pad * 2;
      const rh = rect.height + pad * 2;
      const per = 2 * (rw + rh);
      const pos = (p.seed * 0.97) % per;
      const l = rect.left - pad;
      const tp = rect.top - pad;
      if (pos < rw) return { x: l + pos, y: tp };
      if (pos < rw + rh) return { x: l + rw, y: tp + (pos - rw) };
      if (pos < rw * 2 + rh) return { x: l + rw - (pos - rw - rh), y: tp + rh };
      return { x: l, y: tp + rh - (pos - rw * 2 - rh) };
    };

    const readTarget = () => {
      const id = targetIdRef.current;
      if (!id) {
        cachedRect = null;
        return;
      }
      const el = document.querySelector<HTMLElement>('[data-target-id="' + id + '"]');
      if (!el) {
        cachedRect = null;
        return;
      }
      cachedRect = el.getBoundingClientRect();
      cachedShape = el.dataset.shape || 'frame';
    };

    const frame = (time: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);

      readTarget();

      const wantMorph = cachedRect ? 1 : 0;
      morph += (wantMorph - morph) * 0.07;

      const wantTone = toneRef.current === 'ember' ? 0 : toneRef.current === 'plasma' ? 1 : 0.5;
      toneMix += (wantTone - toneMix) * 0.03;

      smooth.x += (mouse.x - smooth.x) * 0.12;
      smooth.y += (mouse.y - smooth.y) * 0.12;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      // ---- neural web -------------------------------------------------
      const linkDist = w < 700 ? 118 : 152;
      const linkDistSq = linkDist * linkDist;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;

        if (mouse.active) {
          const dx = smooth.x - n.x;
          const dy = smooth.y - n.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < 57600 && dsq > 1) {
            const d = Math.sqrt(dsq);
            const f = (1 - d / 240) * 0.05;
            n.x += (dx / d) * f * 6;
            n.y += (dy / d) * f * 6;
          }
        }
      }

      const linkRGB =
        Math.round(168 - toneMix * 26) +
        ',' +
        Math.round(172 - toneMix * 18) +
        ',' +
        Math.round(180 + toneMix * 12);

      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dsq = dx * dx + dy * dy;
          if (dsq > linkDistSq) continue;
          const strength = 1 - dsq / linkDistSq;
          const alpha = strength * strength * 0.085;
          if (alpha < 0.004) continue;
          ctx.strokeStyle = 'rgba(' + linkRGB + ',' + alpha + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        // a thread from the cursor to whatever drifts near it
        if (mouse.active) {
          const dx = a.x - smooth.x;
          const dy = a.y - smooth.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < 40000) {
            const alpha = (1 - dsq / 40000) * 0.14;
            ctx.strokeStyle = 'rgba(196,199,206,' + alpha + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(smooth.x, smooth.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const d = n.r * 7;
        ctx.globalAlpha = 0.32;
        ctx.drawImage(sprites[n.sprite], n.x - d / 2, n.y - d / 2, d, d);
      }

      // ---- dust -------------------------------------------------------
      for (let i = 0; i < dust.length; i++) {
        const p = dust[i];

        const wa = time * p.wanderS + p.seed;
        let tx = p.ox + Math.cos(wa) * p.wanderR;
        let ty = p.oy + Math.sin(wa * 1.31) * p.wanderR * 0.7;
        let ta = p.baseAlpha;

        if (cachedRect && morph > 0.01) {
          const pad = 190;
          const near =
            p.ox > cachedRect.left - pad &&
            p.ox < cachedRect.right + pad &&
            p.oy > cachedRect.top - pad &&
            p.oy < cachedRect.bottom + pad;

          if (near) {
            const s = shapePoint(p, cachedRect, cachedShape, time);
            tx += (s.x - tx) * morph;
            ty += (s.y - ty) * morph;
            ta = p.baseAlpha + (0.78 - p.baseAlpha) * morph;
          }
        }

        p.x += (tx - p.x) * p.ease;
        p.y += (ty - p.y) * p.ease;
        p.alpha += (ta - p.alpha) * 0.07;

        // cursor pushes dust out of the way
        if (mouse.active) {
          const dx = p.x - smooth.x;
          const dy = p.y - smooth.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < 8100 && dsq > 0.5) {
            const d = Math.sqrt(dsq);
            const f = (1 - d / 90) * (1 - d / 90);
            p.x += (dx / d) * f * 22;
            p.y += (dy / d) * f * 22;
          }
        }

        if (p.alpha < 0.01) continue;
        const size = p.r * 7;
        ctx.globalAlpha = Math.min(1, p.alpha);
        ctx.drawImage(sprites[p.sprite], p.x - size / 2, p.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const onMove = (e: PointerEvent) => {
      if (smooth.x < -1000) {
        smooth.x = e.clientX;
        smooth.y = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    raf = requestAnimationFrame(frame);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
  );
};

export default NeuralField;
