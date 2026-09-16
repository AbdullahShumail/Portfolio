import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { easing } from 'maath';
import {
  beatsTopDown,
  carSideAt,
  fovAt,
  pathTopDown,
  positionCurve,
  progressToU,
  stageAt,
  targetCurve,
} from '../../lib/cameraPath';
import { heroState } from '../../lib/heroState';

// Scratch vectors, allocated once. Allocating inside useFrame hands the GC a
// stutter at 60fps.
const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();

/** How far the car slides as a fraction of the viewport width, per unit carSide. */
const SIDE_SHIFT = 0.19;

/**
 * Drives the camera from scroll.
 *
 * Every frame: read the damped ScrollControls offset, map it onto the two
 * Catmull-Rom curves, and damp the camera toward the sampled position and
 * look-at target. Two layers of smoothing on purpose. ScrollControls damps
 * the offset so a flick keeps coasting; maath damps the camera so it always
 * arrives at a framing and never snaps to one.
 *
 * The car's screen side is a camera view offset, damped separately. The
 * authored beats never move; the window onto them slides left and right so
 * the copy can take whichever half the car has vacated.
 */
const CameraRig: React.FC = () => {
  const scroll = useScroll();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  // The look-at point is damped separately from the position, otherwise the
  // lens whips when the target jumps from the tyre to the bonnet.
  const lookAt = useRef(new THREE.Vector3(0, 0.8, 0.2));
  const fov = useRef(34);
  const side = useRef(1);

  // Publish the route once for the overlay's minimap, and install seek so the
  // dock can jump the hero to a beat.
  useEffect(() => {
    heroState.pathXZ = pathTopDown();
    heroState.beatXZ = beatsTopDown();
    const el = scroll.el;
    heroState.seek = (offset: number) => {
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: max * Math.min(1, Math.max(0, offset)), behavior: 'smooth' });
    };
    return () => {
      heroState.seek = null;
    };
  }, [scroll.el]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const offset = scroll.offset;

    const u = progressToU(offset);
    positionCurve.getPoint(u, _pos);
    targetCurve.getPoint(u, _tgt);

    // Portrait screens lose horizontal field of view, so the same beat that
    // frames the car on a laptop crops it on a phone. Pull the camera back
    // along its own line of sight; the composition survives, only the scale
    // changes.
    const aspect = size.width / size.height;
    const wide = size.width > 900;
    if (aspect < 0.9) {
      const pull = 1.35 + (0.9 - aspect) * 1.2;
      _pos.sub(_tgt).multiplyScalar(pull).add(_tgt);
    }

    easing.damp3(camera.position, _pos, 0.22, dt);
    easing.damp3(lookAt.current, _tgt, 0.22, dt);
    camera.lookAt(lookAt.current);

    // ---- which half of the screen the car sits on --------------------------
    side.current = THREE.MathUtils.damp(side.current, carSideAt(offset), 3.2, dt);
    const x = wide ? -side.current * SIDE_SHIFT * size.width : 0;
    const y = wide ? 0 : -size.height * 0.2;
    camera.setViewOffset(size.width, size.height, x, y, size.width, size.height);

    const wantFov = fovAt(offset);
    fov.current = THREE.MathUtils.damp(fov.current, wantFov, 4, dt);
    camera.fov = fov.current;
    camera.updateProjectionMatrix();

    heroState.offset = offset;
    heroState.stage = stageAt(offset);
    heroState.camX = camera.position.x;
    heroState.camZ = camera.position.z;
    heroState.tgtX = lookAt.current.x;
    heroState.tgtZ = lookAt.current.z;

    if (import.meta.env.DEV) {
      // Dev-only probe for the screenshot harness. Stripped from production.
      (window as unknown as { __hero?: unknown }).__hero = {
        offset,
        u,
        side: +side.current.toFixed(3),
        camera: camera.position.toArray().map((n) => +n.toFixed(3)),
        lookAt: lookAt.current.toArray().map((n) => +n.toFixed(3)),
        wantPos: _pos.toArray().map((n) => +n.toFixed(3)),
        wantTgt: _tgt.toArray().map((n) => +n.toFixed(3)),
        fov: +camera.fov.toFixed(2),
      };
    }
  });

  return null;
};

export default CameraRig;
