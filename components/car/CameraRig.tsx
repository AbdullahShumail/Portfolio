import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { easing } from 'maath';
import { RELEASE_AT, camRelAt, carZAt, fovAt, lookRelAt, sectionAt, sideAt } from '../../lib/sequence';
import { scrollState, smoothstep } from '../../lib/scrollState';

// Scratch vectors, allocated once.
const _rel = new THREE.Vector3();
const _look = new THREE.Vector3();
const _want = new THREE.Vector3();
const _wantLook = new THREE.Vector3();
const _car = new THREE.Vector3();

/** How far the car slides as a fraction of viewport width, per unit side. */
const SIDE_SHIFT = 0.19;

/**
 * Director + camera.
 *
 * Runs at priority -1 so it samples the scroll before anything else in the
 * frame reads it. Writes scrollState.offset, installs `seek` for the buttons
 * (they scroll the same container the wheel does, so the 3D stays in sync
 * either way), and drives the camera:
 *
 *   following   position = car + rel(offset), look = car + look(offset)
 *   released    once the exit starts the camera holds its world position
 *               and only its look-at keeps tracking the car as it leaves
 *
 * Everything is damped with maath so a framing is always arrived at, never
 * snapped to.
 */
const CameraRig: React.FC = () => {
  const scroll = useScroll();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  const lookAt = useRef(new THREE.Vector3(0, 0.8, 0.2));
  const fov = useRef(34);
  const side = useRef(1);
  const held = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const el = scroll.el;
    scrollState.el = el;
    scrollState.seek = (offset: number) => {
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: max * Math.min(1, Math.max(0, offset)), behavior: 'smooth' });
    };

    /**
     * The wheel only scrolls drei's container when the pointer is over it.
     * Over anything else on top (the copy, a button, a project card, the
     * dock) the browser finds no scrollable ancestor and nothing happens,
     * which read as "sometimes it does not scroll". Forward those wheels.
     */
    const onWheel = (e: WheelEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || el.contains(t)) return;
      if (t.closest('textarea, select, [data-own-scroll]')) return;
      el.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
    };
    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      scrollState.seek = null;
      scrollState.el = null;
    };
  }, [scroll.el]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const o = scroll.offset;
    scrollState.offset = o;
    scrollState.section = sectionAt(o);

    // Use the authored car position, not the damped one, so the camera and
    // the car answer to the same clock and never chase each other.
    _car.set(0, 0, carZAt(o));

    camRelAt(o, _rel);
    lookRelAt(o, _look);
    _want.copy(_car).add(_rel);
    _wantLook.copy(_car).add(_look);

    // Portrait: pull back along the line of sight so the car still fits.
    const aspect = size.width / size.height;
    const wide = size.width > 900;
    if (aspect < 0.9) {
      const pull = 1.35 + (0.9 - aspect) * 1.2;
      _want.sub(_wantLook).multiplyScalar(pull).add(_wantLook);
    }

    // Release: past RELEASE_AT the camera blends onto the authored framing at
    // the moment of release and stays there, so it is the same fixed vantage
    // whether the reader scrolled here or jumped by button. The look-at is
    // left alone so we watch the car drive away.
    const release = smoothstep(RELEASE_AT, RELEASE_AT + 0.05, o);
    if (release > 0) {
      if (!held.current) {
        held.current = new THREE.Vector3(0, 0, carZAt(RELEASE_AT)).add(camRelAt(RELEASE_AT, _rel));
      }
      _want.lerp(held.current, release);
    }

    easing.damp3(camera.position, _want, 0.28, dt);
    easing.damp3(lookAt.current, _wantLook, 0.24, dt);
    camera.lookAt(lookAt.current);

    // Which half of the screen the car occupies. Hero only; centred after.
    side.current = THREE.MathUtils.damp(side.current, sideAt(o), 3, dt);
    const x = wide ? -side.current * SIDE_SHIFT * size.width : 0;
    const y = wide ? 0 : -size.height * 0.18;
    camera.setViewOffset(size.width, size.height, x, y, size.width, size.height);

    fov.current = THREE.MathUtils.damp(fov.current, fovAt(o), 4, dt);
    camera.fov = fov.current;
    camera.updateProjectionMatrix();

    if (import.meta.env.DEV) {
      (window as unknown as { __hero?: unknown }).__hero = {
        offset: +o.toFixed(3),
        carZ: +scrollState.carZ.toFixed(2),
        speed: +scrollState.speed.toFixed(2),
        section: scrollState.section,
        camera: camera.position.toArray().map((n) => +n.toFixed(2)),
        lookAt: lookAt.current.toArray().map((n) => +n.toFixed(2)),
        released: release > 0,
      };
    }
  }, -1);

  return null;
};

export default CameraRig;
