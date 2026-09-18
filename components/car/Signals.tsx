import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { easing } from 'maath';
import { SITE } from '../../data/site';
import { PROJECT_SIGNALS, SIGNAL_SET, SignalSpec } from '../../lib/sequence';
import { scrollState, smoothstep } from '../../lib/scrollState';

type Lamp = 'red' | 'amber' | 'green';

const LAMP_COLOR: Record<Lamp, string> = {
  red: '#ff3a3a',
  amber: '#ffb020',
  green: '#3cf37a',
};

const OFF = '#15161a';

/** Shared geometry and materials: one of each, reused by every signal. */
const useSignalParts = () =>
  useMemo(() => {
    const pole = new THREE.CylinderGeometry(0.055, 0.07, 3.3, 14);
    const housing = new THREE.BoxGeometry(0.5, 1.32, 0.42);
    const visor = new THREE.BoxGeometry(0.44, 0.06, 0.26);
    const lens = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 24);
    const metal = new THREE.MeshStandardMaterial({ color: '#1a1b1f', metalness: 0.7, roughness: 0.45 });
    const shell = new THREE.MeshStandardMaterial({ color: '#0e0f12', metalness: 0.4, roughness: 0.6 });
    return { pole, housing, visor, lens, metal, shell };
  }, []);

interface SignalProps {
  spec: SignalSpec;
  lit: Lamp | null;
  /** 0..1, 0 is fully off-stage. */
  arrival: number;
  parts: ReturnType<typeof useSignalParts>;
}

/**
 * One traffic signal: pole, housing, three lenses with visors. The lit lamp
 * is emissive and un-tonemapped so it reads as a real light on a black scene.
 */
