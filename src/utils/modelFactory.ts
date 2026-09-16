import * as THREE from 'three';
import { KohlerProduct } from '../types';

/**
 * Creates high-fidelity Three.js 3D fixtures accurately proportioned from Kohler catalogue specifications.
 * Each product has exact dimensions, finishes, and detailing.
 */
export class Kohler3DModelFactory {
  // -----------------------------------------------------------------
  // TOILET (Veil Smart Toilet / Modern Wall-Hung / Stately)
  // -----------------------------------------------------------------
  static createToilet(product: KohlerProduct): THREE.Group {
    const group = new THREE.Group();
    group.name = `TOILET_${product.id}`;

    const width = product.dimensions.width / 1000;
    const depth = product.dimensions.depth / 1000;
    const height = product.dimensions.height / 1000;

    const porcelainMat = new THREE.MeshStandardMaterial({
      color: product.colour.toLowerCase().includes('biscuit') ? 0xede4d3 : 0xfbfbfb,
      roughness: 0.12,
      metalness: 0.05
    });

    if (product.category === 'smart_toilet' || product.sku === 'K-5401') {
      // Veil Intelligent Toilet: sleek curved organic egg-shaped skirted body
      const baseGeo = new THREE.CylinderGeometry(width * 0.48, width * 0.38, height * 0.7, 32);
      baseGeo.scale(1, 1, depth / width);
      const baseMesh = new THREE.Mesh(baseGeo, porcelainMat);
      baseMesh.position.y = height * 0.35;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Ergonomic heated seat ring
      const seatGeo = new THREE.TorusGeometry(width * 0.36, 0.035, 16, 32);
      seatGeo.rotateX(Math.PI / 2);
      seatGeo.scale(1, depth / width * 0.9, 1);
      const seatMesh = new THREE.Mesh(seatGeo, porcelainMat);
      seatMesh.position.set(0, height * 0.72, 0);
      group.add(seatMesh);

      // Flush cover with subtle LED indicator line
      const lidGeo = new THREE.CylinderGeometry(width * 0.44, width * 0.44, 0.025, 32);
      lidGeo.scale(1, 1, depth / width * 0.85);
      const lidMesh = new THREE.Mesh(lidGeo, porcelainMat);
      lidMesh.position.set(0, height * 0.76, 0.02);
      group.add(lidMesh);

      // Nightlight LED glow strip at the back
      const ledGeo = new THREE.CylinderGeometry(0.015, 0.015, width * 0.5, 16);
      ledGeo.rotateZ(Math.PI / 2);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x90e0ef });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(0, height * 0.65, -depth * 0.35);
      group.add(ledMesh);

