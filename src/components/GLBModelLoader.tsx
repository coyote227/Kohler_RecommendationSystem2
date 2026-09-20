import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { loadGLB } from '../utils/glbLoader';
import { LoadingSpinner } from './LoadingSpinner';

interface GLBModelLoaderProps {
  /** Array of GLB filenames that live in the public folder */
  modelFiles: string[];
  /** The Three.js group that lives inside the main scene – models will be added here */
  parentGroup: THREE.Group;
  /** Optional per‑model position overrides (same length as modelFiles) */
  positions?: THREE.Vector3[];
  /** Optional per‑model scale overrides (same length as modelFiles) */
  scales?: THREE.Vector3[];
}

/**
 * Dynamically loads each GLB in `modelFiles` and attaches it to `parentGroup`.
 * Shows a loading spinner while any model is still being fetched.
 */
export const GLBModelLoader: React.FC<GLBModelLoaderProps> = ({
  modelFiles,
  parentGroup,
  positions,
  scales,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const attachModel = (group: THREE.Group, idx: number) => {
    if (positions?.[idx]) group.position.copy(positions[idx]);
    if (scales?.[idx]) group.scale.copy(scales[idx]);
    group.name = `GLB_${modelFiles[idx]}`;
    parentGroup.add(group);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const loadAll = async () => {
      try {
        const groups = await Promise.all(
          modelFiles.map(f => loadGLB(`/${f}`))
        );
        if (cancelled) return;
        groups.forEach((g, i) => attachModel(g, i));
      } catch (e) {
        console.error('GLB load error:', e);
        setError('One or more models failed to load – check console');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadAll();
    return () => {
      cancelled = true;
      // clean up added models on unmount
      modelFiles.forEach(f => {
        const child = parentGroup.getObjectByName(`GLB_${f}`);
        if (child) parentGroup.remove(child);
      });
    };
  }, [modelFiles, parentGroup, positions, scales]);

  return (
    <>
      {loading && <LoadingSpinner />}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          {error}
        </div>
      )}
    </>
  );
};
