import type { ScreenPoint } from '../coordinates';
import { settings } from '../../data/settings';

export function createOverlay(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is required for the target overlay');
  let width = 0;
  let height = 0;

  function resize(cssWidth: number, cssHeight: number) {
    width = cssWidth;
    height = cssHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, settings.maxPixelRatio);
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    context!.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function render(marker: ScreenPoint) {
    const ctx = context!;
    ctx.clearRect(0, 0, width, height);
    if (!marker.visible) return;

    // This is Canvas 2D drawing, projected from the actual Three.js camera.
    ctx.strokeStyle = '#ffcc77';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 39, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const angle = i * Math.PI / 2;
      const inner = 43;
      const outer = 55;
      ctx.beginPath();
      ctx.moveTo(marker.x + Math.cos(angle) * inner, marker.y + Math.sin(angle) * inner);
      ctx.lineTo(marker.x + Math.cos(angle) * outer, marker.y + Math.sin(angle) * outer);
      ctx.stroke();
    }
  }

  return { resize, render };
}
