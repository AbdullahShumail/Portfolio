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
App.tsx                     section assembly, active-section tracking
data/site.ts                all content
types.ts                    content model
lib/cameraPath.ts           the five camera beats and the two Catmull-Rom curves
lib/heroState.ts            mutable bridge from the render loop to the DOM overlay
components/
  car/CarScene.tsx          Canvas, ScrollControls, lighting, environment, shadows
  car/CarModel.tsx          useGLTF + useAnimations, centring, material pass
  car/CameraRig.tsx         useScroll -> curves -> maath damping -> camera
  car/Loading.tsx           progress line while the model streams
  NeuralField.tsx           (unmounted) particle canvas, kept for reference
  AuroraOrbs.tsx            (unmounted) the old background glow
  Reveal.tsx                scroll reveal
  TypeFX.tsx                per-character headline reveal
  Navigation.tsx            top bar and dock
  SectionHead.tsx           shared section eyebrow
  ContactModal.tsx          enquiry form
  sections/                 Hero, Profile, Capabilities, Work, Stack,
                            Contact, Footer
```

## The 3D hero

`public/car/car.glb` is a 1975 Porsche 911 (930) Turbo by Lionsharp Studios,
CC BY 4.0, credited in the footer. The Sketchfab export was 74 MB; it is
packed to 3.1 MB with glTF-Transform (meshopt geometry, WebP textures capped at
1024px, hierarchy flattened and meshes joined). Clearcoat, specular and
transmission extensions survive. The raw download lives in `_source/`, which is
gitignored and never shipped.

The hero is a 100vh section. The canvas fills it; the copy is overlaid on the
left with `pointer-events: none`, so the wheel falls through to drei's
`ScrollControls`, which owns scroll for four viewport-heights and then hands off
to the page. `useScroll().offset` runs 0 to 1 across that range and drives the
camera along two centripetal Catmull-Rom curves (position and look-at) through
five authored beats: overview, front wheel, bonnet, rear, beauty shot. Both are
damped with `maath/easing` so the lens arrives rather than snaps.

Beats are authored against the model after centring: wheels on y = 0, box
centre at the origin, front facing +Z. Edit them in `lib/cameraPath.ts`. Open
the dev server with `?debug` for an axes helper, an origin marker and a marker
at the opening look-at, and read `window.__hero` in the console for the live
camera state.

Two things that cost real time and are worth knowing:

- `Box3.setFromObject` must be called with `precise = true` on this model. The
  optimised export bakes a large rotation into every node, and the default path
  transforms each local box's corners rather than its vertices, which inflated
  the height from 1.9 to 3.9 units and floated the car a metre off the ground.
- Headless Chrome renders on SwiftShader at a few frames per second, and the
  damping uses a clamped `dt`, so a camera move that settles in half a second on
  real hardware takes ten to fifteen seconds under a screenshot harness. Sample
  generously before concluding a beat is wrong.

The particle field and aurora orbs are no longer rendered but the files remain
in `components/` in case the earlier background is wanted back.
