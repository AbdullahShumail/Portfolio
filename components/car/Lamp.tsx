import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SpotLight } from '@react-three/drei';
import { easing } from 'maath';
import { scrollState } from '../../lib/scrollState';

const _want = new THREE.Vector3();

/**
 * A studio lamp that follows the shot.
 *
 * The camera's look-at point already says what the current beat is about: the
 * wheel, the bonnet, the rear deck. This lamp hangs above and slightly toward
 * the lens and swings its beam onto that point, so the featured part of the
 * car is always the brightest thing in frame and the rest falls off into the
 * dark. drei's SpotLight draws the cone itself, which is what makes it read as
 * a lamp rather than as generic lighting.
 */
const Lamp: React.FC<{ quality: 'high' | 'low' }> = ({ quality }) => {
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const aim = useRef(new THREE.Vector3(0, 0.8, 0.2));

  useEffect(() => {
    const l = light.current;
    if (!l) return undefined;
    l.target = target;
    return undefined;
  }, [target]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const l = light.current;
    if (!l) return;

    // Aim at the current look-at. Lag a little behind the camera so the beam
    // visibly arrives on the subject a beat after the lens does.
    _want.set(0, 0.9, scrollState.carZ + 0.4);
    easing.damp3(aim.current, _want, 0.35, dt);
    target.position.copy(aim.current);
    target.updateMatrixWorld();

    // Hang the lamp above the subject, offset toward the camera so the lit
    // side is the side we see.
    const cam = state.camera.position;
    const towardCam = _want.set(cam.x - aim.current.x, 0, cam.z - aim.current.z);
    const len = towardCam.length() || 1;
    towardCam.multiplyScalar(1.6 / len);
    _want.set(aim.current.x + towardCam.x, 6.2, aim.current.z + towardCam.z);
    easing.damp3(l.position, _want, 0.4, dt);
  });

  return (
    <>
      <SpotLight
        ref={light}
        position={[1.5, 6.2, 1.5]}
        color="#ffe9cf"
        intensity={quality === 'high' ? 90 : 60}
        distance={11}
        angle={0.38}
        penumbra={0.55}
        decay={1.6}
        attenuation={5.5}
        anglePower={4.5}
        opacity={quality === 'high' ? 0.28 : 0.18}
        radiusTop={0.12}
        radiusBottom={3.2}
        castShadow={false}
      />
      <primitive object={target} />
    </>
  );
};

export default Lamp;
