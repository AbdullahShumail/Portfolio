import React from 'react';
import { SITE } from '../../data/site';
import Reveal from '../Reveal';
import SectionHead from '../SectionHead';

/**
 * A flat list rather than a bento of glowing cards. Each capability is one row:
 * index, name, a sentence, and the specifics as plain text.
 */
const Capabilities: React.FC = () => (
  <section id="capabilities" className="relative px-6 py-28 md:px-12 md:py-44">
    <div className="mx-auto w-full max-w-[1180px]">
      <SectionHead index="01" label="Capabilities" />

      <div className="border-t border-bone/[0.07]">
        {SITE.capabilities.map((cap, i) => (
          <Reveal key={cap.index} delay={i * 80} from="up">
            <div className="grid gap-4 border-b border-bone/[0.07] py-10 md:grid-cols-12 md:gap-8 md:py-12">
              <div className="flex items-baseline gap-5 md:col-span-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-bone/25">
                  {cap.index}
                </span>
                <h3 className="font-display text-xl font-light tracking-tight text-bone md:text-2xl">
                  {cap.title}
                </h3>
              </div>

              <p className="text-[15px] leading-[1.7] text-bone/45 md:col-span-5">{cap.body}</p>

              <p className="text-[13px] leading-[1.9] text-bone/35 md:col-span-3 md:text-right">
                {cap.points.join(', ')}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Capabilities;
