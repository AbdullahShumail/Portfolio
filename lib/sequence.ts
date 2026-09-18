import * as THREE from 'three';
import { SITE } from '../data/site';
import { SECTIONS } from './scrollState';

export { SECTIONS };

/**
 * The whole page as one drive, authored against scroll offset 0..1.
 *
 *   0.00 - 0.08  HERO      car parked right, name left, the hero angle
 *   0.08 - 0.26  BEATS     the car stays parked while the camera takes its
 *                          turns: front wheel, over the bonnet, the rear deck
 *   0.26 - 0.40  DRIVE     pulls away through a set of traffic signals
 *   0.40 - 0.84  PROJECTS  four signals come in one by one, each anchoring a card
 *   0.84 - 1.00  EXIT      the car accelerates off into the distance; contact
 *
 * The car moves along +Z. Everything else is placed in that world.
 */

// ---------------------------------------------------------------------------
// Car position
// ---------------------------------------------------------------------------

/** (offset, z) keyframes for the car, linear between them except the exit. */
const CAR_Z: [number, number][] = [
  [0, 0],
  [0.26, 0],
  [0.4, 26],
  [0.84, 96],
];

const EXIT_START = 0.84;
const EXIT_Z0 = 96;
const EXIT_DISTANCE = 190;

export const carZAt = (o: number): number => {
  if (o >= EXIT_START) {
    // ease-in: the car leaves faster the further it goes
    const k = Math.min(1, (o - EXIT_START) / (1 - EXIT_START));
    return EXIT_Z0 + EXIT_DISTANCE * k * k * k;
  }
  for (let i = 0; i < CAR_Z.length - 1; i++) {
    const [ta, za] = CAR_Z[i];
    const [tb, zb] = CAR_Z[i + 1];
    if (o <= tb) return za + ((o - ta) / (tb - ta)) * (zb - za);
  }
  return EXIT_Z0;
};

// ---------------------------------------------------------------------------
// Camera, relative to the car
// ---------------------------------------------------------------------------

interface CamKey {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  /** +1 pushes the car to the right of the screen, 0 centres it. */
  side: number;
}

const CAM: CamKey[] = [
  // hero: the three-quarter front, car on the right, name on the left
  { t: 0.0, pos: [6.1, 2.0, 5.9], look: [0, 0.8, 0.2], fov: 34, side: 1 },
  // front wheel, from slightly above so the Fuchs rim and the fender read
  { t: 0.09, pos: [3.8, 1.05, 3.6], look: [0.55, 0.42, 1.39], fov: 28, side: 0.5 },
  // up and over the nose, looking down the bonnet toward the screen
  { t: 0.16, pos: [0.9, 3.7, 5.6], look: [0, 1.1, 1.1], fov: 32, side: -1 },
  // carried along the flank, outside the mirrors
  { t: 0.2, pos: [4.6, 1.9, 0.4], look: [0.3, 1.0, -0.2], fov: 31, side: 0 },
  // behind-right, high enough to hold the engine lid and the whale tail
  { t: 0.25, pos: [5.0, 2.4, -6.0], look: [-0.4, 1.2, -2.3], fov: 30, side: 0 },
  // settle into the chase as it pulls away
  { t: 0.36, pos: [0.9, 2.9, -7.6], look: [0, 1.0, 5.0], fov: 42, side: 0 },
  { t: 0.84, pos: [1.1, 2.8, -7.4], look: [0, 1.0, 5.0], fov: 42, side: 0 },
];

/** Offset at which the camera stops following and lets the car go. */
export const RELEASE_AT = 0.87;

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

const bracket = (o: number) => {
  const last = CAM.length - 1;
  if (o <= CAM[0].t) return { a: CAM[0], b: CAM[0], k: 0 };
  if (o >= CAM[last].t) return { a: CAM[last], b: CAM[last], k: 0 };
  let i = 0;
  while (i < last - 1 && o > CAM[i + 1].t) i++;
  const a = CAM[i];
  const b = CAM[i + 1];
  return { a, b, k: smootherstep((o - a.t) / (b.t - a.t)) };
};

/** Camera position relative to the car at this offset. */
export const camRelAt = (o: number, out: THREE.Vector3): THREE.Vector3 => {
  const { a, b, k } = bracket(o);
  return out.copy(_a.set(...a.pos).lerp(_b.set(...b.pos), k));
};

/** Look-at point relative to the car at this offset. */
export const lookRelAt = (o: number, out: THREE.Vector3): THREE.Vector3 => {
  const { a, b, k } = bracket(o);
  return out.copy(_a.set(...a.look).lerp(_b.set(...b.look), k));
};

export const fovAt = (o: number): number => {
  const { a, b, k } = bracket(o);
  return a.fov + (b.fov - a.fov) * k;
};

export const sideAt = (o: number): number => {
  const { a, b, k } = bracket(o);
  return a.side + (b.side - a.side) * k;
};

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

export interface SignalSpec {
  /** World position of the base of the pole. */
  x: number;
  z: number;
  /** Which side of the road, for the card and the slide-in direction. */
  side: 1 | -1;
}

/** The opening set the car drives through: pairs either side of the lane. */
export const SIGNAL_SET: SignalSpec[] = [8, 13.5, 19].flatMap((z) => [
  { x: -2.8, z, side: -1 },
  { x: 2.8, z, side: 1 },
]);

export interface ProjectSignalSpec extends SignalSpec {
  /** Offset at which the car is alongside this signal. */
  t: number;
  index: number;
}

/**
 * One signal per project, spaced evenly through the projects section. Each
 * stands a little ahead of where the car is at its own offset, alternating
 * sides, so the card is beside the driver's window as it arrives.
 */
export const PROJECT_SIGNALS: ProjectSignalSpec[] = SITE.projects.map((_, i) => {
  const n = SITE.projects.length;
  const t = 0.45 + (i * (0.81 - 0.45)) / Math.max(1, n - 1);
  const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
  return { t, index: i, side, x: side * 2.7, z: carZAt(t) + 2.5 };
});

export const sectionAt = (o: number): 'hero' | 'drive' | 'projects' | 'contact' => {
  if (o < 0.26) return 'hero';
  if (o < 0.41) return 'drive';
  if (o < 0.9) return 'projects';
  return 'contact';
};

/** Labels for the parked beats, for the readout. */
export const BEAT_LABELS: [number, string][] = [
  [0, 'Overview'],
  [0.09, 'Front wheel'],
  [0.16, 'Bonnet'],
  [0.25, 'Rear'],
  [0.36, 'Drive'],
];
