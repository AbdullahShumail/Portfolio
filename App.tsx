import React, { Suspense, lazy, useEffect, useState } from 'react';
import Overlay from './components/Overlay';

// Everything that touches three/fiber/drei lives in a lazy chunk, so the
// overlay paints before the 3D code arrives. The import is started here, at
// module load, so the chunk is already downloading while React mounts the
// overlay rather than waiting for the first render to ask for it.
const scenePromise = import('./components/car/CarScene');
const loadingPromise = import('./components/car/Loading');
const CarScene = lazy(() => scenePromise);
const Loading = lazy(() => loadingPromise);

/**
 * The page is one scroll-driven drive. The canvas fills the viewport and owns
 * the scroll; the overlay sits on top with pointer-events off and opts its
 * buttons back in. Both read the same scroll offset, so the wheel and the nav
 * buttons produce identical animation.
 */
const App: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 bg-obsidian">
      <div className="car-scroll-host absolute inset-0 z-0">
        <Suspense fallback={null}>
          <CarScene />
          <Loading />
        </Suspense>
      </div>
      <Overlay ready={ready} />
    </div>
  );
};

export default App;
