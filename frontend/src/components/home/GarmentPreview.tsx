import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createGarment, type GarmentKind } from './garmentModel';

interface GarmentPreviewProps {
  kind: GarmentKind;
  active: boolean;
}

export default function GarmentPreview({ kind, active }: GarmentPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateMotion = useRef<(active: boolean) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.6, 1.6, 0.43, -3.27, 0.1, 20);
    camera.position.z = 6;
    const { group, materials } = createGarment(kind);
    scene.add(group, new THREE.HemisphereLight('#fffaf0', '#a49884', 2.15));

    const key = new THREE.DirectionalLight('#fff5e8', 2.6);
    key.position.set(-3, 4, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight('#eef3ff', 0.65);
    fill.position.set(3, 1, 2);
    scene.add(fill);

    const restAngle = kind === 'cargo' || kind === 'tee' ? -0.17 : 0.19;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isActive = false;
    let swingStarted = 0;
    let frame = 0;
    group.rotation.y = restAngle;

    function render() {
      renderer.render(scene, camera);
    }

    function animate(time: number) {
      frame = 0;
      const elapsed = (time - swingStarted) / 1000;
      const swing = Math.sin(elapsed * 10) * Math.exp(-elapsed * 2.9);
      const targetY = isActive ? -restAngle * 2.2 : restAngle;
      const targetZ = isActive ? 0.055 : 0;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY + swing * 0.24, 0.14);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetZ + swing * 0.13, 0.15);
      render();
      if (elapsed < 1.8) {
        frame = requestAnimationFrame(animate);
      } else {
        group.rotation.set(0, targetY, targetZ);
        render();
      }
    }

    updateMotion.current = (nextActive) => {
      isActive = nextActive;
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        group.rotation.set(0, restAngle, 0);
        render();
        return;
      }
      swingStarted = performance.now();
      if (!frame) frame = requestAnimationFrame(animate);
    };

    function resize() {
      if (!canvas) return;
      const { clientWidth: width, clientHeight: height } = canvas;
      if (!width || !height) return;
      const halfWidth = (3.7 * width) / (2 * height);
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
      canvas.dataset.ready = 'true';
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    canvas.addEventListener('webglcontextlost', showFallback);
    canvas.addEventListener('webglcontextrestored', resize);
    function showFallback() {
      if (canvas) delete canvas.dataset.ready;
    }
    reducedMotion.addEventListener('change', resetMotion);
    function resetMotion() {
      updateMotion.current(isActive);
    }

    return () => {
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', showFallback);
      canvas.removeEventListener('webglcontextrestored', resize);
      reducedMotion.removeEventListener('change', resetMotion);
      cancelAnimationFrame(frame);
      delete canvas.dataset.ready;
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      updateMotion.current = () => {};
    };
  }, [kind]);

  useEffect(() => {
    updateMotion.current(active);
  }, [active]);

  return <canvas ref={canvasRef} className="rack-model" aria-hidden="true" />;
}
