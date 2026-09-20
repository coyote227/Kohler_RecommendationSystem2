import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLBModelLoader } from './GLBModelLoader';
import extraModels from '../data/extraModels';
import { DesignPlan, KohlerProduct } from '../types';
import { getProductModelUrl } from '../utils/productModels';

interface ViewerProps {
  plan: DesignPlan;
  is2DView: boolean;
  onSelectProduct: (product: KohlerProduct) => void;
}

export const BathroomViewer3D: React.FC<ViewerProps> = ({
  plan,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gltfLoader = new GLTFLoader();
  const extraGroupRef = useRef<THREE.Group | null>(null);
  // State to trigger re‑render once the extra group is created
  const [extraGroup, setExtraGroup] = useState<THREE.Group | null>(null);

  // 1. INITIALIZE CANVAS ENVIRONMENT ON MOUNT
  useEffect(() => {
    if (!containerRef.current) return;

    // --- Persistent Three.js core objects ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');
    sceneRef.current = scene;

    const extraGroup = new THREE.Group();
    extraGroup.name = 'extra_models';
    scene.add(extraGroup);
    extraGroupRef.current = extraGroup;
    setExtraGroup(extraGroup);

    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 6, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight('#ffffff', 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const grid = new THREE.GridHelper(20, 20, '#777777', '#333333');
    grid.name = 'room_grid';
    grid.position.y = 0.01;
    scene.add(grid);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const handleResize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      if (cameraRef.current) {
        renderer.render(scene, cameraRef.current);
      }
    };
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. RUN RE-RENDER LIFECYCLE TARGETS WHEN CONTENT SWAPS
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    // --- Cleanup old slot meshes to avoid memory leaks ---
    const slotNames = ['vanity_slot', 'faucet_slot', 'shower_slot', 'mirror_slot', 'bathtub_slot'];
    slotNames.forEach((slot) => {
      const obj = scene.getObjectByName(slot);
      if (obj) {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        scene.remove(obj);
      }
    });

    // Helper routine to look up products type‑safely (theme or styles)
    const modelSlots: Array<[string, KohlerProduct | undefined, THREE.Vector3]> = [
      ['vanity_slot', plan.products.vanity, new THREE.Vector3(0, 0, 0)],
      ['faucet_slot', plan.products.faucet, new THREE.Vector3(0, 2.7, 0)],
      ['shower_slot', plan.products.shower, new THREE.Vector3(-2, 0, -1)],
      ['mirror_slot', plan.products.mirror, new THREE.Vector3(0, 1.8, -2)],
      ['bathtub_slot', plan.products.bathtub, new THREE.Vector3(2, 0, -1)],
    ];

    modelSlots.forEach(([slotName, product, position]) => {
      if (!product) return;
      const modelUrl = product.model3d ?? getProductModelUrl(product);
      if (modelUrl) updateSlot(scene, slotName, modelUrl, position);
    });

    // --- Wall plane scaling based on dimensions (factor 4) ---
    // Assume a plane mesh named "wall_plane" exists; if not, we create one.
    let wall = scene.getObjectByName('wall_plane') as THREE.Mesh | undefined;
    if (!wall) {
      const geometry = new THREE.PlaneGeometry(plan.space.length * 4, plan.space.width * 4);
      const material = new THREE.MeshBasicMaterial({ color: 0xdddddd, side: THREE.DoubleSide });
      wall = new THREE.Mesh(geometry, material);
      wall.name = 'wall_plane';
      wall.rotation.x = -Math.PI / 2;
      scene.add(wall);
    } else {
      // Update existing plane size
      const geo = wall.geometry as THREE.PlaneGeometry;
      geo.dispose();
      wall.geometry = new THREE.PlaneGeometry(plan.space.length * 4, plan.space.width * 4);
    }

    // Ensure camera clipping planes encompass the scaled scene
    camera.near = 0.1;
    camera.far = 2000;
    camera.updateProjectionMatrix();

  }, [plan]);

  // 3. SECURE ASSET SLOTS CLEARANCE AND LOAD PIPELINE
  const updateSlot = (scene: THREE.Scene, slotName: string, url: string, pos: THREE.Vector3) => {
    const existing = scene.getObjectByName(slotName);
    if (existing) {
      scene.remove(existing);
      existing.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    gltfLoader.load(url, (gltf) => {
      const model = gltf.scene;
      model.name = slotName;
      model.position.copy(pos);

      // Normalize exports with different source-unit conventions to room scale.
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const largestDimension = Math.max(size.x, size.y, size.z);
      if (largestDimension > 5 || largestDimension < 0.05) {
        model.scale.multiplyScalar(1.2 / largestDimension);
      }
      scene.add(model);
    }, undefined, (err) => {
      console.error(`Error loading model at slot [${slotName}]:`, err);
    });
  };


  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
      {extraGroup && (
        <GLBModelLoader modelFiles={extraModels} parentGroup={extraGroup} />
      )}
    </>
  );
};