const Signal: React.FC<SignalProps> = ({ spec, lit, arrival, parts }) => {
  const group = useRef<THREE.Group>(null);
  const lenses = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const g = group.current;
    if (!g) return;
    // slide in from the verge and rise out of the ground
    const x = spec.x + spec.side * (1 - arrival) * 3.5;
    const y = -3.6 * (1 - arrival);
    easing.damp3(g.position, [x, y, spec.z], 0.22, dt);

    (['red', 'amber', 'green'] as Lamp[]).forEach((lamp, i) => {
      const m = lenses.current[i];
      if (!m) return;
      const on = lit === lamp;
      m.color.set(on ? LAMP_COLOR[lamp] : OFF);
      m.emissive.set(on ? LAMP_COLOR[lamp] : '#000000');
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, on ? 2.4 : 0, 6, dt);
    });
  });

  return (
    <group ref={group} position={[spec.x + spec.side * 3.5, -3.6, spec.z]} rotation={[0, spec.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      <mesh geometry={parts.pole} material={parts.metal} position={[0, 1.65, 0]} />
      <mesh geometry={parts.housing} material={parts.shell} position={[0, 3.55, 0]} />
      {[0.42, 0, -0.42].map((dy, i) => (
        <group key={i} position={[0, 3.55 + dy, 0.21]}>
          <mesh geometry={parts.lens} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
            <meshStandardMaterial
              ref={(m) => {
                lenses.current[i] = m;
              }}
              color={OFF}
              emissive="#000000"
              emissiveIntensity={0}
              roughness={0.35}
              toneMapped={false}
            />
          </mesh>
          <mesh geometry={parts.visor} material={parts.shell} position={[0, 0.17, 0.08]} />
        </group>
      ))}
    </group>
  );
};

/**
 * The opening set. All arrive at once as the drive begins, showing red, and
 * each pair flips to green as the car reaches it: the car gets its green light.
 */
export const SignalSet: React.FC = () => {
  const parts = useSignalParts();
  const [state, setState] = React.useState(() => SIGNAL_SET.map(() => ({ arrival: 0, lit: 'red' as Lamp })));
  const last = useRef('');

  useFrame(() => {
    const o = scrollState.offset;
    const z = scrollState.carZ;
    const arrival = smoothstep(0.22, 0.3, o);
    const next = SIGNAL_SET.map((s) => ({
      arrival,
      lit: (z > s.z - 7 ? 'green' : 'red') as Lamp,
    }));
    const key = next.map((n) => n.arrival.toFixed(2) + n.lit).join('|');
    if (key !== last.current) {
      last.current = key;
      setState(next);
    }
  });

  return (
    <>
      {SIGNAL_SET.map((spec, i) => (
        <Signal key={i} spec={spec} parts={parts} arrival={state[i].arrival} lit={state[i].lit} />
      ))}
    </>
  );
};

/**
 * One signal per project. Each comes in as the car approaches its offset,
 * turns green as the car draws level, and carries the project card beside
 * its housing. The card is DOM, positioned by drei's Html at a 3D point.
 */
export const ProjectSignals: React.FC<{ portal: React.MutableRefObject<HTMLElement> }> = ({ portal }) => {
  const parts = useSignalParts();
  const [state, setState] = React.useState(() => PROJECT_SIGNALS.map(() => ({ arrival: 0, lit: 'amber' as Lamp, card: 0 })));
  const last = useRef('');

  useFrame(() => {
    const o = scrollState.offset;
    const next = PROJECT_SIGNALS.map((s) => {
      const arrival = smoothstep(s.t - 0.09, s.t - 0.03, o) * (1 - smoothstep(s.t + 0.1, s.t + 0.16, o));
      const level = smoothstep(s.t - 0.03, s.t + 0.01, o);
      const card = smoothstep(s.t - 0.05, s.t - 0.01, o) * (1 - smoothstep(s.t + 0.08, s.t + 0.13, o));
      return { arrival, lit: (level > 0.5 ? 'green' : 'amber') as Lamp, card };
    });
    const key = next.map((n) => n.arrival.toFixed(2) + n.card.toFixed(2) + n.lit).join('|');
    if (key !== last.current) {
      last.current = key;
      setState(next);
    }
  });

  return (
    <>
      {PROJECT_SIGNALS.map((spec, i) => {
        const p = SITE.projects[spec.index];
        const st = state[i];
        const live = Boolean(p.href) && p.href !== '#';
        return (
          <React.Fragment key={p.title}>
            <Signal spec={spec} parts={parts} arrival={st.arrival} lit={st.lit} />
            {/*
              Looking down +Z, world +X is screen-LEFT. A signal on the +X
              verge therefore sits on the left of the frame and its card must
              extend further left, away from the road, with its right edge at
              the anchor; the -X verge is mirrored.
            */}
            <Html
              portal={portal}
              position={[spec.x + spec.side * 0.5, 3.1, spec.z]}
              center={false}
              distanceFactor={7.5}
              zIndexRange={[40, 0]}
              style={{
                pointerEvents: 'none',
                opacity: st.card,
                transform: 'translate3d(' + (spec.side > 0 ? '-100%' : '0') + ',-50%,0) translateY(' + ((1 - st.card) * 18).toFixed(1) + 'px)',
                transition: 'opacity 260ms ease-out',
                width: 300,
              }}
            >
              <div
                className={
                  'rounded-2xl border border-bone/10 bg-obsidian/80 p-6 backdrop-blur-md ' +
                  (spec.side > 0 ? 'text-left' : 'text-left')
                }
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/35">
                  {p.index} &nbsp;·&nbsp; {p.year}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-bone">{p.title}</h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/45">
                  {p.role}
                </p>
                <p className="mt-3 text-[13.5px] leading-[1.6] text-bone/60">{p.description}</p>
                <p className="mt-4 text-[12px] font-medium text-bone/40">{p.tags.join(' / ')}</p>
                {live ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block rounded-full bg-bone px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian transition-opacity hover:opacity-85"
                    style={{ pointerEvents: st.card > 0.6 ? 'auto' : 'none' }}
                  >
                    Visit
                  </a>
                ) : null}
              </div>
            </Html>
          </React.Fragment>
        );
      })}
    </>
  );
};
