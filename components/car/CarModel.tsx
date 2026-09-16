import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useAnimations, useGLTF } from '@react-three/drei';

export const CAR_URL = '/car/car.glb';

// Scratch objects, allocated once. Allocating in effects per mount is fine;
// what must never happen is allocating inside useFrame.
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _centre = new THREE.Vector3();

/**
 * The Porsche. Loaded once, centred so the wheels sit on y = 0 and the body's
 * bounding-box centre is at the origin, with the front facing +Z. Every camera
 * beat in lib/cameraPath.ts is authored against that frame, so the centring
 * here is load-bearing: move the car and every shot moves with it.
 *
 * The file is a meshopt-compressed .glb with WebP textures (3 MB, down from
 * 74 MB). drei's useGLTF wires the meshopt decoder automatically; Draco is
 * switched off because the file does not use it and the decoder is a CDN
 * fetch we would rather not make.
 */
const CarModel: React.FC = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(CAR_URL, false, true);

  /**
   * useAnimations is wired for the day the model carries clips (spinning
   * wheels, opening doors). This export has none, so `actions` is empty.
   *
   * drei's actions are lazy getters that return undefined until the ref
   * attaches, on an object memoised by `clips`. Resolving them in a useMemo
   * therefore reads undefined once and never re-runs. Resolve in an effect
   * and cache in a ref, then trigger from `clips.current`.
   */
  const { actions, names } = useAnimations(animations, group);
  const clips = useRef<Record<string, THREE.AnimationAction | null>>({});

  useEffect(() => {
    const resolved: Record<string, THREE.AnimationAction | null> = {};
    names.forEach((n) => {
      resolved[n] = actions[n] ?? null;
    });
    clips.current = resolved;
    // Example, when a clip exists:  clips.current.WheelSpin?.reset().fadeIn(0.4).play();
  }, [actions, names]);

  /**
   * Centre the pristine scene. Measured rather than hard-coded, so a
   * re-export at different units is not a tuning session.
   *
   * `precise` matters here. The optimised export flattens the hierarchy and
   * bakes a large rotation into every node; without `precise`, Box3 transforms
   * the corners of each mesh's local box rather than its vertices, and the
   * axis-aligned box of a rotated box is inflated. It reported the car as
   * 3.9 units tall instead of 1.9, and floated it a full unit off the ground.
   * Walking the vertices costs a few ms once, on load.
   */
  const offset = useMemo(() => {
    _box.setFromObject(scene, true);
    _box.getSize(_size);
    _box.getCenter(_centre);
    const o = new THREE.Vector3(-_centre.x, -_box.min.y, -_centre.z);
    if (import.meta.env.DEV) {
      (window as unknown as { __car?: unknown }).__car = {
        scene,
        measured: { min: _box.min.toArray(), max: _box.max.toArray(), size: _size.toArray() },
        offset: o.toArray(),
      };
    }
    return o;
  }, [scene]);

  /**
   * Material pass. The export already carries clearcoat on the paint, so the
   * job here is restraint: make sure everything picks up the environment,
   * lift the glass into real transmission, and keep shadows honest.
   */
  useLayoutEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshPhysicalMaterial;
        if (!mat) return;
        mat.envMapIntensity = 1.15;

        const name = (mat.name || '').toLowerCase();
        if (name === 'glass' || name.includes('lights_refraction')) {
          mat.transparent = true;
          mat.transmission = Math.max(mat.transmission ?? 0, 0.85);
          mat.roughness = Math.min(mat.roughness, 0.08);
          mat.ior = 1.5;
          mat.thickness = 0.02;
        }
        if (name === 'paint' || name === 'coat') {
          mat.clearcoat = Math.max(mat.clearcoat ?? 0, 0.9);
          mat.clearcoatRoughness = Math.min(mat.clearcoatRoughness ?? 1, 0.06);
        }
        if (name.includes('chromes')) {
          mat.metalness = 1;
          mat.roughness = Math.min(mat.roughness, 0.12);
        }
        mat.needsUpdate = true;
      });
    });
  }, [scene]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} position={offset} />
    </group>
  );
};

useGLTF.preload(CAR_URL, false, true);

export default CarModel;
