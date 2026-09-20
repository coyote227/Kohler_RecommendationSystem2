import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DesignPlan, KohlerProduct } from '../types';
import { Kohler3DModelFactory } from '../utils/modelFactory';

interface ViewerProps {
  plan: DesignPlan;
  is2DView: boolean;
  tilePattern?: string;
  onSelectProduct: (product: KohlerProduct) => void;
}

export const BathroomViewer3D: React.FC<ViewerProps> = ({
  plan,
  is2DView,
  tilePattern = plan.theme.tilePattern,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const accentLightRef = useRef<THREE.PointLight | null>(null);
  const proceduralRoomRef = useRef<THREE.Group | null>(null);

  // 1. INITIALIZE CANVAS ENVIRONMENT ON MOUNT
  useEffect(() => {
    if (!containerRef.current) return;

    // --- Persistent Three.js core objects ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');
    sceneRef.current = scene;

    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 1000);
    camera.position.set(4.2, 2.6, 4.6);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight(plan.theme.ambientLightColor, 1.1);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;
    const hemisphereLight = new THREE.HemisphereLight('#fff8ed', '#24201c', 1.2);
    scene.add(hemisphereLight);
    const directionalLight = new THREE.DirectionalLight('#fff1d6', 2.2);
    directionalLight.position.set(3, 7, 4);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    scene.add(directionalLight);
    const ceilingLight = new THREE.PointLight(plan.theme.accentLightColor, 7, 10, 2);
    ceilingLight.position.set(0, 3.2, 0.5);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);
    accentLightRef.current = ceilingLight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 1.2, 0);
    controls.update();
    controls.addEventListener('start', () => {
      renderer.domElement.style.cursor = 'grabbing';
    });
    controls.addEventListener('end', () => {
      renderer.domElement.style.cursor = 'grab';
    });

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
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      controls.dispose();
      controlsRef.current = null;
      renderer.dispose();
    };
  }, []);

  // 2. RUN RE-RENDER LIFECYCLE TARGETS WHEN CONTENT SWAPS
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;
    if (ambientLightRef.current) ambientLightRef.current.color.set(plan.theme.ambientLightColor);
    if (accentLightRef.current) accentLightRef.current.color.set(plan.theme.accentLightColor);

    // --- Cleanup old slot meshes to avoid memory leaks ---
    if (proceduralRoomRef.current) {
      scene.remove(proceduralRoomRef.current);
      proceduralRoomRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(material => material.dispose());
          else child.material.dispose();
        }
      });
    }
    const roomGroup = new THREE.Group();
    roomGroup.name = 'procedural_bathroom';
    proceduralRoomRef.current = roomGroup;
    scene.add(roomGroup);

    const products = plan.products;
    const roomLength = plan.space.length;
    const roomWidth = plan.space.width;
    const roomHeight = plan.space.height;
    const backWallZ = -roomWidth / 2;
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    const toiletWidth = products.toilet.dimensions.width / 1000;
    const toiletDepth = products.toilet.dimensions.depth / 1000;
    const toiletScale = clamp((roomWidth * 0.3) / toiletWidth, 0.78, 1);
    const toiletX = clamp(roomLength * 0.27, toiletWidth / 2 + 0.18, roomLength - toiletWidth / 2 - 0.18);
    const toiletZ = backWallZ + toiletDepth / 2 + 0.12;
    const vanityDepth = products.vanity.dimensions.depth / 1000;
    const vanityX = clamp(-roomLength * 0.24, -roomLength / 2 + 0.55, roomLength / 2 - 0.55);
    const vanityZ = backWallZ + vanityDepth / 2 + 0.08;
    const toiletModel = Kohler3DModelFactory.createToilet(products.toilet);
    toiletModel.scale.setScalar(toiletScale);
    const fixtures: Array<[THREE.Group, THREE.Vector3]> = [
      [toiletModel, new THREE.Vector3(toiletX, 0, toiletZ)],
      [Kohler3DModelFactory.createVanity(products.vanity), new THREE.Vector3(vanityX, 0, vanityZ)],
      [Kohler3DModelFactory.createFaucet(products.faucet), new THREE.Vector3(vanityX, 1.05, vanityZ)],
      [Kohler3DModelFactory.createMirror(products.mirror), new THREE.Vector3(vanityX, clamp(roomHeight * 0.7, 1.35, 1.8), backWallZ + 0.04)],
    ];
    const shower = Kohler3DModelFactory.createShower(products.shower);
    shower.scale.setScalar(clamp((roomHeight - 0.12) / 2.1, 0.72, 1));
      shower.rotation.y = -Math.PI / 2;
    fixtures.push([shower, new THREE.Vector3(roomLength / 2 - 0.08, 0, roomWidth * 0.18)]);
    if (products.bathtub) {
      const tub = Kohler3DModelFactory.createBathtub(products.bathtub);
      const tubWidth = products.bathtub.dimensions.width / 1000;
      const tubScale = clamp((roomLength * 0.45) / tubWidth, 0.7, 1);
      const tubDepth = (products.bathtub.dimensions.depth / 1000) * tubScale;
      tub.scale.setScalar(tubScale);
      const tubX = clamp(roomLength / 2 - tubDepth / 2 - 0.18, -roomLength / 2 + tubDepth / 2 + 0.12, roomLength / 2 - tubDepth / 2 - 0.12);
      const tubZ = clamp(roomWidth * 0.18 + 0.62, -roomWidth / 2 + tubWidth * tubScale / 2 + 0.12, roomWidth / 2 - tubWidth * tubScale / 2 - 0.12);
      fixtures.push([tub, new THREE.Vector3(tubX, 0, tubZ)]);
    }
    products.accessories.forEach((product) => {
      const accessoryPosition = product.id === 'KOH_ACC_002'
        ? new THREE.Vector3(clamp(toiletX + toiletWidth / 2 + 0.2, 0.2, roomLength / 2 - 0.2), 0, toiletZ)
        : product.id === 'KOH_ACC_001'
          ? new THREE.Vector3(vanityX, 0, vanityZ + 0.42)
          : new THREE.Vector3(roomLength / 2 - 0.18, roomHeight * 0.58, backWallZ + 0.08);
      fixtures.push([Kohler3DModelFactory.createAccessory(product), accessoryPosition]);
    });
    fixtures.forEach(([fixture, position]) => {
      fixture.position.copy(position);
      fixture.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      roomGroup.add(fixture);
    });

    if (is2DView) {
      camera.position.set(0, Math.max(roomLength, roomWidth) * 1.35, 0.01);
      camera.lookAt(0, 0, 0);
      controlsRef.current?.target.set(0, 0, 0);
    } else {
      camera.position.set(4.2, 2.6, 4.6);
      camera.lookAt(0, 1.2, 0);
      controlsRef.current?.target.set(0, 1.2, 0);
    }
    controlsRef.current?.update();
    const oldRoomObjects = ['floor_plane', 'back_wall', 'left_wall', 'right_wall'];
    oldRoomObjects.forEach((name) => {
      const roomObject = scene.getObjectByName(name);
      if (!roomObject) return;
      roomObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(material => material.dispose());
          else child.material.dispose();
        }
      });
      scene.remove(roomObject);
    });

    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 512;
    tileCanvas.height = 512;
    const tileContext = tileCanvas.getContext('2d');
    if (!tileContext) return;
    const themeStyles: Record<string, { base: string; grout: string }> = {
      japanese_zen: { base: '#8b735b', grout: '#d6c4aa' },
      minimalist_modern: { base: '#b9bdbe', grout: '#f3f4f4' },
      classic_luxury: { base: '#d5c6b3', grout: '#fff7e8' },
      contemporary: { base: '#4d5558', grout: '#aeb8ba' },
    };
    const tileStyle = themeStyles[plan.theme.id] ?? themeStyles.japanese_zen;
    tileContext.fillStyle = tileStyle.base;
    tileContext.fillRect(0, 0, 512, 512);
    tileContext.strokeStyle = tileStyle.grout;
    tileContext.lineWidth = 4;
    const tileStep = tilePattern.includes('1200') ? 256 : tilePattern.includes('600') ? 128 : tilePattern.includes('400') ? 96 : 64;
    if (tilePattern === 'Hex Mosaic') {
      for (let row = -1; row < 8; row += 1) {
        for (let column = -1; column < 8; column += 1) {
          const x = column * 72 + (row % 2) * 36;
          const y = row * 62;
          tileContext.beginPath();
          for (let side = 0; side < 6; side += 1) {
            const angle = Math.PI / 3 * side;
            const pointX = x + Math.cos(angle) * 32;
            const pointY = y + Math.sin(angle) * 32;
            if (side === 0) tileContext.moveTo(pointX, pointY);
            else tileContext.lineTo(pointX, pointY);
          }
          tileContext.closePath();
          tileContext.stroke();
        }
      }
    } else if (tilePattern.includes('Herringbone')) {
      for (let offset = -512; offset < 1024; offset += tileStep) {
        tileContext.beginPath();
        tileContext.moveTo(offset, 0);
        tileContext.lineTo(offset + 512, 512);
        tileContext.stroke();
        tileContext.beginPath();
        tileContext.moveTo(offset, 512);
        tileContext.lineTo(offset + 512, 0);
        tileContext.stroke();
      }
    } else if (tilePattern === 'Terrazzo Small Format') {
      for (let offset = 0; offset <= 512; offset += tileStep) {
        tileContext.beginPath(); tileContext.moveTo(offset, 0); tileContext.lineTo(offset, 512); tileContext.stroke();
        tileContext.beginPath(); tileContext.moveTo(0, offset); tileContext.lineTo(512, offset); tileContext.stroke();
      }
      tileContext.fillStyle = tileStyle.grout;
      for (let index = 0; index < 42; index += 1) {
        tileContext.beginPath();
        tileContext.arc((index * 83) % 512, (index * 137) % 512, 3 + (index % 4), 0, Math.PI * 2);
        tileContext.fill();
      }
    } else {
      for (let offset = 0; offset <= 512; offset += tileStep) {
        tileContext.beginPath();
        tileContext.moveTo(offset, 0);
        tileContext.lineTo(offset, 512);
        tileContext.stroke();
        tileContext.beginPath();
        tileContext.moveTo(0, offset);
        tileContext.lineTo(512, offset);
        tileContext.stroke();
      }
    }
    const tileTexture = new THREE.CanvasTexture(tileCanvas);
    tileTexture.wrapS = THREE.RepeatWrapping;
    tileTexture.wrapT = THREE.RepeatWrapping;
    const repeat = tilePattern.includes('1200') ? 2 : tilePattern.includes('600') ? 4 : tilePattern === 'Hex Mosaic' ? 5 : 6;
    tileTexture.repeat.set(repeat, repeat);
    tileTexture.colorSpace = THREE.SRGBColorSpace;

    const tileMaterial = new THREE.MeshStandardMaterial({
      map: tileTexture,
      roughness: 0.48,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const createSurface = (
      name: string,
      geometry: THREE.PlaneGeometry,
      position: THREE.Vector3,
      rotation: THREE.Euler,
    ) => {
      const surface = new THREE.Mesh(geometry, tileMaterial.clone());
      surface.receiveShadow = true;
      surface.name = name;
      surface.position.copy(position);
      surface.rotation.copy(rotation);
      roomGroup.add(surface);
    };

    const createWallBox = (name: string, size: THREE.Vector3, position: THREE.Vector3) => {
      const wallMaterial = tileMaterial.clone();
      wallMaterial.transparent = true;
      wallMaterial.opacity = 0.28;
      wallMaterial.depthWrite = false;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), wallMaterial);
      wall.name = name;
      wall.position.copy(position);
      wall.receiveShadow = true;
      roomGroup.add(wall);
    };

    createSurface(
      'floor_plane',
      new THREE.PlaneGeometry(roomLength, roomWidth),
      new THREE.Vector3(0, 0, 0),
      new THREE.Euler(-Math.PI / 2, 0, 0),
    );
    createWallBox('back_wall', new THREE.Vector3(roomLength, roomHeight, 0.08), new THREE.Vector3(0, roomHeight / 2, -roomWidth / 2));
    createWallBox('right_wall', new THREE.Vector3(0.08, roomHeight, roomWidth), new THREE.Vector3(roomLength / 2, roomHeight / 2, 0));
    const doorWidth = 0.95;
    const doorCenter = 0.35;
    const wallBeforeDoor = doorCenter - doorWidth / 2 + roomWidth / 2;
    const wallAfterDoor = roomWidth - wallBeforeDoor - doorWidth;
    createWallBox(
      'left_wall_front',
      new THREE.Vector3(0.08, roomHeight, wallBeforeDoor),
      new THREE.Vector3(-roomLength / 2, roomHeight / 2, -roomWidth / 2 + wallBeforeDoor / 2),
    );
    createWallBox(
      'left_wall_back',
      new THREE.Vector3(0.08, roomHeight, wallAfterDoor),
      new THREE.Vector3(-roomLength / 2, roomHeight / 2, roomWidth / 2 - wallAfterDoor / 2),
    );
    const doorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9fb8bd,
      roughness: 0.12,
      metalness: 0.05,
      transmission: 0.35,
      transparent: true,
      opacity: 0.62,
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, roomHeight * 0.82, doorWidth), doorMaterial);
    door.position.set(-roomLength / 2 + 0.04, roomHeight * 0.41, doorCenter);
    door.castShadow = true;
    roomGroup.add(door);
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, roomHeight * 0.9, doorWidth + 0.02), new THREE.MeshStandardMaterial({ color: 0x171412, roughness: 0.4 }));
    doorFrame.position.set(-roomLength / 2 + 0.02, roomHeight * 0.45, doorCenter);
    roomGroup.add(doorFrame);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 12), new THREE.MeshStandardMaterial({ color: 0xc89d6c, metalness: 0.9, roughness: 0.18 }));
    knob.position.set(-roomLength / 2 - 0.03, roomHeight * 0.41, doorCenter - 0.22);
    roomGroup.add(knob);
    console.info('[3D] Room surfaces created', {
      objects: ['floor_plane', 'back_wall', 'left_wall', 'right_wall'],
      size: [roomLength, roomWidth, roomHeight],
      camera: camera.position.toArray().map(value => Number(value.toFixed(2))),
      target: [0, 1.2, 0],
    });

    // Ensure camera clipping planes encompass the scaled scene
    camera.near = 0.1;
    camera.far = 2000;
    camera.updateProjectionMatrix();

  }, [plan, is2DView, tilePattern]);

  return (
    <div
        className="bathroom-3d-viewer"
        ref={containerRef}
        style={{ width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
  );
};
