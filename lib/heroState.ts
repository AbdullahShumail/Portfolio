/**
 * The one mutable bridge between the R3F render loop and the DOM overlay.
 *
 * useFrame writes to it every frame; the overlay reads it in its own rAF and
 * writes styles directly. Nothing here is React state, so scrolling the 3D
 * hero never causes a reconciliation.
 */
export const heroState = {
  /** ScrollControls offset, 0..1, already damped by drei. */
  offset: 0,
  /** Index of the camera beat currently nearest, 0..4. */
  stage: 0,

  /** Live camera and look-at, top-down (x, z), for the path minimap. */
  camX: 0,
  camZ: 0,
  tgtX: 0,
  tgtZ: 0,

  /**
   * The camera's route sampled top-down as [x, z] pairs, written once by the
   * 3D chunk when it mounts, so the overlay can draw it without importing three.
   */
  pathXZ: [] as [number, number][],
  /** Top-down [x, z] of each of the five authored beats, for the minimap ticks. */
  beatXZ: [] as [number, number][],

  /** Scroll the hero to an offset (0..1). Installed by the scene once mounted. */
  seek: null as ((offset: number) => void) | null,
};

/** Labels for the five authored camera beats, indexed by heroState.stage. */
export const STAGE_LABELS = ['Overview', 'Front wheel', 'Bonnet', 'Rear', 'Profile'];

/** Where the five beats sit in scroll offset. */
export const STAGE_T = [0, 0.25, 0.5, 0.75, 1];

/** Hermite smoothstep, clamped. */
export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * 0..1 presence of a panel around its beat: rises across [inStart, inEnd],
 * holds, falls across [outStart, outEnd]. Pass outStart >= 1 for a panel that
 * never leaves.
 */
export const presence = (
  offset: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number
) => smoothstep(inStart, inEnd, offset) * (1 - smoothstep(outStart, outEnd, offset));
