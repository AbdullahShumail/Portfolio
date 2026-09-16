import React from 'react';
import { useProgress } from '@react-three/drei';

/** Thin progress line while the model streams in. Gone once loaded. */
const Loading: React.FC = () => {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-bone/[0.06]">
      <div
        className="h-px bg-bone/60"
        style={{ width: progress + '%', transition: 'width 300ms ease-out' }}
      />
    </div>
  );
};

export default Loading;
