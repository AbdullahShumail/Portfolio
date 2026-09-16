import * as THREE from 'three';

/**
 * The camera's route around the car, authored against the model AFTER it has
 * been centred: wheels on y = 0, bounding-box centre at the origin, front of
 * the car facing +Z. In those units the body spans roughly x ±1.56, y 0..1.9,
 * z ±3.1, and the front-right tyre sits near (0.86, 0.48, 1.39).
 *
 * Each beat pins a scroll offset `t` to a camera position, a look-at target
 * and a field of view. Between beats both curves are Catmull-Rom, so the lens
 * swings rather than cutting corners, and `progressToU` guarantees the camera
 * is exactly at a beat when the reader is at that point in the scroll.
 */
export interface Beat {
  t: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  label: string;
  /**
   * Which side of the screen the car sits on: +1 right, -1 left, 0 centre.
   * Implemented as a camera view offset, so the authored framing is untouched
   * and only the window onto it slides.
   */
  carSide: number;
}

export const BEATS: Beat[] = [
  // 0%   wide three-quarter from the front right. Car right, identity left.
  { t: 0.0, position: [6.1, 2.0, 5.9], target: [0, 0.8, 0.2], fov: 34, label: 'Overview', carSide: 1 },
  // 25%  swoop in on the front-right wheel, from slightly above so the Fuchs
  //      rim and the fender read. The name grows toward the viewer here.
  { t: 0.25, position: [3.8, 1.05, 3.6], target: [0.55, 0.42, 1.39], fov: 28, label: 'Front wheel', carSide: 0.7 },
  // 50%  up and over the nose, looking down the bonnet. Car slides LEFT and
  //      the about copy takes the right.
  { t: 0.5, position: [0.9, 3.7, 5.6], target: [0, 1.1, 1.1], fov: 32, label: 'Bonnet', carSide: -1 },
  // helper: carries the tracking shot along the flank, outside the mirrors
  { t: 0.625, position: [4.6, 1.9, 0.4], target: [0.3, 1.0, -0.2], fov: 31, label: 'Bonnet', carSide: -0.1 },
  // 75%  behind-right, high enough to hold the engine lid and the whale tail.
  //      Car back to the right, capabilities on the left.
  { t: 0.75, position: [5.0, 2.4, -6.0], target: [-1.0, 1.2, -2.3], fov: 30, label: 'Rear', carSide: 1 },
  // 100% around the tail to a low, angled beauty shot from the left. Car
  //      left, the closing invitation on the right.
  { t: 1.0, position: [-6.9, 1.9, -6.3], target: [0, 0.7, 0], fov: 34, label: 'Profile', carSide: -0.85 },
];

const positions = BEATS.map((b) => new THREE.Vector3(...b.position));
const targets = BEATS.map((b) => new THREE.Vector3(...b.target));

/**
 * Centripetal Catmull-Rom: no cusps or overshoot at the tight turns, which a
 * uniform spline produces around the tyre and the tail.
 */
export const positionCurve = new THREE.CatmullRomCurve3(positions, false, 'centripetal', 0.5);
export const targetCurve = new THREE.CatmullRomCurve3(targets, false, 'centripetal', 0.5);

/**
 * Scroll offset -> curve parameter.
 *
 * `getPoint(u)` on a Catmull-Rom hits control point i exactly at u = i/(n-1),
 * so mapping each beat's `t` range onto its segment guarantees the camera is
 * at the authored framing when the offset reaches that beat. It moves faster
 * between distant beats, which is right: it is covering more ground in the
 * same scroll.
 */
export const progressToU = (offset: number): number => {
  const last = BEATS.length - 1;
  if (offset <= BEATS[0].t) return 0;
  if (offset >= BEATS[last].t) return 1;

  let i = 0;
  while (i < last - 1 && offset > BEATS[i + 1].t) i++;

  const a = BEATS[i];
  const b = BEATS[i + 1];
  const local = (offset - a.t) / (b.t - a.t);
  return (i + local) / last;
};

const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Interpolate a scalar beat property between the two beats bracketing the offset. */
const sampleScalar = (offset: number, pick: (b: Beat) => number, eased: boolean): number => {
  const last = BEATS.length - 1;
  if (offset <= BEATS[0].t) return pick(BEATS[0]);
  if (offset >= BEATS[last].t) return pick(BEATS[last]);
  let i = 0;
  while (i < last - 1 && offset > BEATS[i + 1].t) i++;
  const a = BEATS[i];
  const b = BEATS[i + 1];
  let k = (offset - a.t) / (b.t - a.t);
  if (eased) k = smootherstep(k);
  return pick(a) + (pick(b) - pick(a)) * k;
};

/** Linear FOV between the two beats bracketing the offset. */
export const fovAt = (offset: number): number => sampleScalar(offset, (b) => b.fov, false);

/**
 * Which side the car should sit on, eased so the slide from one side to the
 * other dwells at each beat rather than drifting continuously.
 */
export const carSideAt = (offset: number): number => sampleScalar(offset, (b) => b.carSide, true);

/** Top-down [x, z] of the five authored beats (the helper is skipped). */
export const beatsTopDown = (): [number, number][] =>
  BEATS.filter((b) => [0, 0.25, 0.5, 0.75, 1].includes(b.t)).map((b) => [
    +b.position[0].toFixed(3),
    +b.position[2].toFixed(3),
  ]);

/** The route sampled top-down, for the overlay's minimap. */
export const pathTopDown = (samples = 96): [number, number][] => {
  const out: [number, number][] = [];
  const v = new THREE.Vector3();
  for (let i = 0; i <= samples; i++) {
    positionCurve.getPoint(i / samples, v);
    out.push([+v.x.toFixed(3), +v.z.toFixed(3)]);
  }
  return out;
};

/** Which of the five authored beats the offset is nearest to, for the overlay. */
export const stageAt = (offset: number): number => {
  // the helper beat at 0.625 is not a stage of its own
  const stages = [0, 0.25, 0.5, 0.75, 1];
  let best = 0;
  let bestD = Infinity;
  stages.forEach((t, i) => {
    const d = Math.abs(offset - t);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
};

