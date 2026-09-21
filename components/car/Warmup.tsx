import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Compile every shader the scene needs before the first frame, without
 * freezing the page to do it.
 *
 * drei's <Preload> calls gl.compile, which is synchronous: a dozen physical
 * materials compile back to back on the main thread and the tab locks for
 * the duration. compileAsync uses KHR_parallel_shader_compile where the
 * driver offers it, so the work happens in the background and the first
 * frame lands as soon as it is done.
 */
const Warmup: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(scene, camera).catch(() => {
      // Fall back to the blocking path if the async one is unavailable.
      if (!cancelled) gl.compile(scene, camera);
    });
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);

  return null;
};

export default Warmup;
