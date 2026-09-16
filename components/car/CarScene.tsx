import React, { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Preload, ScrollControls } from '@react-three/drei';
import CarModel from './CarModel';
import CameraRig from './CameraRig';
import Lamp from './Lamp';
import { BEATS } from '../../lib/cameraPath';

/** How many viewport-heights of scroll the hero owns before the page moves on. */
export const HERO_PAGES = 5;

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return mobile;
};

/**
 * Premium studio lighting, restrained for a near-black page.
 *
 * The environment map does the heavy lifting on the paint and chrome. The two
 * directionals add a defined key from high front-right and a cool rim from
 * behind, which is what separates a dark car from a dark ground.
 */
const Studio: React.FC<{ quality: 'high' | 'low' }> = ({ quality }) => (
  <>
    {/* Base fill kept low on purpose: the lamp is what shapes the shot. */}
    <hemisphereLight intensity={0.28} color="#d6dae3" groundColor="#0a0a0c" />
    <directionalLight position={[5, 7, 4]} intensity={1.3} color="#fff4e6" />
    <directionalLight position={[-6, 3, -5]} intensity={0.7} color="#9fb2d8" />

    <Lamp quality={quality} />

    <Environment
      preset="city"
      environmentIntensity={0.7}
      background={false}
      resolution={quality === 'high' ? 256 : 128}
    />

    <ContactShadows
      position={[0, 0.001, 0]}
      opacity={0.8}
      scale={18}
      blur={2.6}
      far={3.2}
      resolution={quality === 'high' ? 1024 : 512}
      color="#000000"
      frames={1}
    />
  </>
);

/**
 * The hero's 3D layer. Fills its parent; the DOM text is overlaid by the
 * section, not rendered here, so the canvas stays a pure render surface.
 *
 * ScrollControls owns scroll while the pointer is over the hero: it creates its
 * own scroll container spanning HERO_PAGES viewport-heights, and hands off to
 * the page once it runs out. `damping` is what makes a flick coast.
 */
const CarScene: React.FC = () => {
  const isMobile = useIsMobile();
  const quality = isMobile ? 'low' : 'high';
  const start = BEATS[0];

  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      shadows={false}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
      }}
      camera={{ fov: start.fov, near: 0.1, far: 80, position: start.position }}
      style={{ background: 'transparent' }}
    >
      <ScrollControls pages={HERO_PAGES} damping={0.22} distance={1}>
        <Suspense fallback={null}>
          <Studio quality={quality} />
          <CarModel />
          {import.meta.env.DEV && new URLSearchParams(window.location.search).has('debug') ? (
            <>
              {/* origin marker: red at (0,0,0), green at the opening look-at */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshBasicMaterial color="#ff2040" />
              </mesh>
              <mesh position={[0, 0.75, 0.2]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshBasicMaterial color="#20ff60" />
              </mesh>
              <axesHelper args={[3]} />
            </>
          ) : null}
          <Preload all />
        </Suspense>
        <CameraRig />
      </ScrollControls>
    </Canvas>
  );
};

export default CarScene;
