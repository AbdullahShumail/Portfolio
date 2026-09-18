import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, Preload, ScrollControls } from '@react-three/drei';
import Car from './Car';
import CameraRig from './CameraRig';
import Lamp from './Lamp';
import { ProjectSignals, SignalSet } from './Signals';

/** Viewport-heights of scroll the whole experience spans. */
export const PAGES = 11;

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
 * Studio lighting on a black void. No ground: the car floats on its own
 * contact shadow. The environment map does the work on paint and chrome; a
 * warm key and a cool rim separate a dark car from a dark ground; fog lets
 * the car dissolve into the distance when it drives off at the end.
 */
const Studio: React.FC<{ quality: 'high' | 'low' }> = ({ quality }) => (
  <>
    <hemisphereLight intensity={0.3} color="#d6dae3" groundColor="#0a0a0c" />
    <directionalLight position={[5, 7, 4]} intensity={1.4} color="#fff4e6" />
    <directionalLight position={[-6, 3, -5]} intensity={0.7} color="#9fb2d8" />
    <Lamp quality={quality} />

    {/*
      The environment map is rendered from these softboxes on the GPU in one
      frame. The `city` preset it replaces fetched a 1.5 MB HDR from a
      third-party CDN and suspended the whole scene until it arrived, which
      is why the car took so long to appear.
    */}
    <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
      <Lightformer form="rect" intensity={3.2} position={[0, 6.5, 0]} scale={[16, 7, 1]} rotation-x={Math.PI / 2} color="#fff4e4" />
      <Lightformer form="rect" intensity={1.5} position={[-9, 2.5, 0]} scale={[7, 11, 1]} rotation-y={Math.PI / 2} color="#dde5f4" />
      <Lightformer form="rect" intensity={1.5} position={[9, 2.5, 0]} scale={[7, 11, 1]} rotation-y={-Math.PI / 2} color="#fff0dc" />
      <Lightformer form="ring" intensity={2.2} position={[0, 3.5, -12]} scale={4.5} color="#ffffff" />
      <Lightformer form="rect" intensity={0.9} position={[0, 3, 12]} scale={[10, 4, 1]} rotation-y={Math.PI} color="#eef1f8" />
    </Environment>
    <fogExp2 attach="fog" args={['#040405', 0.012]} />
  </>
);

/**
 * The whole page is this canvas. ScrollControls owns the scroll; every 3D
 * element and the DOM overlay read the same offset, so the wheel and the
 * nav buttons drive identical animation.
 */
const CarScene: React.FC = () => {
  const isMobile = useIsMobile();
  const quality = isMobile ? 'low' : 'high';

  /**
   * drei's Html portals into the nearest ScrollControls container by
   * default, which scrolls, so the cards drifted thousands of pixels off
   * screen. This layer sits beside the canvas, never scrolls, and is where
   * every project card is mounted.
   */
  const cardLayer = useRef<HTMLDivElement>(null!);

  return (
    <>
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      shadows={false}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      camera={{ fov: 34, near: 0.1, far: 400, position: [6.1, 2.0, 5.9] }}
      style={{ background: 'transparent' }}
    >
      <ScrollControls pages={PAGES} damping={0.2} distance={1}>
        <Suspense fallback={null}>
          <Studio quality={quality} />
          <Car quality={quality} />
          <SignalSet />
          <ProjectSignals portal={cardLayer} />
          <Preload all />
        </Suspense>
        <CameraRig />
      </ScrollControls>
    </Canvas>
    <div ref={cardLayer} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
    </>
  );
};

export default CarScene;
