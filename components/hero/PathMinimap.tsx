import React, { useEffect, useRef } from 'react';
import { heroState } from '../../lib/heroState';

const SIZE = 150;
const PAD = 14;

/** Car footprint in the same world units as the path: width x, length z. */
const CAR_W = 3.12;
const CAR_L = 6.23;

/**
 * A top-down plot of the camera's route around the car.
 *
 * The route is a parametric curve p(u); this draws it once and then moves a
 * point along it at the live parameter, with a line to the current look-at.
 * It is the one piece of UI here that shows the maths rather than hiding it,
 * and it doubles as a progress indicator you can actually read.
 */
const PathMinimap: React.FC = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const ticksRef = useRef<SVGGElement>(null);
  const camRef = useRef<SVGCircleElement>(null);
  const tgtRef = useRef<SVGCircleElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const carRef = useRef<SVGRectElement>(null);
  const built = useRef(false);
  const map = useRef<{ sx: number; sz: number; ox: number; oz: number } | null>(null);

  useEffect(() => {
    let raf = 0;

    const build = () => {
      const pts = heroState.pathXZ;
      if (!pts.length) return false;

      // Fit path + car footprint into the box, preserving aspect. SVG y is -z
      // so the front of the car (+z) points up.
      let minX = -CAR_W / 2;
      let maxX = CAR_W / 2;
      let minZ = -CAR_L / 2;
      let maxZ = CAR_L / 2;
      pts.forEach(([x, z]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      });
      const span = Math.max(maxX - minX, maxZ - minZ);
      const s = (SIZE - PAD * 2) / span;
      const cx = (minX + maxX) / 2;
      const cz = (minZ + maxZ) / 2;
      map.current = { sx: s, sz: s, ox: cx, oz: cz };

      const X = (x: number) => SIZE / 2 + (x - cx) * s;
      const Y = (z: number) => SIZE / 2 - (z - cz) * s;

      if (pathRef.current) {
        pathRef.current.setAttribute(
          'd',
          pts.map(([x, z], i) => (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(z).toFixed(1)).join(' ')
        );
      }
      if (carRef.current) {
        carRef.current.setAttribute('x', X(-CAR_W / 2).toFixed(1));
        carRef.current.setAttribute('y', Y(CAR_L / 2).toFixed(1));
        carRef.current.setAttribute('width', (CAR_W * s).toFixed(1));
        carRef.current.setAttribute('height', (CAR_L * s).toFixed(1));
      }
      if (ticksRef.current) {
        ticksRef.current.innerHTML = heroState.beatXZ
          .map(
            ([x, z]) =>
              '<circle cx="' + X(x).toFixed(1) + '" cy="' + Y(z).toFixed(1) + '" r="1.6" />'
          )
          .join('');
      }
      return true;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!built.current) {
        built.current = build();
        if (!built.current) return;
      }
      const m = map.current;
      if (!m) return;
      const X = (x: number) => SIZE / 2 + (x - m.ox) * m.sx;
      const Y = (z: number) => SIZE / 2 - (z - m.oz) * m.sz;

      const cx = X(heroState.camX);
      const cy = Y(heroState.camZ);
      const tx = X(heroState.tgtX);
      const ty = Y(heroState.tgtZ);

      if (camRef.current) {
        camRef.current.setAttribute('cx', cx.toFixed(1));
        camRef.current.setAttribute('cy', cy.toFixed(1));
      }
      if (tgtRef.current) {
        tgtRef.current.setAttribute('cx', tx.toFixed(1));
        tgtRef.current.setAttribute('cy', ty.toFixed(1));
      }
      if (lineRef.current) {
        lineRef.current.setAttribute('x1', cx.toFixed(1));
        lineRef.current.setAttribute('y1', cy.toFixed(1));
        lineRef.current.setAttribute('x2', tx.toFixed(1));
        lineRef.current.setAttribute('y2', ty.toFixed(1));
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={'0 0 ' + SIZE + ' ' + SIZE}
      aria-label="Camera path, top-down"
      className="block"
    >
      <rect ref={carRef} rx="3" className="fill-bone/[0.06] stroke-bone/20" strokeWidth="0.8" />
      <path ref={pathRef} className="fill-none stroke-bone/25" strokeWidth="0.9" strokeDasharray="2 2" />
      <g ref={ticksRef} className="fill-bone/40" />
      <line ref={lineRef} className="stroke-bone/35" strokeWidth="0.8" />
      <circle ref={tgtRef} r="2" className="fill-bone/70" />
      <circle ref={camRef} r="3.2" className="fill-bone" />
    </svg>
  );
};

export default PathMinimap;