      // Subtle point light for nightlight
      const nightLight = new THREE.PointLight(0x90e0ef, 0.8, 1.2);
      nightLight.position.set(0, height * 0.6, -depth * 0.3);
      group.add(nightLight);
    } else {
      // Standard One-Piece / Two-Piece Toilet
      const bowlGeo = new THREE.CylinderGeometry(width * 0.45, width * 0.35, height * 0.55, 24);
      bowlGeo.scale(1, 1, depth / width * 0.7);
      const bowlMesh = new THREE.Mesh(bowlGeo, porcelainMat);
      bowlMesh.position.set(0, height * 0.28, depth * 0.1);
      bowlMesh.castShadow = true;
      group.add(bowlMesh);

      // Tank
      const tankGeo = new THREE.BoxGeometry(width * 0.88, height * 0.5, depth * 0.32);
      const tankMesh = new THREE.Mesh(tankGeo, porcelainMat);
      tankMesh.position.set(0, height * 0.68, -depth * 0.28);
      tankMesh.castShadow = true;
      group.add(tankMesh);

      // Chrome / Gold Flush Lever
      const leverMat = new THREE.MeshStandardMaterial({
        color: product.styles.includes('classic_luxury') ? 0xd4af37 : 0xcccccc,
        metalness: 0.9,
        roughness: 0.15
      });
      const leverGeo = new THREE.BoxGeometry(0.04, 0.02, 0.08);
      const leverMesh = new THREE.Mesh(leverGeo, leverMat);
      leverMesh.position.set(width * 0.45, height * 0.85, -depth * 0.28);
      group.add(leverMesh);
    }

    return group;
  }

  // -----------------------------------------------------------------
  // VANITY & INTEGRATED COUNTERTOP
  // -----------------------------------------------------------------
  static createVanity(product: KohlerProduct): THREE.Group {
    const group = new THREE.Group();
    group.name = `VANITY_${product.id}`;

    const width = product.dimensions.width / 1000;
    const depth = product.dimensions.depth / 1000;
    const height = product.dimensions.height / 1000;

    const isWood = product.material.toLowerCase().includes('wood') || product.material.toLowerCase().includes('ash') || product.material.toLowerCase().includes('teak');
    const isDark = product.colour.toLowerCase().includes('charcoal') || product.finish.toLowerCase().includes('black');

    // Wood / Cabinet body material
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: isWood ? 0xc89d6c : (isDark ? 0x242528 : 0xf2ede4),
      roughness: isWood ? 0.45 : 0.25,
      metalness: 0.05
    });

    // Cabinet Box (Wall-mounted floating)
    const cabinetBox = new THREE.Mesh(
      new THREE.BoxGeometry(width, height * 0.7, depth),
      cabinetMat
    );
    // Suspended 0.35m off the floor for the floating wall-hung aesthetic
    const floatElevation = 0.38;
    cabinetBox.position.set(0, floatElevation + (height * 0.7) / 2, 0);
    cabinetBox.castShadow = true;
    cabinetBox.receiveShadow = true;
    group.add(cabinetBox);

    // Subtle horizontal drawer gap line
    const gapMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const gapMesh = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.008, 0.01), gapMat);
    gapMesh.position.set(0, floatElevation + (height * 0.7) / 2, depth / 2 + 0.002);
    group.add(gapMesh);

    // Countertop Slab (Quartz / Stone / Marble)
    const counterMat = new THREE.MeshStandardMaterial({
      color: product.styles.includes('classic_luxury') ? 0xf0ece1 : 0x2d2e30,
      roughness: 0.15,
      metalness: 0.1
    });
    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.02, 0.045, depth + 0.02),
      counterMat
    );
    counterTop.position.set(0, floatElevation + height * 0.7 + 0.022, 0);
    counterTop.castShadow = true;
    group.add(counterTop);

    // Vessel Basin (Vessel Sink sitting elegantly atop counter)
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.05
    });
    const basinGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.12, 32);
    const basinMesh = new THREE.Mesh(basinGeo, basinMat);
    basinMesh.position.set(0, floatElevation + height * 0.7 + 0.045 + 0.06, 0.03);
    basinMesh.castShadow = true;
    group.add(basinMesh);

    // Drain metallic ring inside basin
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });
    const drainMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 16), drainMat);
    drainMesh.position.set(0, floatElevation + height * 0.7 + 0.045 + 0.065, 0.03);
    group.add(drainMesh);

    // Under-vanity atmospheric warm LED glow
    const underGlow = new THREE.PointLight(0xffbe76, 1.2, 1.5);
    underGlow.position.set(0, floatElevation - 0.05, 0);
    group.add(underGlow);

    return group;
  }

  // -----------------------------------------------------------------
  // FAUCET (Parallel / Purist / Artifacts)
  // -----------------------------------------------------------------
  static createFaucet(product: KohlerProduct): THREE.Group {
    const group = new THREE.Group();
    group.name = `FAUCET_${product.id}`;

    const isGold = product.finish.toLowerCase().includes('gold') || product.finish.toLowerCase().includes('brass');
    const isBlack = product.finish.toLowerCase().includes('black');

    const metalMat = new THREE.MeshStandardMaterial({
      color: isGold ? 0xcca43b : (isBlack ? 0x1a1a1a : 0xcccccc),
      metalness: isBlack ? 0.7 : 0.95,
      roughness: isBlack ? 0.35 : 0.15
    });

    const height = (product.dimensions.height || 180) / 1000;

    // Upright Spout Pillar
    const spoutPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.018, height * 0.75, 20),
      metalMat
    );
    spoutPillar.position.set(0, height * 0.375, 0);
    spoutPillar.castShadow = true;
    group.add(spoutPillar);

    // Horizontal Spout Reach
    const spoutReach = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.14, 20),
      metalMat
    );
    spoutReach.rotateX(Math.PI / 2);
    spoutReach.position.set(0, height * 0.72, 0.07);
    spoutReach.castShadow = true;
    group.add(spoutReach);

    // Handle Joystick
    const handleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.07, 16),
      metalMat
    );
    handleMesh.position.set(0.04, height * 0.6, 0);
    handleMesh.rotateZ(-Math.PI / 4);
    group.add(handleMesh);

    return group;
  }

  // -----------------------------------------------------------------
  // SHOWER (Statement Katalyst Rain Shower & Glass Enclosure)
  // -----------------------------------------------------------------
  static createShower(product: KohlerProduct): THREE.Group {
    const group = new THREE.Group();
    group.name = `SHOWER_${product.id}`;

    const isGold = product.finish.toLowerCase().includes('brass') || product.finish.toLowerCase().includes('gold');
    const metalMat = new THREE.MeshStandardMaterial({
      color: isGold ? 0xc49b33 : 0x1e1e1e,
      metalness: isGold ? 0.9 : 0.8,
      roughness: 0.25
    });

    // Vertical Supply Column Arm
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 16), metalMat);
    pipe.position.set(0, 1.6, -0.05);
    pipe.castShadow = true;
    group.add(pipe);

    // Horizontal Rainhead Arm extending out
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 16), metalMat);
    arm.rotateX(Math.PI / 2);
    arm.position.set(0, 2.18, 0.18);
    arm.castShadow = true;
    group.add(arm);

    // Statement 10" Round Katalyst Showerhead
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.025, 32), metalMat);
    head.position.set(0, 2.15, 0.38);
    head.castShadow = true;
    group.add(head);

    // Handshower on side dock
    const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 16), metalMat);
    wand.position.set(0.15, 1.3, -0.02);
    group.add(wand);

    // Levity Frameless Crystal Glass Enclosure Panel
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.01
    });

    const glassPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 2.1, 0.95),
      glassMat
    );
    glassPanel.position.set(0.5, 1.05, 0.45);
    glassPanel.castShadow = true;
    group.add(glassPanel);

    // Matte Black / Chrome Glass Clamps
    const clampGeo = new THREE.BoxGeometry(0.03, 0.06, 0.04);
    const clamp1 = new THREE.Mesh(clampGeo, metalMat);
    clamp1.position.set(0.5, 0.1, 0.45);
    group.add(clamp1);
    const clamp2 = new THREE.Mesh(clampGeo, metalMat);
    clamp2.position.set(0.5, 2.0, 0.45);
    group.add(clamp2);

    return group;
  }

  // -----------------------------------------------------------------
  // BATHTUB (Freestanding Ciel Oval / Vintage Soaking Bath)
  // -----------------------------------------------------------------
  static createBathtub(product: KohlerProduct): THREE.Group {
    const group = new THREE.Group();
    group.name = `BATHTUB_${product.id}`;

    const width = product.dimensions.width / 1000;
    const depth = product.dimensions.depth / 1000;
    const height = product.dimensions.height / 1000;

    const tubMat = new THREE.MeshStandardMaterial({
      color: 0xfbfbfb,
      roughness: 0.15,
      metalness: 0.05
    });

    // Sculptural Oval Freestanding Body
    const outerGeo = new THREE.CylinderGeometry(width * 0.48, width * 0.38, height, 36);
    outerGeo.scale(1, 1, depth / width);
    const outerTub = new THREE.Mesh(outerGeo, tubMat);
    outerTub.position.set(0, height / 2, 0);
    outerTub.castShadow = true;
    outerTub.receiveShadow = true;
    group.add(outerTub);

    // Water surface inside tub
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x64b5f6,
      transmission: 0.85,
      roughness: 0.1,
      ior: 1.333,
      transparent: true,
      opacity: 0.8
    });
    const waterGeo = new THREE.CylinderGeometry(width * 0.44, width * 0.44, 0.01, 32);
    waterGeo.scale(1, 1, depth / width * 0.9);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, height * 0.82, 0);
    group.add(waterMesh);

    return group;
  }

  // -----------------------------------------------------------------
  // MIRROR (Illuminate Circular Halo / Verdera Rectangular)
  // -----------------------------------------------------------------
  static createMirror(product: KohlerProduct): THREE.Group {
    const group = new THREE.Group();
    group.name = `MIRROR_${product.id}`;

    const width = product.dimensions.width / 1000;
    const height = product.dimensions.height / 1000;

    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.98,
      roughness: 0.02
    });

    const isCircular = product.sku === 'K-78258' || product.name.toLowerCase().includes('circular');

    if (isCircular) {
      // Circular Mirror Disk
      const radius = width / 2;
      const diskGeo = new THREE.CylinderGeometry(radius, radius, 0.02, 48);
      diskGeo.rotateX(Math.PI / 2);
      const mirrorMesh = new THREE.Mesh(diskGeo, mirrorMat);
      mirrorMesh.castShadow = false;
      group.add(mirrorMesh);

      // Backlit Halo Glow Ring
      const haloGeo = new THREE.TorusGeometry(radius + 0.02, 0.02, 16, 48);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xffdb99 });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.z = -0.012;
      group.add(haloMesh);

      // Warm Ambient PointLight projecting from behind the mirror onto the wall
      const haloLight = new THREE.PointLight(0xffbe76, 2.2, 2.5);
      haloLight.position.set(0, 0, -0.05);
      group.add(haloLight);
    } else {
      // Rectangular Mirror
      const rectGeo = new THREE.BoxGeometry(width, height, 0.02);
      const mirrorMesh = new THREE.Mesh(rectGeo, mirrorMat);
      group.add(mirrorMesh);

      // Linear perimeter frame with LED strips
      const frameMat = new THREE.MeshBasicMaterial({ color: 0xfff0d4 });
      const topStrip = new THREE.Mesh(new THREE.BoxGeometry(width, 0.02, 0.01), frameMat);
      topStrip.position.set(0, height / 2, 0.01);
      group.add(topStrip);
      const botStrip = new THREE.Mesh(new THREE.BoxGeometry(width, 0.02, 0.01), frameMat);
      botStrip.position.set(0, -height / 2, 0.01);
      group.add(botStrip);

      const haloLight = new THREE.PointLight(0xffbe76, 1.8, 2.0);
      haloLight.position.set(0, 0, -0.05);
      group.add(haloLight);
    }

    return group;
  }

  // -----------------------------------------------------------------
  // ACCESSORIES (Mat, Recessed Niche, Planter)
  // -----------------------------------------------------------------
  static createAccessory(product: KohlerProduct): THREE.Group {
    const group = new THREE.Group();
    group.name = `ACC_${product.id}`;

    if (product.id === 'KOH_ACC_001') {
      // Woven Spa Bath Mat
      const matMat = new THREE.MeshStandardMaterial({
        color: 0xcbb79b,
        roughness: 0.95
      });
      const matMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.015, 0.6), matMat);
      matMesh.position.y = 0.008;
      matMesh.receiveShadow = true;
      group.add(matMesh);
    } else if (product.id === 'KOH_ACC_002') {
      // Planter
      const potMat = new THREE.MeshStandardMaterial({ color: 0x3d312a, roughness: 0.8 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.28, 20), potMat);
      pot.position.y = 0.14;
      pot.castShadow = true;
      group.add(pot);

      // Greenery foliage
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x2d4a22, roughness: 0.6 });
      const leafCluster = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), plantMat);
      leafCluster.position.y = 0.38;
      leafCluster.castShadow = true;
      group.add(leafCluster);
    } else {
      // Recessed Wall Niche with amber light
      const nicheMat = new THREE.MeshStandardMaterial({ color: 0x4a433e, roughness: 0.7 });
      const niche = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.1), nicheMat);
      group.add(niche);

      const nicheLight = new THREE.PointLight(0xffa94d, 1.0, 0.8);
      nicheLight.position.set(0, 0.1, 0.05);
      group.add(nicheLight);
    }

    return group;
  }
}
