import * as THREE from 'three';

/**
 * Creates dynamic high-resolution tile textures procedurally using HTML Canvas.
 * Generates realistic diffuse, normal, and roughness maps for Stone, Marble, Concrete, and Fluted tiles.
 */
export function createProceduralTileTexture(tileSku: string): {
  diffuse: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
  normal: THREE.CanvasTexture;
} {
  const canvasSize = 1024;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = canvasSize;
  dCanvas.height = canvasSize;
  const dCtx = dCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = canvasSize;
  rCanvas.height = canvasSize;
  const rCtx = rCanvas.getContext('2d')!;

  const nCanvas = document.createElement('canvas');
  nCanvas.width = canvasSize;
  nCanvas.height = canvasSize;
  const nCtx = nCanvas.getContext('2d')!;

  if (tileSku === 'K-TILE-103') {
    // -------------------------------------------------------------
    // Japanese Stone Look Tile (Natural Limestone / Honed Sandstone)
    // -------------------------------------------------------------
    dCtx.fillStyle = '#b8a99a';
    dCtx.fillRect(0, 0, canvasSize, canvasSize);

    // Fine mineral speckles and noise
    const imgData = dCtx.getImageData(0, 0, canvasSize, canvasSize);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 26;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    dCtx.putImageData(imgData, 0, 0);

    // Subtle large grid grout lines (600x600 mm format)
    dCtx.strokeStyle = 'rgba(120, 105, 95, 0.45)';
    dCtx.lineWidth = 3;
    const step = canvasSize / 2;
    for (let x = 0; x <= canvasSize; x += step) {
      dCtx.beginPath();
      dCtx.moveTo(x, 0);
      dCtx.lineTo(x, canvasSize);
      dCtx.stroke();
    }
    for (let y = 0; y <= canvasSize; y += step) {
      dCtx.beginPath();
      dCtx.moveTo(0, y);
      dCtx.lineTo(canvasSize, y);
      dCtx.stroke();
    }

    // Roughness: Honed stone (matte with slight sheen)
    rCtx.fillStyle = '#888888';
    rCtx.fillRect(0, 0, canvasSize, canvasSize);

  } else if (tileSku === 'K-TILE-205') {
    // -------------------------------------------------------------
    // Carrara Venato Polished Marble Porcelain
    // -------------------------------------------------------------
    dCtx.fillStyle = '#f5f5f7';
    dCtx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw delicate organic grey/gold marble veins
    dCtx.strokeStyle = 'rgba(160, 160, 170, 0.35)';
    dCtx.lineWidth = 2.5;
    for (let v = 0; v < 7; v++) {
      dCtx.beginPath();
      let x = Math.random() * canvasSize;
      let y = 0;
      dCtx.moveTo(x, y);
      while (y < canvasSize) {
        x += (Math.random() - 0.45) * 60;
        y += Math.random() * 40 + 20;
        dCtx.lineTo(x, y);
      }
      dCtx.stroke();
    }

    // Secondary finer veins
    dCtx.strokeStyle = 'rgba(190, 175, 150, 0.25)';
    dCtx.lineWidth = 1.2;
    for (let v = 0; v < 5; v++) {
      dCtx.beginPath();
      let x = 0;
      let y = Math.random() * canvasSize;
      dCtx.moveTo(x, y);
      while (x < canvasSize) {
        x += Math.random() * 40 + 20;
        y += (Math.random() - 0.5) * 50;
        dCtx.lineTo(x, y);
      }
      dCtx.stroke();
    }

    // Polished glaze roughness (very smooth)
    rCtx.fillStyle = '#2b2b2b';
    rCtx.fillRect(0, 0, canvasSize, canvasSize);

  } else if (tileSku === 'K-TILE-310') {
    // -------------------------------------------------------------
    // Architectural Concrete Matte Grey Tile
    // -------------------------------------------------------------
    dCtx.fillStyle = '#7a7d82';
    dCtx.fillRect(0, 0, canvasSize, canvasSize);

    // Subtle trowel marks
    for (let i = 0; i < 30; i++) {
      dCtx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      dCtx.beginPath();
      dCtx.ellipse(Math.random() * canvasSize, Math.random() * canvasSize, 120, 30, Math.random() * Math.PI, 0, Math.PI * 2);
      dCtx.fill();
    }

    // Grid joints
    dCtx.strokeStyle = 'rgba(50, 52, 56, 0.6)';
    dCtx.lineWidth = 2.5;
    const step = canvasSize / 2;
    for (let x = 0; x <= canvasSize; x += step) {
      dCtx.strokeRect(x, 0, 1, canvasSize);
    }
    for (let y = 0; y <= canvasSize; y += step) {
      dCtx.strokeRect(0, y, canvasSize, 1);
    }

    rCtx.fillStyle = '#999999';
    rCtx.fillRect(0, 0, canvasSize, canvasSize);

  } else {
    // -------------------------------------------------------------
    // Fluted Basalt / Textured Dark Tile
    // -------------------------------------------------------------
    dCtx.fillStyle = '#242528';
    dCtx.fillRect(0, 0, canvasSize, canvasSize);

    // Fluted vertical ribs
    const ribWidth = 24;
    for (let x = 0; x < canvasSize; x += ribWidth) {
      dCtx.fillStyle = (x / ribWidth) % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)';
      dCtx.fillRect(x, 0, ribWidth, canvasSize);
    }

    rCtx.fillStyle = '#666666';
    rCtx.fillRect(0, 0, canvasSize, canvasSize);
  }

  // Normal map generation (subtle neutral blue base)
  nCtx.fillStyle = '#8080ff';
  nCtx.fillRect(0, 0, canvasSize, canvasSize);

  const diffuseTex = new THREE.CanvasTexture(dCanvas);
  diffuseTex.wrapS = THREE.RepeatWrapping;
  diffuseTex.wrapT = THREE.RepeatWrapping;

  const roughnessTex = new THREE.CanvasTexture(rCanvas);
  roughnessTex.wrapS = THREE.RepeatWrapping;
  roughnessTex.wrapT = THREE.RepeatWrapping;

  const normalTex = new THREE.CanvasTexture(nCanvas);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;

  return { diffuse: diffuseTex, roughness: roughnessTex, normal: normalTex };
}
