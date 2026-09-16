import React, { Suspense, lazy } from 'react';
import HeroPanels from '../hero/HeroPanels';

// Everything that touches three/fiber/drei lives in a lazy chunk, so the
// page shell paints before ~700 KB of 3D code arrives.
const CarScene = lazy(() => import('../car/CarScene'));
const Loading = lazy(() => import('../car/Loading'));

interface HeroProps {
  ready: boolean;
  onContact: () => void;
}

/**
 * Full-screen 3D hero. The canvas fills the section and owns scroll for
 * HERO_PAGES viewport-heights; the panels are overlaid with pointer-events
 * off, so the wheel falls straight through to the scene's scroll container,
 * and each beat of the camera path brings its own panel on the side the car
 * has vacated.
 */
const Hero: React.FC<HeroProps> = ({ ready, onContact }) => (
  <section id="top" className="relative h-[100svh] w-full overflow-hidden">
    <div className="car-scroll-host absolute inset-0 z-0">
      <Suspense fallback={null}>
        <CarScene />
        <Loading />
      </Suspense>
    </div>

    {/* bottom wash so the readout and the dock stay legible over the floor */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[34%]"
      style={{ background: 'linear-gradient(0deg, rgba(4,4,5,0.85) 0%, rgba(4,4,5,0) 100%)' }}
    />

    <div className="absolute inset-0 z-10">
      <HeroPanels ready={ready} onContact={onContact} />
    </div>
  </section>
);

export default Hero;
