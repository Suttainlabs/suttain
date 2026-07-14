import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ELEMENT_COLORS = {
  H: 0xffffff, C: 0x909090, N: 0x3050f8, O: 0xff0d0d,
  S: 0xffff30, P: 0xff8000, F: 0x90e050, CL: 0x1ff01f,
  BR: 0xa62929, I: 0x940094, FE: 0xe06633, CA: 0x3dff00,
  ZN: 0x7d80b0, MG: 0x8aff00, NA: 0xab5cf2, K: 0x8f40d4,
  B: 0xffb5b5, SI: 0xf0c8a0, SE: 0xffa100, CU: 0xc88033,
  MN: 0x9c7ac7, NI: 0x50d050, CO: 0xf0908c, MO: 0x54b5b5,
};

const ELEMENT_RADII = {
  H: 0.25, C: 0.40, N: 0.40, O: 0.40, S: 0.45, P: 0.45,
  F: 0.30, CL: 0.40, BR: 0.45, I: 0.50, FE: 0.45, CA: 0.45,
  ZN: 0.45, MG: 0.45, NA: 0.40, K: 0.40, B: 0.35, SI: 0.40,
  SE: 0.40, CU: 0.40, MN: 0.40, NI: 0.40, CO: 0.40, MO: 0.45,
};

const COVALENT_RADII = {
  H: 0.31, C: 0.76, N: 0.71, O: 0.66, S: 1.05, P: 1.07,
  F: 0.57, CL: 1.02, BR: 1.20, I: 1.39, FE: 1.32, CA: 1.76,
  ZN: 1.22, MG: 1.41, NA: 1.66, K: 2.03, B: 0.84, SI: 1.11,
  SE: 1.20, CU: 1.32, MN: 1.39, NI: 1.24, CO: 1.26, MO: 1.54,
};

function getColor(element) {
  return ELEMENT_COLORS[element] ?? 0xff1493;
}

function getRadius(element) {
  return ELEMENT_RADII[element] ?? 0.40;
}

function getCovalentRadius(element) {
  return COVALENT_RADII[element] ?? 0.70;
}

export default function Studio3DViewer({ mode = 'protein', height = 400, atoms = null, className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const heightVal = mount.clientHeight || height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / heightVal, 0.1, 1000);
    camera.position.set(0, 0, 25);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return;
    }
    renderer.setSize(width, heightVal);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0x6B3FA0, 0.3);
    fillLight.position.set(-10, -5, -10);
    scene.add(fillLight);

    const group = atoms ? createStructureFromAtoms(atoms) : createStructure(mode);
    scene.add(group);

    let isDragging = false;
    let prevX = 0, prevY = 0;
    let rotX = 0, rotY = 0;
    let autoRotate = true;
    let autoRotateTimer = null;

    const onMouseDown = (e) => {
      isDragging = true; autoRotate = false;
      prevX = e.clientX; prevY = e.clientY;
      if (autoRotateTimer) clearTimeout(autoRotateTimer);
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.008;
      rotX += (e.clientY - prevY) * 0.008;
      prevX = e.clientX; prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
      autoRotateTimer = setTimeout(() => { autoRotate = true; }, 2000);
    };
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(5, Math.min(80, camera.position.z + e.deltaY * 0.03));
    };
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true; autoRotate = false;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
        if (autoRotateTimer) clearTimeout(autoRotateTimer);
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      rotY += (e.touches[0].clientX - prevX) * 0.008;
      rotX += (e.touches[0].clientY - prevY) * 0.008;
      prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
      autoRotateTimer = setTimeout(() => { autoRotate = true; }, 2000);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (autoRotate) rotY += 0.004;
      group.rotation.x = rotX;
      group.rotation.y = rotY;
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      if (autoRotateTimer) clearTimeout(autoRotateTimer);
      if (mount.contains(canvas)) mount.removeChild(canvas);
      group.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [mode, height, atoms]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(107,63,160,0.15) 0%, rgba(0,120,80,0.08) 40%, transparent 70%)' }} />
      <div ref={mountRef} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />
    </div>
  );
}

