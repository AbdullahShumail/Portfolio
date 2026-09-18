import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import { scrollState, smoothstep } from '../../lib/scrollState';

export const CAR_URL = '/car/car.glb';

// Scratch objects, allocated once. Never allocate inside useFrame.
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _centre = new THREE.Vector3();
const _q = new THREE.Quaternion();
const X_AXIS = new THREE.Vector3(1, 0, 0);

interface Wheel {
  /**
   * Sits at the wheel centre. Its rotation.y undoes the steer baked into the
   * model as the car starts to move, so the front wheels point straight down
   * the road. Zero for the rear wheels.
   */
  steer: THREE.Group;
  /** Child of steer. Aligned so its local +X is the wheel's axle. Static. */
  mount: THREE.Group;
  /** Child of mount. Spins on rotation.x only. */
  spinner: THREE.Group;
  radius: number;
  /** The yaw the model ships with, radians. */
  bakedYaw: number;
}

/**
 * Find a mesh's true axle in world space.
 *
 * A tyre is modelled as a fat ring, so in its own geometry frame the thinnest
 * bounding-box axis is the axle. Rotate that axis by the mesh's world
 * orientation and you have the axle as it actually sits in the scene, steer
 * included. This is the fix for the front wheels: they are toed a few degrees
 * in this model, so spinning them about world X made them wobble while the
 * straight rear wheels looked fine.
 */
const worldAxleOf = (mesh: THREE.Mesh, out: THREE.Vector3): THREE.Vector3 => {
  const g = mesh.geometry;
  if (!g.boundingBox) g.computeBoundingBox();
  const bb = g.boundingBox as THREE.Box3;
  const ex = bb.max.x - bb.min.x;
  const ey = bb.max.y - bb.min.y;
  const ez = bb.max.z - bb.min.z;
  if (ex <= ey && ex <= ez) out.set(1, 0, 0);
  else if (ey <= ex && ey <= ez) out.set(0, 1, 0);
  else out.set(0, 0, 1);
  mesh.getWorldQuaternion(_q);
  out.applyQuaternion(_q).normalize();
  // keep every axle pointing +X-ish so all wheels spin the same way
  if (out.x < 0) out.negate();
  return out;
};

/**
 * The Porsche, centred so the wheels sit on y = 0 and the body's box centre is
 * at the origin with the front facing +Z. The parent group moves it down the
 * road; this component only owns the wheels and the body pitch.
 */
