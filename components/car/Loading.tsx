import React from 'react';
import { useProgress } from '@react-three/drei';

/** Percentage while the model streams in. Gone once loaded. */
const Loading: React.FC = () => {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bone/40">Loading</p>
        <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-bone/80">{Math.round(progress)}%</p>
        <div className="mx-auto mt-4 h-px w-40 bg-bone/10">
          <div className="h-px bg-bone/70" style={{ width: progress + '%', transition: 'width 200ms ease-out' }} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