function createStructureFromAtoms(atomData) {
  let atoms = atomData;
  if (atoms.length > 2000) {
    const ca = atoms.filter(a => a.is_alpha || a.element === 'CA');
    atoms = ca.length > 50 ? ca : atoms.slice(0, 2000);
  }

  let cx = 0, cy = 0, cz = 0;
  for (const a of atoms) {
    cx += a.position[0]; cy += a.position[1]; cz += a.position[2];
  }
  cx /= atoms.length; cy /= atoms.length; cz /= atoms.length;

  let maxDist = 0;
  for (const a of atoms) {
    const dx = a.position[0] - cx, dy = a.position[1] - cy, dz = a.position[2] - cz;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d > maxDist) maxDist = d;
  }
  const scale = maxDist > 0 ? 12 / maxDist : 1;

  const group = new THREE.Group();

  const isBackbone = atoms.length > 200;
  const sphereSegs = isBackbone ? 8 : 16;

  atoms.forEach(atom => {
    const x = (atom.position[0] - cx) * scale;
    const y = (atom.position[1] - cy) * scale;
    const z = (atom.position[2] - cz) * scale;
    const r = Math.max(0.15, getRadius(atom.element) * scale * 0.6);
    const geom = new THREE.SphereGeometry(r, sphereSegs, sphereSegs);
    const mat = new THREE.MeshPhongMaterial({ color: getColor(atom.element), shininess: 80 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
  });

  if (!isBackbone && atoms.length <= 500) {
    const bondMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 40 });
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dx = atoms[i].position[0] - atoms[j].position[0];
        const dy = atoms[i].position[1] - atoms[j].position[1];
        const dz = atoms[i].position[2] - atoms[j].position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const threshold = getCovalentRadius(atoms[i].element) + getCovalentRadius(atoms[j].element) + 0.4;
        if (dist > 0.1 && dist < threshold) {
          const sx = (atoms[i].position[0] - cx) * scale;
          const sy = (atoms[i].position[1] - cy) * scale;
          const sz = (atoms[i].position[2] - cz) * scale;
          const ex = (atoms[j].position[0] - cx) * scale;
          const ey = (atoms[j].position[1] - cy) * scale;
          const ez = (atoms[j].position[2] - cz) * scale;
          group.add(createBondMesh(
            new THREE.Vector3(sx, sy, sz),
            new THREE.Vector3(ex, ey, ez),
            bondMat
          ));
        }
      }
    }
  } else if (isBackbone) {
    const sorted = atoms.slice().sort((a, b) => (a.resSeq || 0) - (b.resSeq || 0));
    const tubeMat = new THREE.MeshPhongMaterial({ color: 0x6B3FA0, shininess: 80 });
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1];
      const ax = (a.position[0] - cx) * scale, ay = (a.position[1] - cy) * scale, az = (a.position[2] - cz) * scale;
      const bx = (b.position[0] - cx) * scale, by = (b.position[1] - cy) * scale, bz = (b.position[2] - cz) * scale;
      const d = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
      if (d < 8) {
        group.add(createBondMesh(new THREE.Vector3(ax, ay, az), new THREE.Vector3(bx, by, bz), tubeMat));
      }
    }
  }

  return group;
}

function createBondMesh(start, end, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  if (length < 0.01) return new THREE.Mesh();
  const geometry = new THREE.CylinderGeometry(0.08, 0.08, length, 6);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.lookAt(end);
  mesh.rotateX(Math.PI / 2);
  return mesh;
}

function createStructure(mode) {
  switch (mode) {
    case 'protein': return createProteinRibbon();
    case 'molecule': return createBallAndStick([0x007850, 0x6B3FA0, 0x00A8C8]);
    case 'crystal': return createCrystalLattice();
    case 'hazard': return createBallAndStick([0xC42B2B, 0xD4900A, 0x6B3FA0]);
    default: return createProteinRibbon();
  }
}