const CarModel: React.FC = () => {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(CAR_URL, false, true);
  const wheels = useRef<Wheel[]>([]);
  const lastZ = useRef(0);

  // Wired for the day the model carries clips. drei's actions are lazy
  // getters, so they are resolved in an effect and cached, never in a memo.
  const { actions, names } = useAnimations(animations, group);
  const clips = useRef<Record<string, THREE.AnimationAction | null>>({});
  useEffect(() => {
    const resolved: Record<string, THREE.AnimationAction | null> = {};
    names.forEach((n) => {
      resolved[n] = actions[n] ?? null;
    });
    clips.current = resolved;
  }, [actions, names]);

  /**
   * `precise` is required. The optimised export bakes a large rotation into
   * every node; the default path inflates a rotated box and reported the car
   * as twice its height, floating a unit off the ground.
   */
  const offset = useMemo(() => {
    _box.setFromObject(scene, true);
    _box.getSize(_size);
    _box.getCenter(_centre);
    return new THREE.Vector3(-_centre.x, -_box.min.y, -_centre.z);
  }, [scene]);

  useLayoutEffect(() => {
    scene.updateMatrixWorld(true);

    const parts: { mesh: THREE.Mesh; centre: THREE.Vector3; isTyre: boolean; span: number }[] = [];

    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      let isTyre = false;
      let isRim = false;
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => {
        const mat = m as THREE.MeshPhysicalMaterial;
        if (!mat) return;
        mat.envMapIntensity = 1.15;
        const name = (mat.name || '').toLowerCase();
        if (name.includes('tire')) isTyre = true;
        if (name.includes('rim')) isRim = true;
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

      if (isTyre || isRim) {
        _box.setFromObject(mesh, true);
        _box.getSize(_size);
        parts.push({
          mesh,
          centre: _box.getCenter(new THREE.Vector3()),
          isTyre,
          span: Math.max(_size.x, _size.y, _size.z),
        });
      }
    });

    // One axle per tyre mesh; a tyre split across meshes merges by proximity.
    const axles: { centre: THREE.Vector3; radius: number; axle: THREE.Vector3 }[] = [];
    parts
      .filter((p) => p.isTyre)
      .forEach((p) => {
        const near = axles.find((a) => a.centre.distanceTo(p.centre) < 0.4);
        if (near) {
          near.centre.lerp(p.centre, 0.5);
          near.radius = Math.max(near.radius, p.span / 2);
        } else {
          axles.push({
            centre: p.centre.clone(),
            radius: p.span / 2,
            axle: worldAxleOf(p.mesh, new THREE.Vector3()),
          });
        }
      });
    if (axles.length === 0) return undefined;

    const rig: Wheel[] = axles.map((a) => {
      // steer (at the hub) > mount (axle-aligned) > spinner (rolls)
      const steer = new THREE.Group();
      steer.position.copy(a.centre);
      const mount = new THREE.Group();
      mount.quaternion.setFromUnitVectors(X_AXIS, a.axle);
      const spinner = new THREE.Group();
      mount.add(spinner);
      steer.add(mount);
      scene.attach(steer); // world -> scene-local, transform preserved
      // a yaw of theta about Y carries +X to (cos, 0, -sin); recover theta
      const bakedYaw = Math.atan2(-a.axle.z, a.axle.x);
      return { steer, mount, spinner, radius: a.radius || 0.36, bakedYaw };
    });

    parts.forEach((p) => {
      let best = 0;
      let bestD = Infinity;
      axles.forEach((a, i) => {
        const d = a.centre.distanceTo(p.centre);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (bestD < 0.9) rig[best].spinner.attach(p.mesh);
    });

    wheels.current = rig;

    if (import.meta.env.DEV) {
      (window as unknown as { __wheels?: unknown }).__wheels = rig.map((w, i) => ({
        centre: w.steer.position.toArray().map((n) => +n.toFixed(3)),
        axle: axles[i].axle.toArray().map((n) => +n.toFixed(3)),
        bakedYawDeg: +((w.bakedYaw * 180) / Math.PI).toFixed(1),
        radius: +w.radius.toFixed(3),
        parts: w.spinner.children.length,
      }));
    }

    return () => {
      rig.forEach((w) => {
        [...w.spinner.children].forEach((m) => scene.attach(m));
        scene.remove(w.steer);
      });
      wheels.current = [];
    };
  }, [scene]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const z = scrollState.carZ;
    const instant = (z - lastZ.current) / Math.max(dt, 1e-4);
    lastZ.current = z;
    scrollState.speed = THREE.MathUtils.damp(scrollState.speed, instant, 6, dt);

    // Wheels: distance driven over the true radius. Rolling forward along +Z
    // is a positive turn about the axle. Damped so a flick of the wheel does
    // not snap the spokes. The steer the model ships with is left in while
    // the car is parked and unwound as it pulls away.
    const straight = smoothstep(0.22, 0.3, scrollState.offset);
    const rig = wheels.current;
    for (let i = 0; i < rig.length; i++) {
      easing.dampE(rig[i].spinner.rotation, [z / rig[i].radius, 0, 0], 0.08, dt);
      easing.dampE(rig[i].steer.rotation, [0, -rig[i].bakedYaw * straight, 0], 0.3, dt);
    }

    // Body: squats under acceleration, dips under braking, faint bob at speed.
    const b = body.current;
    if (b) {
      const pitch = THREE.MathUtils.clamp(-scrollState.speed * 0.0016, -0.03, 0.03);
      const bob = Math.sin(z * 2.4) * 0.002 * Math.min(1, Math.abs(scrollState.speed) / 10);
      easing.dampE(b.rotation, [pitch, 0, 0], 0.25, dt);
      easing.damp(b.position, 'y', bob, 0.12, dt);
    }
  });

  return (
    <group ref={group} dispose={null}>
      <group ref={body}>
        <primitive object={scene} position={offset} />
      </group>
    </group>
  );
};

useGLTF.preload(CAR_URL, false, true);

export default CarModel;

