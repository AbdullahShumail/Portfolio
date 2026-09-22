import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { daylightAt } from '../../lib/sequence';
import { scrollState } from '../../lib/scrollState';

/**
 * Night breaks into day as the car pulls away through the signals.
 *
 * Three things change together, all driven by daylightAt(offset):
 *
 *   sky    a gradient dome (ground / horizon / zenith) centred on the camera,
 *          so it reads as infinite. Black at night, a cool morning sky by day.
 *   light  the hemisphere fill and the sun come up; the studio lamp is left
 *          to Lamp, which dims itself against the same value.
 *   fog    thins and takes the horizon colour, so the far signals and the
 *          leaving car dissolve into the sky rather than into black.
 *
 * The dome goes through the same tone mapping as everything else, so its
 * horizon and the fog colour land on the same pixel value.
 */

const NIGHT = new THREE.Color('#040405');

// Authored dark on purpose: ACES at exposure 1.2 lifts these a good deal, and
// the copy over the sky is light, so the zenith has to stay deep.
const DAY = {
  zenith: new THREE.Color('#0f2447'),
  horizon: new THREE.Color('#5d7ca6'),
  ground: new THREE.Color('#15181e'),
  sky: new THREE.Color('#a9c4f0'),
  groundLight: new THREE.Color('#3d3a36'),
  sun: new THREE.Color('#fff0d2'),
};

const NIGHT_LIGHT = {
  sky: new THREE.Color('#d6dae3'),
  ground: new THREE.Color('#0a0a0c'),
  sun: new THREE.Color('#fff4e6'),
};

// Day fog is barely thinner than night: it is haze now, the horizon colour,
// and it is what makes the queue of signals recede instead of stacking up.
const FOG_DENSITY = { night: 0.012, day: 0.0105 };

const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDir = normalize(world.xyz - cameraPosition);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    // a soft band of haze either side of the horizon, deep blue overhead,
    // the ground falling away into dark
    vec3 c = h < 0.0
      ? mix(uHorizon, uGround, smoothstep(0.0, 0.32, -h))
      : mix(uHorizon, uZenith, smoothstep(0.02, 0.55, h));
    gl_FragColor = vec4(c, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const _c = new THREE.Color();

const Daylight: React.FC = () => {
  const scene = useThree((s) => s.scene);
  const dome = useRef<THREE.Mesh>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uZenith: { value: NIGHT.clone() },
          uHorizon: { value: NIGHT.clone() },
          uGround: { value: NIGHT.clone() },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
      }),
    [],
  );

  useFrame((state) => {
    const day = daylightAt(scrollState.offset);
    const u = material.uniforms;
    (u.uZenith.value as THREE.Color).copy(NIGHT).lerp(DAY.zenith, day);
    (u.uHorizon.value as THREE.Color).copy(NIGHT).lerp(DAY.horizon, day);
    (u.uGround.value as THREE.Color).copy(NIGHT).lerp(DAY.ground, day);

    // the dome is centred on the camera so its horizon never moves
    if (dome.current) dome.current.position.copy(state.camera.position);

    if (hemi.current) {
      hemi.current.intensity = 0.3 + 1.0 * day;
      hemi.current.color.copy(NIGHT_LIGHT.sky).lerp(DAY.sky, day);
      hemi.current.groundColor.copy(NIGHT_LIGHT.ground).lerp(DAY.groundLight, day);
    }
    if (sun.current) {
      sun.current.intensity = 1.4 + 1.4 * day;
      sun.current.color.copy(NIGHT_LIGHT.sun).lerp(DAY.sun, day);
    }

    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) {
      fog.color.copy(_c.copy(NIGHT).lerp(DAY.horizon, day));
      fog.density = FOG_DENSITY.night + (FOG_DENSITY.day - FOG_DENSITY.night) * day;
    }
    scene.environmentIntensity = 1 + 0.5 * day;
  });

  return (
    <>
      <mesh ref={dome} material={material} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[250, 24, 12]} />
      </mesh>
      <hemisphereLight ref={hemi} intensity={0.3} color="#d6dae3" groundColor="#0a0a0c" />
      <directionalLight ref={sun} position={[5, 7, 4]} intensity={1.4} color="#fff4e6" />
      <fogExp2 attach="fog" args={['#040405', FOG_DENSITY.night]} />
    </>
  );
};

export default Daylight;
