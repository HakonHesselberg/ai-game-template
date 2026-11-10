import * as THREE from 'three';
import type { GameState } from '../../core/game';
import { targetPosition } from '../../core/game';
import { settings } from '../../data/settings';

export interface ScreenPoint {
  /** Canvas-local CSS pixels, never device pixels or window coordinates. */
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
}

export function createWorld(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0x0b1425);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b1425, 11, 24);
  const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 40);
  camera.position.set(0, 4.7, 9);
  camera.lookAt(0, 0.8, 0);

  const ambient = new THREE.HemisphereLight(0xc7e5ff, 0x273958, 2.1);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0x9bd7ff, 3);
  key.position.set(4, 7, 5);
  scene.add(key);

  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x142b3c, roughness: 0.88 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  scene.add(ground);
  const grid = new THREE.GridHelper(18, 18, 0x345979, 0x233c55);
  grid.position.y = -0.24;
  scene.add(grid);

  const targetGeometry = new THREE.IcosahedronGeometry(settings.targetRadius, 2);
  const targetMaterial = new THREE.MeshStandardMaterial({
    color: 0x76fbdc, emissive: 0x1ac4bd, emissiveIntensity: 0.8,
    metalness: 0.2, roughness: 0.24,
  });
  const target = new THREE.Mesh(targetGeometry, targetMaterial);
  scene.add(target);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const projection = new THREE.Vector3();

  function resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.maxPixelRatio));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(state: GameState) {
    const { x, y, z } = targetPosition(state);
    target.position.set(x, y, z);
    target.rotation.set(state.tick * 0.009, state.tick * 0.012, 0);
    renderer.render(scene, camera);
  }

  function targetOnScreen(): ScreenPoint {
    projection.copy(target.position).project(camera);
    return {
      x: (projection.x + 1) * canvas.clientWidth / 2,
      y: (1 - projection.y) * canvas.clientHeight / 2,
      visible: projection.z >= -1 && projection.z <= 1 && Math.abs(projection.x) <= 1 && Math.abs(projection.y) <= 1,
    };
  }

  function hitTarget(clientX: number, clientY: number): boolean {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    pointer.set(
      ((clientX - bounds.left) / bounds.width) * 2 - 1,
      -((clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(target).length > 0;
  }

  function dispose() {
    targetGeometry.dispose();
    targetMaterial.dispose();
    groundGeometry.dispose();
    groundMaterial.dispose();
    grid.geometry.dispose();
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((material) => material.dispose());
    renderer.dispose();
  }

  return { resize, render, targetOnScreen, hitTarget, dispose };
}