function createProteinRibbon() {
  const group = new THREE.Group();
  group.add(createHelix(-4, 0, 0, 0x007850, 4));
  group.add(createHelix(4, 0, 0, 0x6B3FA0, 4));
  group.add(createStrand(new THREE.Vector3(-4, 6, 0), new THREE.Vector3(4, 6, 0), 0x00A8C8));
  group.add(createStrand(new THREE.Vector3(-4, -6, 0), new THREE.Vector3(4, -6, 0), 0x00A8C8));
  return group;
}

function createHelix(offsetX, offsetY, offsetZ, color, turns) {
  const points = [];
  const radius = 1.2;
  const steps = turns * 20;
  const totalHeight = 12;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const y = (i / steps) * totalHeight - totalHeight / 2;
    points.push(new THREE.Vector3(Math.cos(t) * radius + offsetX, y + offsetY, Math.sin(t) * radius + offsetZ));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 80, 0.25, 8, false);
  const material = new THREE.MeshPhongMaterial({ color, shininess: 80 });
  return new THREE.Mesh(geometry, material);
}

function createStrand(start, end, color) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(0.2, 0.2, length, 8);
  const material = new THREE.MeshPhongMaterial({ color, shininess: 80 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.lookAt(end);
  mesh.rotateX(Math.PI / 2);
  return mesh;
}

function createBallAndStick(colors) {
  const group = new THREE.Group();
  const atoms = [
    { pos: [0, 0, 0], color: colors[0], radius: 0.9 },
    { pos: [2.5, 1, 0.5], color: colors[1], radius: 0.6 },
    { pos: [-2.5, 1, 0.5], color: colors[1], radius: 0.6 },
    { pos: [0, -2.5, 1], color: colors[2], radius: 0.55 },
    { pos: [0, 2.5, 1], color: colors[2], radius: 0.55 },
    { pos: [1.5, 0.5, -2.5], color: colors[0], radius: 0.5 },
    { pos: [-1.5, 0.5, -2.5], color: colors[1], radius: 0.5 },
    { pos: [0, 0, 3], color: colors[2], radius: 0.45 },
  ];
  const bonds = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,7],[2,7]];
  atoms.forEach(atom => {
    const geom = new THREE.SphereGeometry(atom.radius, 24, 24);
    const mat = new THREE.MeshPhongMaterial({ color: atom.color, shininess: 100 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(...atom.pos);
    group.add(mesh);
  });
  const bondMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 50 });
  bonds.forEach(([a, b]) => {
    group.add(createBondMesh(new THREE.Vector3(...atoms[a].pos), new THREE.Vector3(...atoms[b].pos), bondMat));
  });
  return group;
}

function createCrystalLattice() {
  const group = new THREE.Group();
  const spacing = 2.5;
  const size = 1;
  const positions = [];
  for (let x = -size; x <= size; x++) {
    for (let y = -size; y <= size; y++) {
      for (let z = -size; z <= size; z++) {
        const px = x * spacing, py = y * spacing, pz = z * spacing;
        positions.push(new THREE.Vector3(px, py, pz));
        const edgeCount = (Math.abs(x) === size ? 1 : 0) + (Math.abs(y) === size ? 1 : 0) + (Math.abs(z) === size ? 1 : 0);
        const color = edgeCount >= 3 ? 0x6B3FA0 : (edgeCount >= 2 ? 0x00A8C8 : 0x007850);
        const radius = edgeCount >= 3 ? 0.45 : 0.35;
        const geom = new THREE.SphereGeometry(radius, 20, 20);
        const mat = new THREE.MeshPhongMaterial({ color, shininess: 80 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(px, py, pz);
        group.add(mesh);
      }
    }
  }
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00A8C8, transparent: true, opacity: 0.25 });
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[i].distanceTo(positions[j]) <= spacing * 1.1) {
        const geom = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        group.add(new THREE.Line(geom, lineMat));
      }
    }
  }
  return group;
}