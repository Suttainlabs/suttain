import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

// ── helpers ──────────────────────────────────────────────────────────────────

function buildAtomMesh(atomType, position) {
  const geo = new THREE.SphereGeometry(atomType.radius * 0.35, 16, 12);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(atomType.color),
    roughness: 0.3,
    metalness: 0.2,
    emissive: new THREE.Color(atomType.color),
    emissiveIntensity: 0.08,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  mesh.castShadow = true;
  return mesh;
}

function buildBondMesh(p1, p2) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const geo = new THREE.CylinderGeometry(0.04, 0.04, len, 8);
  const mat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize()
  );
  return mesh;
}

// ── component ─────────────────────────────────────────────────────────────────

const SandboxCanvas = forwardRef(function SandboxCanvas(
  { gridSize, atoms, onPlaceAtom, onSelectAtom, selectedAtomType, isRunning, forceType, temperature },
  ref
) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const atomMeshesRef = useRef({}); // id → mesh
  const bondMeshesRef = useRef([]);
  const gridHelperRef = useRef(null);
  const gridPlaneRef = useRef(null);
  const velocitiesRef = useRef({}); // id → THREE.Vector3
  const orbitRef = useRef({ active: false, lastX: 0, lastY: 0, theta: 0.6, phi: 1.0, radius: gridSize * 1.4 });
  const stepRef = useRef(0);

  // Expose step count via ref
  useImperativeHandle(ref, () => ({
    getStep: () => stepRef.current,
  }));

  // ── Scene init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x0f172a);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f172a, 30, 80);
    sceneRef.current = scene;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    scene.add(dir);
    const pt = new THREE.PointLight(0x7c3aed, 0.8, 50);
    pt.position.set(-5, 8, -5);
    scene.add(pt);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    cameraRef.current = camera;

    // Resize
    const onResize = () => {
      const rw = mount.clientWidth;
      const rh = mount.clientHeight;
      renderer.setSize(rw, rh);
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Render loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // ── Grid rebuild ─────────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old grid
    if (gridHelperRef.current) scene.remove(gridHelperRef.current);
    if (gridPlaneRef.current) scene.remove(gridPlaneRef.current);

    const half = gridSize / 2;

    // Grid helper
    const gh = new THREE.GridHelper(gridSize, gridSize, 0x334155, 0x1e293b);
    gh.position.y = -0.01;
    scene.add(gh);
    gridHelperRef.current = gh;

    // Invisible click plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.name = "grid_plane";
    scene.add(plane);
    gridPlaneRef.current = plane;

    // Update orbit radius
    orbitRef.current.radius = gridSize * 1.4;
    updateCamera();
  }, [gridSize]);

  // ── Camera orbit helpers ─────────────────────────────────────────────────
  const updateCamera = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { theta, phi, radius } = orbitRef.current;
    camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(0, 0, 0);
  }, []);

  // ── Mouse events ─────────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    const renderer = rendererRef.current;
    if (!mount || !renderer) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getMouseNDC = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e) => {
      if (e.button === 2 || e.button === 1) {
        orbitRef.current.active = true;
        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;
        return;
      }
      // Left click: place atom or select
      getMouseNDC(e);
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Check atom meshes first
      const meshes = Object.values(atomMeshesRef.current);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        const hit = hits[0].object;
        const atomId = Object.keys(atomMeshesRef.current).find(id => atomMeshesRef.current[id] === hit);
        if (atomId && onSelectAtom) onSelectAtom(atomId);
        return;
      }

      // Check grid plane
      if (gridPlaneRef.current) {
        const planeHits = raycaster.intersectObject(gridPlaneRef.current);
        if (planeHits.length > 0 && onPlaceAtom) {
          const pt = planeHits[0].point;
          const half = gridSize / 2;
          // Snap to grid
          const x = Math.round(Math.max(-half + 0.5, Math.min(half - 0.5, pt.x)));
          const z = Math.round(Math.max(-half + 0.5, Math.min(half - 0.5, pt.z)));
          onPlaceAtom(new THREE.Vector3(x, 0, z));
        }
      }
    };

    const onPointerMove = (e) => {
      if (!orbitRef.current.active) return;
      const dx = e.clientX - orbitRef.current.lastX;
      const dy = e.clientY - orbitRef.current.lastY;
      orbitRef.current.theta -= dx * 0.008;
      orbitRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + dy * 0.008));
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
      updateCamera();
    };

    const onPointerUp = () => { orbitRef.current.active = false; };

    const onWheel = (e) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(3, Math.min(50, orbitRef.current.radius + e.deltaY * 0.02));
      updateCamera();
    };

    const onContextMenu = (e) => e.preventDefault();

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("wheel", onWheel, { passive: false });
    mount.addEventListener("contextmenu", onContextMenu);

    return () => {
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("contextmenu", onContextMenu);
    };
  }, [gridSize, onPlaceAtom, onSelectAtom, updateCamera]);

  // ── Sync atom meshes ─────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentIds = new Set(atoms.map(a => a.id));

    // Remove stale meshes
    Object.keys(atomMeshesRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        scene.remove(atomMeshesRef.current[id]);
        atomMeshesRef.current[id].geometry.dispose();
        delete atomMeshesRef.current[id];
        delete velocitiesRef.current[id];
      }
    });

    // Add new meshes
    atoms.forEach(atom => {
      if (!atomMeshesRef.current[atom.id]) {
        const mesh = buildAtomMesh(atom.type, atom.position);
        scene.add(mesh);
        atomMeshesRef.current[atom.id] = mesh;
        velocitiesRef.current[atom.id] = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          0,
          (Math.random() - 0.5) * 0.01
        );
      } else {
        // Update position from state (when not simulating)
        if (!isRunning) {
          atomMeshesRef.current[atom.id].position.copy(atom.position);
        }
      }
    });

    rebuildBonds();
  }, [atoms]);

  // ── Simulation loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    const TIMESTEP = 0.016;
    const half = gridSize / 2 - 0.5;

    const interval = setInterval(() => {
      stepRef.current += 1;
      const meshes = atomMeshesRef.current;
      const ids = Object.keys(meshes);
      if (ids.length < 2) return;

      // Build forces
      const forces = {};
      ids.forEach(id => { forces[id] = new THREE.Vector3(); });

      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const idA = ids[i], idB = ids[j];
          const posA = meshes[idA].position;
          const posB = meshes[idB].position;
          const diff = new THREE.Vector3().subVectors(posA, posB);
          const dist = Math.max(diff.length(), 0.5);
          const dir = diff.clone().normalize();

          let fMag = 0;
          if (forceType === "lj") {
            // Simplified Lennard-Jones
            const sig = 1.0;
            const eps = 0.05;
            const r6 = Math.pow(sig / dist, 6);
            fMag = 24 * eps * (2 * r6 * r6 - r6) / dist;
          } else if (forceType === "coulomb") {
            const atomA = atoms.find(a => a.id === idA);
            const atomB = atoms.find(a => a.id === idB);
            const q = (atomA?.type?.charge || 0) * (atomB?.type?.charge || 0);
            fMag = q === 0 ? 0 : (q * 0.5) / (dist * dist);
          } else if (forceType === "gravity") {
            const atomA = atoms.find(a => a.id === idA);
            const atomB = atoms.find(a => a.id === idB);
            const mA = atomA?.type?.mass || 1;
            const mB = atomB?.type?.mass || 1;
            fMag = -(mA * mB * 0.002) / (dist * dist);
          }

          const fVec = dir.clone().multiplyScalar(fMag);
          forces[idA].add(fVec);
          forces[idB].sub(fVec);
        }
      }

      // Integrate velocities & positions
      const kbT = (temperature / 1000) * 0.005; // thermal noise scale

      ids.forEach(id => {
        const vel = velocitiesRef.current[id];
        const atom = atoms.find(a => a.id === id);
        const mass = atom?.type?.mass || 1;

        // Thermal noise
        vel.x += (Math.random() - 0.5) * kbT;
        vel.z += (Math.random() - 0.5) * kbT;

        // Force
        vel.addScaledVector(forces[id], TIMESTEP / mass);

        // Damping
        vel.multiplyScalar(0.98);

        // Position
        const pos = meshes[id].position;
        pos.addScaledVector(vel, TIMESTEP);

        // Wall bounce
        if (pos.x > half)  { pos.x = half;  vel.x *= -0.7; }
        if (pos.x < -half) { pos.x = -half; vel.x *= -0.7; }
        if (pos.z > half)  { pos.z = half;  vel.z *= -0.7; }
        if (pos.z < -half) { pos.z = -half; vel.z *= -0.7; }
        pos.y = 0;
      });

      rebuildBonds();
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, forceType, temperature, gridSize, atoms]);

  // ── Bond lines ───────────────────────────────────────────────────────────
  const rebuildBonds = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    bondMeshesRef.current.forEach(m => {
      scene.remove(m);
      m.geometry.dispose();
    });
    bondMeshesRef.current = [];

    const ids = Object.keys(atomMeshesRef.current);
    const BOND_DIST = 2.2;

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const pA = atomMeshesRef.current[ids[i]].position;
        const pB = atomMeshesRef.current[ids[j]].position;
        if (pA.distanceTo(pB) < BOND_DIST) {
          const bond = buildBondMesh(pA, pB);
          scene.add(bond);
          bondMeshesRef.current.push(bond);
        }
      }
    }
  }, []);

  // ── Bond count for stats ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) rebuildBonds();
  }, [isRunning]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full bg-slate-900 rounded-xl overflow-hidden cursor-crosshair"
      style={{ touchAction: "none" }}
    />
  );
});

export default SandboxCanvas;