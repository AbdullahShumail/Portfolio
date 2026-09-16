import React from 'react';
import Reveal from './Reveal';

interface SectionHeadProps {
  index: string;
  label: string;
  note?: string;
}

/** Shared eyebrow: index, hairline rule, label. */
const SectionHead: React.FC<SectionHeadProps> = ({ index, label, note }) => (
  <Reveal from="up">
    <div className="mb-16 flex items-center gap-5 border-b border-bone/[0.06] pb-5 md:mb-24">
      <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone/25">
        {index}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-bone/55">
        {label}
      </span>
      <span className="h-px flex-1 bg-bone/[0.08]" />
      {note ? (
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-bone/25 md:block">
          {note}
        </span>
      ) : null}
    </div>
  </Reveal>
);

export default SectionHead;
