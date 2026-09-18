/**
 * The one mutable bridge between the R3F render loop and the DOM overlay.
 *
 * The Director writes it every frame from useScroll; everything else reads.
 * Nothing here is React state, so scrolling never causes a reconciliation.
 */
export const scrollState = {
  /** ScrollControls offset, 0..1, already damped by drei. */
  offset: 0,
  /** Where the car is along the road, world Z. */
  carZ: 0,
  /** Smoothed drive speed, world units per second. */
  speed: 0,
  /** Which section is under the viewer: hero, drive, projects, contact. */
  section: 'hero' as 'hero' | 'drive' | 'projects' | 'contact',
  /** Scroll the experience to an offset (0..1). Installed by the scene once mounted. */
  seek: null as ((offset: number) => void) | null,
  /** drei's scroll container, once mounted. */
  el: null as HTMLElement | null,
};

/** Hermite smoothstep, clamped. */
export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 0..1 presence: rises across [inStart, inEnd], falls across [outStart, outEnd]. */
export const presence = (o: number, inStart: number, inEnd: number, outStart: number, outEnd: number) =>
  smoothstep(inStart, inEnd, o) * (1 - smoothstep(outStart, outEnd, o));

/** Scroll offsets the nav buttons seek to. Plain numbers so the overlay never imports three. */
export const SECTIONS = {
  hero: 0,
  projects: 0.44,
  contact: 1,
};
