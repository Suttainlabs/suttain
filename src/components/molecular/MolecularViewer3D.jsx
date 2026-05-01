import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MolecularViewer3D({ molecule, smiles, canvasHeight = 600 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const moleculeGroupRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = canvasHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Molecule group
    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // Generate simple molecular structure (spheres for atoms)
    // In production, you'd parse SMILES or use a library like RDKit.js
    const createSimpleMolecule = () => {
      // Clear existing geometry
      moleculeGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      moleculeGroup.clear();

      // Create a basic tetrahedral structure for demo
      const atomGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const bondGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);

      // Atom positions (simple tetrahedral arrangement)
      const atoms = [
        { pos: [0, 0, 0], color: 0x333333, label: 'C' }, // Carbon
        { pos: [1.5, 0, 0], color: 0xff6b6b, label: 'O' }, // Oxygen
        { pos: [-0.75, 1.3, 0], color: 0x4ecdc4, label: 'N' }, // Nitrogen
        { pos: [-0.75, -1.3, 0], color: 0xffffff, label: 'H' }, // Hydrogen
      ];

      atoms.forEach(atom => {
        const material = new THREE.MeshPhongMaterial({ color: atom.color });
        const sphere = new THREE.Mesh(atomGeometry, material);
        sphere.position.set(...atom.pos);
        sphere.userData.label = atom.label;
        moleculeGroup.add(sphere);
      });

      // Bonds between atoms
      const bonds = [[0, 1], [0, 2], [0, 3]];
      bonds.forEach(([from, to]) => {
        const start = atoms[from].pos;
        const end = atoms[to].pos;
        const mid = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2,
        ];
        const distance = Math.sqrt(
          Math.pow(end[0] - start[0], 2) +
          Math.pow(end[1] - start[1], 2) +
          Math.pow(end[2] - start[2], 2)
        );

        const bondMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const bond = new THREE.Mesh(bondGeometry, bondMaterial);
        bond.position.set(...mid);
        bond.lookAt(...end);
        bond.scale.z = distance;
        moleculeGroup.add(bond);
      });

      moleculeGroup.position.set(0, 0, 0);
    };

    createSimpleMolecule();

    // Mouse controls
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseDown = (e) => {
      mouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsRotating(false);
    };

    const onMouseMove = (e) => {
      if (!mouseDown) return;

      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (isRotating && !mouseDown) {
        targetRotationY += 0.005;
      }

      moleculeGroup.rotation.x += (targetRotationX - moleculeGroup.rotation.x) * 0.1;
      moleculeGroup.rotation.y += (targetRotationY - moleculeGroup.rotation.y) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = canvasHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [canvasHeight]);

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? zoom * 1.2 : zoom / 1.2;
    setZoom(newZoom);
    if (cameraRef.current) {
      cameraRef.current.position.z = 50 / newZoom;
    }
  };

  const handleReset = () => {
    setZoom(1);
    setIsRotating(true);
    if (cameraRef.current) {
      cameraRef.current.position.z = 50;
    }
    if (moleculeGroupRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleDownload = () => {
    if (rendererRef.current) {
      const link = document.createElement('a');
      link.href = rendererRef.current.domElement.toDataURL('image/png');
      link.download = `${molecule || 'molecule'}-structure.png`;
      link.click();
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        ref={containerRef}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shadow-sm"
        style={{ height: `${canvasHeight}px` }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={isRotating ? 'default' : 'outline'}
          onClick={() => setIsRotating(!isRotating)}
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" />
          {isRotating ? 'Rotating' : 'Paused'}
        </Button>

        <Button size="sm" variant="outline" onClick={() => handleZoom('in')} className="gap-2">
          <ZoomIn className="w-4 h-4" />
          Zoom In
        </Button>

        <Button size="sm" variant="outline" onClick={() => handleZoom('out')} className="gap-2">
          <ZoomOut className="w-4 h-4" />
          Zoom Out
        </Button>

        <Button size="sm" variant="outline" onClick={handleReset} className="gap-2">
          <Maximize2 className="w-4 h-4" />
          Reset View
        </Button>

        <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      {molecule && (
        <p className="text-sm text-slate-600">
          Viewing: <span className="font-semibold">{molecule}</span>
          {smiles && <span className="text-slate-500 ml-2">({smiles})</span>}
        </p>
      )}
    </div>
  );
}