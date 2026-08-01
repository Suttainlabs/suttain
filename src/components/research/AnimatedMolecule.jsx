import React, { useRef, useEffect, useState } from "react";

// Animated ball-and-stick molecule rendered with three.js.
// Lightweight, self-contained, continuously rotating — eye-catching hero accent.

const ATOM_COLORS = {
  C: 0x4a4a4a, // dark grey
  H: 0xe0e0e0, // light grey/white
  O: 0xe45e5e, // red
  N: 0x5e72e4, // blue
  F: 0x66cc66, // light green (halogen)
  Cl: 0x66cc66,
};

// A compact, recognizable organic molecule (caffeine-inspired) with coordinates
// roughly normalized around the origin so it reads well as a hero accent.
const ATOMS = [
  { el: "C", pos: [0, 0, 0] },
  { el: "C", pos: [1.4, 0, 0] },
  { el: "N", pos: [2.1, 1.2, 0.2] },
  { el: "C", pos: [1.4, 2.3, 0] },
  { el: "C", pos: [0, 2.3, 0] },
  { el: "N", pos: [-0.7, 1.2, 0.2] },
  { el: "C", pos: [3.6, 1.3, 0] },
  { el: "O", pos: [4.2, 2.4, 0.3] },
  { el: "N", pos: [4.2, 0.1, -0.3] },
  { el: "C", pos: [5.6, 0.2, 0] },
  { el: "O", pos: [6.3, 1.3, 0.3] },
  { el: "C", pos: [6.2, -1.1, -0.3] },
  { el: "N", pos: [5.5, -2.2, 0.1] },
  { el: "C", pos: [4.1, -2.1, 0.2] },
  { el: "C", pos: [-1.4, 3.4, 0] },
  { el: "C", pos: [2.1, 3.4, 0] },
  { el: "H", pos: [-0.5, -0.5, 0.6] },
  { el: "H", pos: [1.9, -0.5, -0.6] },
  { el: "H", pos: [-0.5, 2.8, -0.6] },
  { el: "H", pos: [1.9, 2.8, 0.6] },
  { el: "H", pos: [-2.0, 2.8, 0.6] },
  { el: "H", pos: [-1.0, 4.3, 0.3] },
  { el: "H", pos: [-2.0, 3.8, -0.6] },
  { el: "H", pos: [2.7, 3.4, 0.6] },
  { el: "H", pos: [1.6, 4.3, -0.3] },
  { el: "H", pos: [3.6, -3.1, 0.4] },
  { el: "H", pos: [6.0, -3.1, -0.4] },
  { el: "H", pos: [7.3, -1.1, -0.3] },
];

// Bonds defined as [atomIndexA, atomIndexB]
const BONDS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
  [2, 6], [6, 7], [6, 8], [8, 9], [9, 10], [9, 11],
  [11, 12], [12, 13], [13, 8], [4, 14], [3, 15],
  [0, 16], [0, 17], [4, 18], [3, 19], [14, 20], [14, 21], [14, 22],
  [15, 23], [15, 24], [13, 25], [12, 26], [11, 27],
];

const ATOM_RADIUS = { C: 0.35, H: 0.22, O: 0.32, N: 0.33, F: 0.3, Cl: 0.3 };

export default function AnimatedMolecule({ className = "" }) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let renderer, scene, camera, frameId, group, resizeObserver;

    // Lazy import three (already in node_modules)
    let cancelled = false;
    (async () => {
      const THREE = await import("three");
      if (cancelled || !mountRef.current) return;

      const mount = mountRef.current;
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 11);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      mount.appendChild(renderer.domElement);

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.65);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(4, 6, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x88aaff, 0.4);
      rim.position.set(-6, -2, -4);
      scene.add(rim);

      group = new THREE.Group();

      // Center the molecule
      const center = [0, 0, 0];
      ATOMS.forEach((a) => {
        center[0] += a.pos[0];
        center[1] += a.pos[1];
        center[2] += a.pos[2];
      });
      center[0] /= ATOMS.length;
      center[1] /= ATOMS.length;
      center[2] /= ATOMS.length;

      const atomMeshes = [];
      const sphereGeo = new THREE.SphereGeometry(1, 24, 16);
      ATOMS.forEach((atom) => {
        const r = ATOM_RADIUS[atom.el] || 0.3;
        const color = ATOM_COLORS[atom.el] || 0x888888;
        const mat = new THREE.MeshPhongMaterial({
          color,
          shininess: 60,
          specular: 0x222222,
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.set(
          atom.pos[0] - center[0],
          atom.pos[1] - center[1],
          atom.pos[2] - center[2]
        );
        mesh.scale.setScalar(r);
        group.add(mesh);
        atomMeshes.push(mesh);
      });

      // Bonds as thin cylinders
      const bondGeo = new THREE.CylinderGeometry(0.07, 0.07, 1, 10);
      const bondMat = new THREE.MeshPhongMaterial({ color: 0x9aa0a6, shininess: 30 });
      BONDS.forEach(([a, b]) => {
        const va = atomMeshes[a].position;
        const vb = atomMeshes[b].position;
        const mid = new THREE.Vector3(
          (va.x + vb.x) / 2,
          (va.y + vb.y) / 2,
          (va.z + vb.z) / 2
        );
        const dist = va.distanceTo(vb);
        const bond = new THREE.Mesh(bondGeo, bondMat);
        bond.position.copy(mid);
        bond.scale.y = dist;
        // Orient cylinder from a to b
        const dir = new THREE.Vector3().subVectors(vb, va).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
        bond.quaternion.copy(quat);
        group.add(bond);
      });

      scene.add(group);
      setReady(true);

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        if (group) {
          group.rotation.y += 0.005;
          group.rotation.x += 0.0015;
        }
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!mountRef.current || !renderer || !camera) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(mount);
    })();

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose && obj.material.dispose();
        });
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mountRef} className="w-full h-full min-h-[280px]" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}