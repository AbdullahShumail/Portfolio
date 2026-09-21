import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { easing } from 'maath';
import CarModel from './CarModel';
import { carZAt } from '../../lib/sequence';
import { scrollState } from '../../lib/scrollState';

const _target = new THREE.Vector3();

/**
 * The car as a thing that moves: a group that drives down +Z with the scroll,
 * carrying the model and its contact shadow. Position is damped toward the
 * authored z for this offset, so a flick of the wheel coasts.
 */
const Car: React.FC<{ quality: 'high' | 'low' }> = ({ quality }) => {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const g = group.current;
    if (!g) return;
    _target.set(0, 0, carZAt(scrollState.offset));
    easing.damp3(g.position, _target, 0.18, dt);
    scrollState.carZ = g.position.z;
  });

  return (
    <group ref={group}>
      <CarModel />
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.8}
        scale={16}
        blur={2.4}
        far={3}
        resolution={512}
        color="#000000"
        // The shadow rides inside this group, so it moves with the car for
        // free. Its shape only changes with body pitch, which is tiny, so a
        // short burst of frames after load is enough instead of every frame.
        frames={40}
      />
    </group>
  );
};

export default Car;
