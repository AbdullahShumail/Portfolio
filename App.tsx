import React, { useCallback, useEffect, useState } from 'react';

import ContactModal from './components/ContactModal';
import { Dock, NAV_TARGETS, TopBar } from './components/Navigation';
import { heroState } from './lib/heroState';

import Contact from './components/sections/Contact';
import Footer from './components/sections/Footer';
import Hero from './components/sections/Hero';
import Stack from './components/sections/Stack';
import Work from './components/sections/Work';

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [active, setActive] = useState('top');
  const [contactOpen, setContactOpen] = useState(false);

  // One frame after mount so the hero reveal has something to transition from.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  /**
   * Which dock item is active. While the hero fills the viewport the answer
   * comes from the 3D beat (about and capabilities live inside it); once the
   * page has scrolled past, it comes from whichever section sits under the
   * top third of the screen. Polled on rAF because the hero's inner scroll
   * never fires a window scroll event; setState only when the answer changes.
   */
  useEffect(() => {
    const ids = NAV_TARGETS.filter((n) => n.seek === undefined && n.id !== 'top').map((n) => n.id);
    let raf = 0;
    let last = '';

    const tick = () => {
      raf = requestAnimationFrame(tick);
      let current = 'top';

      if (window.scrollY < window.innerHeight * 0.6) {
        if (heroState.stage === 2) current = 'profile';
        else if (heroState.stage === 3) current = 'capabilities';
      } else {
        const line = window.innerHeight * 0.34;
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= line) current = id;
        }
      }

      if (current !== last) {
        last = current;
        setActive(current);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);

  return (
    <div className="relative min-h-screen bg-obsidian">
      <div className="relative z-10">
        <TopBar onContact={openContact} />

        <main>
          <Hero ready={ready} onContact={openContact} />
          <Work onTarget={setTarget} />
          <Stack />
          <Contact onTarget={setTarget} onOpen={openContact} />
        </main>

        <Footer />
      </div>

      <Dock active={active} />
      <ContactModal isOpen={contactOpen} onClose={closeContact} />
    </div>
  );
};

export default App;
