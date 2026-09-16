import React from 'react';
import { Project } from '../../types';
import { SITE } from '../../data/site';
import Reveal from '../Reveal';

interface WorkProps {
  onTarget: (id: string | null) => void;
}

const openHref = (href: string) => {
  if (!href || href === '#') return;
  window.open(href, '_blank', 'noopener,noreferrer');
};

const Card: React.FC<{ project: Project; delay: number }> = ({ project, delay }) => {
  const live = Boolean(project.href) && project.href !== '#';

  return (
    <Reveal delay={delay} from="up">
      <button
        type="button"
        onClick={() => openHref(project.href)}
        className="group block w-full text-left"
        aria-label={project.title}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-bone/[0.08] bg-ink">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover object-top grayscale transition-all duration-[1400ms] ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
          />
          {/* scrim so bright and dark screenshots sit at the same weight */}
          <div className="pointer-events-none absolute inset-0 bg-obsidian/50 transition-opacity duration-700 group-hover:opacity-0" />
        </div>

        <h3
          className="mt-8 font-display font-light uppercase leading-none tracking-tight text-bone/90 transition-colors duration-500 group-hover:text-bone"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}
        >
          {project.title}
        </h3>

        <p className="mt-3.5 flex items-center gap-2 text-[13px] font-light text-bone/40 transition-colors duration-500 group-hover:text-bone/65">
          <span>{project.tags.join(' / ')}</span>
          {live ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M9 7h8v8" />
            </svg>
          ) : null}
        </p>
      </button>
    </Reveal>
  );
};

/**
 * Staggered two-column grid. The right column starts lower on desktop so the
 * eye zigzags down the page instead of scanning two flat rows.
 */
const Work: React.FC<WorkProps> = ({ onTarget }) => {
  const left = SITE.projects.filter((_, i) => i % 2 === 0);
  const right = SITE.projects.filter((_, i) => i % 2 === 1);

  return (
    <section id="work" className="relative px-6 py-28 md:px-12 md:py-44">
      <div className="mx-auto w-full max-w-[1180px]">
        <Reveal from="up">
          <h2
            data-target-id="work-title"
            data-shape="frame"
            onPointerEnter={() => onTarget('work-title')}
            onPointerLeave={() => onTarget(null)}
            className="mb-20 inline-block font-display font-light uppercase leading-none tracking-tight text-bone md:mb-32"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)' }}
          >
            Projects
          </h2>
        </Reveal>

        <div className="grid gap-x-16 gap-y-20 md:grid-cols-2 md:gap-x-20">
          <div className="flex flex-col gap-20 md:gap-28">
            {left.map((p, i) => (
              <Card key={p.title} project={p} delay={i * 90} />
            ))}
          </div>
          <div className="flex flex-col gap-20 md:mt-36 md:gap-28">
            {right.map((p, i) => (
              <Card key={p.title} project={p} delay={i * 90 + 60} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
