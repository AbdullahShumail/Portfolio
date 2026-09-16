import React from 'react';
import { SITE } from '../../data/site';
const Footer: React.FC = () => (
  <footer className="relative border-t border-bone/[0.07] px-6 pb-32 pt-16 md:px-12 md:pb-28">
    <div className="mx-auto w-full max-w-[1400px]">
      {/* oversized wordmark */}
      <p
        aria-hidden="true"
        className="text-outline select-none font-display font-light leading-[0.85] tracking-tight"
        style={{ fontSize: 'clamp(2.6rem, 15vw, 14rem)' }}
      >
        {SITE.name.toUpperCase()}
      </p>
      <div className="mt-14 flex flex-col gap-6 border-t border-bone/[0.07] pt-8 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone/30">
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone/30">
          {SITE.roles[0]} — {SITE.roles[1]}
        </p>
        <p className="max-w-md font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-bone/25">
          3D model:{' '}
          <a
            href="https://sketchfab.com/3d-models/free-1975-porsche-911-930-turbo-8568d9d14a994b9cae59499f0dbed21e"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone/40 transition-colors hover:text-bone"
          >
            1975 Porsche 911 (930) Turbo
          </a>{' '}
          by{' '}
          <a
            href="https://sketchfab.com/lionsharp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone/40 transition-colors hover:text-bone"
          >
            Lionsharp Studios
          </a>
          , CC BY 4.0
        </p>
        <div className="flex gap-8">
          {SITE.social.map((s) => (
            <a
              key={s.short}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone/40 transition-colors duration-300 hover:text-bone"
            >
              {s.short}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
export default Footer;
