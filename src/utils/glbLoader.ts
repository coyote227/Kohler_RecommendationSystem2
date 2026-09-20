import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

/** Load a GLB from the public folder */
export const loadGLB = (url: string): Promise<THREE.Group> => {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      gltf => resolve(gltf.scene),
      undefined,
      err => reject(err)
    );
  });
};
