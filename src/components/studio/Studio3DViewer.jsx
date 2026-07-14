import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Studio3DViewer({ mode = 'protein', height = 400, className = '' }) {
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

    const group = createStructure(mode);
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
      camera.position.z = Math.max(10, Math.min(60, camera.position.z + e.deltaY * 0.03));
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
  }, [mode, height]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(107,63,160,0.15) 0%, rgba(0,120,80,0.08) 40%, transparent 70%)' }} />
      <div ref={mountRef} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />
    </div>
  );
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
  bonds.forEach(([a, b]) => {
    group.add(createBond(new THREE.Vector3(...atoms[a].pos), new THREE.Vector3(...atoms[b].pos)));
  });
  return group;
}

function createBond(start, end) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
  const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 50 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.lookAt(end);
  mesh.rotateX(Math.PI / 2);
  return mesh;
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