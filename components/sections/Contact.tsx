import React from 'react';
import { SITE } from '../../data/site';
import Reveal from '../Reveal';

interface ContactProps {
  onTarget: (id: string | null) => void;
  onOpen: () => void;
}

/**
 * The orb stays, because the particles gathering into a ring around it is the
 * one flourish worth keeping. Everything around it is plain.
 */
const Contact: React.FC<ContactProps> = ({ onTarget, onOpen }) => (
  <section id="contact" className="relative px-6 py-28 md:px-12 md:py-44">
    <div className="mx-auto w-full max-w-[1180px]">
      <div className="grid items-center gap-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal from="up">
            <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.34em] text-bone/30">
              Contact
            </p>
          </Reveal>

          <Reveal delay={80} from="up">
            <h2
              className="max-w-xl font-display font-light leading-[1.1] tracking-tight text-bone"
              style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3.4rem)' }}
            >
              Tell me what you are building.
            </h2>
          </Reveal>

          <Reveal delay={180} from="up">
            <p className="mt-8 max-w-lg text-[15px] leading-[1.75] text-bone/45">
              If it needs a model, an interface, or both held together properly, it is probably my
              kind of problem.
            </p>
          </Reveal>

          <Reveal delay={280} from="up">
            <div className="mt-12 space-y-8">
              <a href={'mailto:' + SITE.email} className="group inline-flex items-center gap-4">
                <span className="font-display text-lg font-light tracking-tight text-bone/75 transition-colors duration-300 group-hover:text-bone md:text-2xl">
                  {SITE.email}
                </span>
                <span className="h-px w-0 bg-bone/50 transition-all duration-500 group-hover:w-10" />
              </a>

              <div className="flex flex-wrap gap-3">
                {SITE.social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-bone/12 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50 transition-colors duration-300 hover:border-bone/30 hover:text-bone"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <Reveal delay={200} from="up">
            <button
              type="button"
              data-target-id="contact-orb"
              data-shape="ring"
              onPointerEnter={() => onTarget('contact-orb')}
              onPointerLeave={() => onTarget(null)}
              onClick={onOpen}
              className="group relative flex h-[240px] w-[240px] items-center justify-center rounded-full border border-bone/[0.14] transition-colors duration-700 hover:border-bone/30 md:h-[330px] md:w-[330px]"
            >
              <span className="animate-spin-slow absolute inset-4 rounded-full border border-dashed border-bone/[0.09] transition-colors duration-700 group-hover:border-bone/20" />
              <span className="relative z-10 flex flex-col items-center gap-1">
                <span className="font-display text-2xl font-light tracking-tight text-bone/85 transition-colors duration-500 group-hover:text-bone md:text-4xl">
                  Get in touch
                </span>
                <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-bone/30">
                  Start a project
                </span>
              </span>
            </button>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default Contact;
