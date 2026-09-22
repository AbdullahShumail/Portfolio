import React, { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, ScrollControls } from '@react-three/drei';
import Car from './Car';
import CameraRig from './CameraRig';
import Lamp from './Lamp';
import { ProjectSignals, SignalSet } from './Signals';
import Warmup from './Warmup';
import Daylight from './Daylight';
import { LOW_POWER, PHONE, useMedia } from '../../lib/useMedia';
import { PAGES } from '../../lib/sequence';

/**
 * Studio lighting on a black void. No ground: the car floats on its own
 * contact shadow. The environment map does the work on paint and chrome; a
 * cool rim separates a dark car from a dark ground. The sky, the sun, the
 * hemisphere fill and the fog live in Daylight, which fades them from night
 * to day as the car drives.
 */
const Studio: React.FC<{ quality: 'high' | 'low' }> = ({ quality }) => (
  <>
    <Daylight />
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
  </>
);

/**
 * The whole page is this canvas. ScrollControls owns the scroll; every 3D
 * element and the DOM overlay read the same offset, so the wheel and the
 * nav buttons drive identical animation.
 */
const CarScene: React.FC = () => {
  const lowPower = useMedia(LOW_POWER);
  const phone = useMedia(PHONE);
  const quality = lowPower ? 'low' : 'high';

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
      dpr={lowPower ? [1, 1.5] : [1, 2]}
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
          <ProjectSignals portal={cardLayer} cards={!phone} />
          <Warmup />
        </Suspense>
        <CameraRig />
      </ScrollControls>
    </Canvas>
    <div ref={cardLayer} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
    </>
  );
};

export default CarScene;
