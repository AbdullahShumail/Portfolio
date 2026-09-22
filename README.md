# Abdullah Shumail — Portfolio

Personal site for an AI engineer and full-stack developer. React 19 + TypeScript
on Vite, Tailwind via CDN, Supabase for the contact form, and a scroll-driven
3D hero on react-three-fiber.

React is pinned to 19.2.x: `@react-three/fiber` 9 declares a peer range of
`>=19 <19.3`, and a caret range resolved to 19.3 and refused to install.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production bundle into dist/
npm run typecheck
```

## Environment

Create `.env.local`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Both feed the contact form, which inserts into a `quotes` table with columns
`name`, `email`, `project_details`. If either variable is missing the site still
loads and the form offers a mailto link instead of failing.

## Editing content

All copy, links, projects and skills live in [`data/site.ts`](data/site.ts).
No component hard-codes text, so that is the only file you need for a content
change.

To put an image behind the about section, drop it in `public/` and set
`about.backgroundImage` to its path. While that is empty the section renders on
the plain ground, which still reads as intentional.

## Structure

```
App.tsx                     canvas + overlay; the whole page is the 3D scroll
data/site.ts                all content
lib/scrollState.ts          mutable bridge: offset, carZ, speed, section, seek
lib/sequence.ts             the drive: car z, camera, signals, all vs offset
components/
  Overlay.tsx               nav buttons, hero copy, contact panel, progress
  ContactForm.tsx           the enquiry form (Supabase, mailto fallback)
  TypeFX.tsx                per-character name reveal
  car/CarScene.tsx          Canvas, ScrollControls, lighting, fog, card layer
  car/Car.tsx               the moving group: model + contact shadow
  car/CarModel.tsx          useGLTF, centring, materials, the wheel rig
  car/CameraRig.tsx         director: reads useScroll, follows, releases
  car/Signals.tsx           procedural traffic signals + Html project cards
  car/Lamp.tsx              follow-spot on the car
  car/Daylight.tsx          sky dome, sun, hemisphere fill and fog, night to day
```

## The drive

One `ScrollControls` container is the page. `useScroll().offset` runs 0 to 1
across `PAGES` viewport-heights; the nav buttons call `scroll.el.scrollTo`, so
wheel and buttons drive identical animation.

```
0.00 - 0.08  hero      car parked right, name left
0.08 - 0.26  beats     car stays parked; camera takes its turns: front wheel,
                       over the bonnet, the rear deck
0.26 - 0.40  drive     pulls away through a set of signals; each flips green;
                       day breaks as it crosses them
0.44 - 0.82  projects  one signal per project rises in, each with an Html card
0.84 - 1.00  exit      car accelerates into the haze; camera holds; night
                       returns; contact
```

The projects section scales with `SITE.projects`: `PROJECT_STEP` is the
spacing, every signal and card window is a fraction of it, and `PAGES` grows
with the count so each project keeps about a page of scroll.

Daylight is one number, `daylightAt(offset)`, read by `Daylight.tsx` (sky
dome colours, sun, hemisphere, fog colour and density) and by `Lamp.tsx`
(which dims itself). The dome is a sphere centred on the camera with a
ground / horizon / zenith gradient that goes through the same tone mapping
as the scene, so the fog colour and the horizon land on the same pixel.

Everything is authored in `lib/sequence.ts` against offset: the car's z, the
camera's position and look-at relative to the car, fov, and where every signal
stands. All motion is damped with `maath/easing` in `useFrame`.

Three things that cost real time:

- **Front wheels wobbled.** The model's front wheels are steered about 18
  degrees. Spinning them about world X rolled them off-axis. Each wheel's axle
  is now measured from its tyre geometry (thinnest bounding-box axis, rotated
  by the mesh's world orientation) and the spin group is aligned to it.
- **`Box3.setFromObject` needs `precise: true`** on this model, or the flattened
  export's baked rotations inflate the box to twice the car's height.
- **drei's `Html` mounts inside the ScrollControls container**, which scrolls,
  so cards drifted off screen. They are portalled into a fixed layer beside
  the canvas instead.
- **The `city` environment preset fetches a 1.5 MB HDR from a third-party
  CDN** and suspends the scene until it lands. The environment is now
  rendered from `Lightformer` softboxes in one frame, with no network.

## Phones

The same scene, reframed rather than replaced. `portraitAt` in
`lib/sequence.ts` pulls the camera back until the car fits the width and
slides the frame: car below the copy while parked, above the cards once
driving. The overlay panels top-anchor under `md`, the About body is
hidden (headline and facts carry it), and the project cards become one
bottom sheet above the dock, driven from `cardPresenceAt` so they keep the
desktop timing. Below `md` the signal-anchored `Html` cards are not
rendered at all. `LOW_POWER` (narrow or coarse pointer) drops DPR to 1.5,
the environment to 128px, the contact shadow to 512, and the glass to
plain alpha, since transmission renders the scene twice per frame.

## Load time

Everything on the critical path was measured and trimmed:

| | before | after |
|---|---|---|
| model | 3.12 MB, served unhashed from `public/` | 3.12 MB, 1024px WebP + meshopt, hashed and cached forever |
| CSS | Tailwind CDN, 110 KB blocking script, compiled at runtime | 27 KB built, 5.9 KB gzipped |
| environment | 1.5 MB HDR from a CDN | rendered locally |
| 3D chunks + model | fetched after the main bundle executed | `modulepreload` / `preload` hints in the head, in flight from HTML parse |
| shaders | compiled synchronously, page frozen meanwhile | `compileAsync` |
| cold transfer | about 3.7 MB | 3.6 MB, no third-party scripts, model in flight from HTML parse |

The model lives in `models/car.glb` and is imported with `?url`, so Vite
hashes it into `dist/assets/`; `public/_headers` marks that folder immutable
for a year. A new export gets a new name, so caches never go stale. The
`preloadHeavyAssets` plugin in `vite.config.ts` injects the head hints from
the real bundle, so the hashed names are always right.

A lighter export (512px textures, mesh simplified to 60%, 1.78 MB) was
tried and rejected: the paint and the Fuchs rims lost too much. The model
is the quality floor; everything else on the path is what gets trimmed.
The export command is in `models/car-license.txt`.

Also: looking down +Z, world +X is screen-left. Cards on the +X verge extend
left, away from the road.

The model is a 1975 Porsche 911 (930) Turbo by Lionsharp Studios, CC BY 4.0,
credited in the contact panel. 74 MB from Sketchfab, packed to 3 MB with
glTF-Transform; the raw download is in gitignored `_source/`.
