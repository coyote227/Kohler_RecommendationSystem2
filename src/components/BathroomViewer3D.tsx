import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DesignPlan, KohlerProduct } from '../types';
import { Kohler3DModelFactory } from '../utils/modelFactory';
import { createProceduralTileTexture } from '../utils/tileTextures';

interface BathroomViewer3DProps {
  plan: DesignPlan;
  is2DView: boolean;
  onSelectProduct?: (product: KohlerProduct) => void;
  selectedProductId?: string | null;
  className?: string;
}

export const BathroomViewer3D: React.FC<BathroomViewer3DProps> = ({
  plan,
  is2DView,
  onSelectProduct,
  selectedProductId,
  className = "w-full h-full"
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const fixturesGroupRef = useRef<THREE.Group | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);

  // Convert room dimensions to meters
  // Convert room dimensions to meters with fallbacks
  const roomLengthM = plan.space.unit === 'ft' ? (plan.space.length ?? 2.5) * 0.3048 : (plan.space.length ?? 2.5);
  const roomWidthM = plan.space.unit === 'ft' ? (plan.space.width ?? 2.0) * 0.3048 : (plan.space.width ?? 2.0);
  const roomHeightM = plan.space.unit === 'ft' ? ((plan.space.height ?? 2.5) * 0.3048) : (plan.space.height ?? 2.5);

  // 1. Initial Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    // Use container dimensions, fallback to non-zero window dimensions if initial container hasn't layout
    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0d0e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(roomWidthM * 1.5, roomHeightM * 1.3, roomLengthM * 1.6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // prevent going under floor
    controls.minDistance = 1.5;
    controls.maxDistance = 15;
    controls.target.set(0, roomHeightM * 0.45, 0);
    controlsRef.current = controls;

    // Groups for modular updates
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    roomGroupRef.current = roomGroup;

    const fixturesGroup = new THREE.Group();
    scene.add(fixturesGroup);
    fixturesGroupRef.current = fixturesGroup;

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Robust ResizeObserver to guarantee canvas matches container even during tab transitions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && camera && renderer) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 2. Camera perspective update for 3D vs 2D Plan View
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (is2DView) {
      // Top-down Orthographic-style view
      camera.position.set(0, Math.max(roomWidthM, roomLengthM) * 2.2, 0.001);
      controls.target.set(0, 0, 0);
      controls.enableRotate = false;
    } else {
      // Isometric 3D Perspective
      camera.position.set(roomWidthM * 1.45, roomHeightM * 1.35, roomLengthM * 1.55);
      controls.target.set(0, roomHeightM * 0.45, 0);
      controls.enableRotate = true;
    }
    controls.update();
  }, [is2DView, roomWidthM, roomLengthM, roomHeightM]);

  // 3. Rebuild Room Geometry & Lighting whenever space or tile changes
  useEffect(() => {
    if (!roomGroupRef.current || !sceneRef.current) return;
    const roomGroup = roomGroupRef.current;

    // Clean previous room meshes & lights
    while (roomGroup.children.length > 0) {
      const obj = roomGroup.children[0];
      roomGroup.remove(obj);
    }

    const halfW = roomWidthM / 2;
    const halfL = roomLengthM / 2;

    // Generate Tile Texture Maps for selected Kohler tile
    // Safely generate tile texture – fallback to a default color if tile data missing
  const tileSku = plan.products.tile?.sku ?? 'DEFAULT_TILE';
  const { diffuse, roughness, normal } = createProceduralTileTexture(tileSku);
    diffuse.repeat.set(roomWidthM * 1.2, roomLengthM * 1.2);
    roughness.repeat.set(roomWidthM * 1.2, roomLengthM * 1.2);
    normal.repeat.set(roomWidthM * 1.2, roomLengthM * 1.2);

    const floorTileMat = new THREE.MeshStandardMaterial({
      map: diffuse,
      roughnessMap: roughness,
      normalMap: normal,
      roughness: 0.35,
      metalness: 0.05
    });

    const wallTileMat = new THREE.MeshStandardMaterial({
      map: diffuse,
      roughnessMap: roughness,
      roughness: 0.45,
      metalness: 0.02
    });

    // Floor Mesh
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidthM, 0.04, roomLengthM),
      floorTileMat
    );
    floor.position.set(0, -0.02, 0);
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Back Wall (-Z)
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidthM, roomHeightM, 0.08),
      wallTileMat
    );
    backWall.position.set(0, roomHeightM / 2, -halfL - 0.04);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Left Wall (-X)
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, roomHeightM, roomLengthM),
      wallTileMat
    );
    leftWall.position.set(-halfW - 0.04, roomHeightM / 2, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Right Wall (+X) with warm wood slat accent for Zen / Luxury
    const isZenOrLuxury = plan.theme.id === 'japanese_zen' || plan.theme.id === 'classic_luxury';
    if (isZenOrLuxury) {
      // Wood slat feature wall behind vanity
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x2b1e15, roughness: 0.6 });
      const slatWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, roomHeightM, roomLengthM * 0.7),
        woodMat
      );
      slatWall.position.set(halfW + 0.03, roomHeightM / 2, -halfL * 0.3);
      slatWall.receiveShadow = true;
      roomGroup.add(slatWall);
    } else {
      const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, roomHeightM, roomLengthM * 0.7),
        wallTileMat
      );
      rightWall.position.set(halfW + 0.04, roomHeightM / 2, -halfL * 0.3);
      rightWall.receiveShadow = true;
      roomGroup.add(rightWall);
    }

    // Architectural Lighting
    // Ambient light tinted by theme
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(plan.theme.ambientLightColor || 0xffeedd),
      1.1
    );
    roomGroup.add(ambientLight);

    // Primary Warm Ceiling Downlight / Spotlight (Spotlights over vanity & shower)
    const mainCeilingSpot = new THREE.SpotLight(0xfff7ed, 4.2, 14, Math.PI / 4, 0.3, 1.2);
    mainCeilingSpot.position.set(0, roomHeightM + 1.2, 0);
    mainCeilingSpot.castShadow = true;
    mainCeilingSpot.shadow.mapSize.width = 2048;
    mainCeilingSpot.shadow.mapSize.height = 2048;
    mainCeilingSpot.shadow.bias = -0.0001;
    roomGroup.add(mainCeilingSpot);

    // Front/Side Fill Light for clear viewing
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(roomWidthM * 1.5, roomHeightM * 1.5, roomLengthM * 1.8);
    roomGroup.add(fillLight);

    // Subtle Floor Pedestal base for 3D showcase presentation
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x070809 });
    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidthM + 0.4, 0.06, roomLengthM + 0.4),
      baseMat
    );
    pedestal.position.set(0, -0.06, 0);
    roomGroup.add(pedestal);

  }, [plan.space, plan.products.tile, plan.theme]);

  // 4. Place and Position Authentic KOHLER Bathroom Fixtures
  useEffect(() => {
    if (!fixturesGroupRef.current) return;
    const fixturesGroup = fixturesGroupRef.current;

    // Remove existing fixtures
    while (fixturesGroup.children.length > 0) {
      const child = fixturesGroup.children[0];
      fixturesGroup.remove(child);
    }

    const halfW = roomWidthM / 2;
    const halfL = roomLengthM / 2;

    // --- A. VANITY & FAUCET & MIRROR (Right Wall) ---
    if (plan.products.vanity) {
      const vanityGroup = Kohler3DModelFactory.createVanity(plan.products.vanity);
      const vanityDepth = plan.products.vanity.dimensions?.depth ? plan.products.vanity.dimensions.depth / 2000 : 0.2;
      vanityGroup.position.set(halfW - vanityDepth - 0.02, 0, -halfL * 0.2);
      vanityGroup.rotation.y = -Math.PI / 2;
      fixturesGroup.add(vanityGroup);

      // Faucet sitting on vanity
      if (plan.products.faucet) {
        const faucetGroup = Kohler3DModelFactory.createFaucet(plan.products.faucet);
        const vanityHeight = plan.products.vanity.dimensions?.height ? (plan.products.vanity.dimensions.height / 1000) * 0.7 : 0.5;
        faucetGroup.position.set(
          halfW - vanityDepth - 0.02,
          0.38 + vanityHeight + 0.045,
          -halfL * 0.2
        );
        faucetGroup.rotation.y = -Math.PI / 2;
        fixturesGroup.add(faucetGroup);
      }

      // Mirror on the wall right above vanity
      if (plan.products.mirror) {
        const mirrorGroup = Kohler3DModelFactory.createMirror(plan.products.mirror);
        mirrorGroup.position.set(halfW - 0.03, 1.55, -halfL * 0.2);
        mirrorGroup.rotation.y = -Math.PI / 2;
        fixturesGroup.add(mirrorGroup);
      }
    }

    // --- B. TOILET (Back Wall, Left Side) ---
    if (plan.products.toilet) {
      const toiletGroup = Kohler3DModelFactory.createToilet(plan.products.toilet);
      const toiletDepth = plan.products.toilet.dimensions?.depth ? plan.products.toilet.dimensions.depth / 2000 : 0.2;
      toiletGroup.position.set(-halfW * 0.55, 0, -halfL + toiletDepth + 0.03);
      toiletGroup.rotation.y = 0; // facing forward (+Z)
      fixturesGroup.add(toiletGroup);
    }

    // --- C. SHOWER ENCLOSURE & RAINHEAD (Back-Right Corner or Left-Middle) ---
    if (plan.products.shower) {
      const showerGroup = Kohler3DModelFactory.createShower(plan.products.shower);
      showerGroup.position.set(0.1, 0, -halfL + 0.1);
      showerGroup.rotation.y = 0;
      fixturesGroup.add(showerGroup);
    }

    // --- D. BATHTUB (If included, placed along front-left or left wall) ---
    if (plan.products.bathtub) {
      const tubGroup = Kohler3DModelFactory.createBathtub(plan.products.bathtub);
      const tubDepth = plan.products.bathtub.dimensions?.depth ? plan.products.bathtub.dimensions.depth / 2000 : 0.2;
      tubGroup.position.set(-halfW + tubDepth + 0.15, 0, halfL * 0.35);
      tubGroup.rotation.y = Math.PI / 2;
      fixturesGroup.add(tubGroup);
    }

    // --- E. ACCESSORIES (Mat in center, Plants / Niche) ---
    (plan.products.accessories || []).forEach((acc) => {
      const accGroup = Kohler3DModelFactory.createAccessory(acc);
      if (acc.id === 'KOH_ACC_001') {
        // Spa Bath Mat in center of floor
        accGroup.position.set(0.1, 0, 0.25);
        accGroup.rotation.y = -Math.PI / 12;
      } else if (acc.id === 'KOH_ACC_002') {
        // Planter in corner
        accGroup.position.set(halfW - 0.25, 0, halfL * 0.45);
      } else if (acc.id === 'KOH_ACC_003') {
        // Wall Niche above toilet on back wall
        accGroup.position.set(-halfW * 0.55, 1.35, -halfL + 0.05);
      }
      fixturesGroup.add(accGroup);
    });

  }, [plan.products, roomWidthM, roomLengthM]);

  return (
    <div className={`relative select-none overflow-hidden bg-[#0c0d0e] ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Controls Tip Overlay (Faithfully matching Reference Image #2) */}
      {!is2DView && (
        <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 text-white/90 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-5 text-xs">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-white/70 animate-spin" style={{ animationDuration: '6s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            <span>Drag to rotate</span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="7" />
              <path d="M12 6v4" />
            </svg>
            <span>Scroll to zoom</span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="5 9 2 12 5 15" />
              <polyline points="9 5 12 2 15 5" />
              <polyline points="15 19 12 22 9 19" />
              <polyline points="19 9 22 12 19 15" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
            <span>Right-click to pan</span>
          </div>
        </div>
      )}
    </div>
  );
};
