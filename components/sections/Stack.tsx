import React from 'react';
import { SITE } from '../../data/site';
import Reveal from '../Reveal';
import SectionHead from '../SectionHead';

const Stack: React.FC = () => (
  <section id="stack" className="relative px-6 py-16 md:px-12 md:py-24">
    <div className="mx-auto w-full max-w-[1400px]">
      <SectionHead index="02" label="Toolkit" />

      <div className="grid gap-px overflow-hidden rounded-lg border border-bone/[0.07] bg-bone/[0.05] md:grid-cols-2 xl:grid-cols-4">
        {SITE.stack.map((group, i) => (
          <Reveal key={group.label} delay={i * 90} from="up" className="bg-obsidian">
            <div className="group h-full px-7 py-9 transition-colors duration-500 hover:bg-ink/60 md:px-8 md:py-11">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-4 bg-bone/25 transition-all duration-500 group-hover:w-8" />
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone/45">
                  {group.label}
                </p>
              </div>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="font-display text-lg font-light tracking-tight text-bone/60 transition-colors duration-300 hover:text-bone md:text-xl"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Stack;
