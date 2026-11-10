import { applyCommand, createGame, stepGame } from '../core/game';
import { settings } from '../data/settings';
import { createHud } from '../presentation/dom/hud';
import { createOverlay } from '../presentation/canvas2d/overlay';
import { createWorld } from '../presentation/three/world';

export function startGame() {
  const playfield = document.getElementById('playfield');
  const worldCanvas = document.getElementById('world');
  const overlayCanvas = document.getElementById('overlay');
  if (!(playfield instanceof HTMLElement) || !(worldCanvas instanceof HTMLCanvasElement) || !(overlayCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Missing hybrid rendering surfaces');
  }

  let state = createGame();
  let contextLost = false;
  let accumulator = 0;
  let previousFrame = performance.now();
  let frameId = 0;
  const world = createWorld(worldCanvas);
  const overlay = createOverlay(overlayCanvas);
  const hud = createHud(
    () => { state = applyCommand(state, { type: 'toggle-pause' }); },
    () => { state = applyCommand(state, { type: 'reset' }); accumulator = 0; },
  );

  function resize() {
    const { width, height } = playfield!.getBoundingClientRect();
    world.resize(width, height);
    overlay.resize(width, height);
  }

  function pointerDown(event: PointerEvent) {
    if (!state.paused && !contextLost && world.hitTarget(event.clientX, event.clientY)) {
      state = applyCommand(state, { type: 'collect' });
    }
  }

  function keyDown(event: KeyboardEvent) {
    const focused = event.target;
    if (focused instanceof HTMLButtonElement || focused instanceof HTMLInputElement) return;
    if (event.code === 'Space') {
      event.preventDefault();
      state = applyCommand(state, { type: 'toggle-pause' });
    } else if (event.code === 'Enter' && focused === worldCanvas && !state.paused && !contextLost) {
      state = applyCommand(state, { type: 'collect' });
    } else if (event.code === 'KeyR') {
      state = applyCommand(state, { type: 'reset' });
      accumulator = 0;
    }
  }

  function visibilityChange() {
    previousFrame = performance.now();
    accumulator = 0;
  }

  function lostContext(event: Event) {
    event.preventDefault();
    contextLost = true;
  }

  function restoredContext() {
    contextLost = false;
    resize();
  }

  function frame(now: number) {
    const elapsed = Math.min(Math.max(now - previousFrame, 0), settings.maxFrameMs);
    previousFrame = now;
    if (!document.hidden && !contextLost) {
      accumulator += elapsed;
      let steps = 0;
      while (accumulator >= settings.stepMs && steps < settings.maxStepsPerFrame) {
        state = stepGame(state);
        accumulator -= settings.stepMs;
        steps += 1;
      }
      if (steps === settings.maxStepsPerFrame) accumulator = 0;
      world.render(state);
      overlay.render(world.targetOnScreen());
    }
    hud.render(state, contextLost);
    frameId = requestAnimationFrame(frame);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(playfield);
  worldCanvas.addEventListener('pointerdown', pointerDown);
  worldCanvas.addEventListener('webglcontextlost', lostContext);
  worldCanvas.addEventListener('webglcontextrestored', restoredContext);
  window.addEventListener('keydown', keyDown);
  document.addEventListener('visibilitychange', visibilityChange);
  window.addEventListener('pagehide', visibilityChange);
  window.addEventListener('pageshow', visibilityChange);
  resize();
  frameId = requestAnimationFrame(frame);

  return function dispose() {
    cancelAnimationFrame(frameId);
    observer.disconnect();
    worldCanvas.removeEventListener('pointerdown', pointerDown);
    worldCanvas.removeEventListener('webglcontextlost', lostContext);
    worldCanvas.removeEventListener('webglcontextrestored', restoredContext);
    window.removeEventListener('keydown', keyDown);
    document.removeEventListener('visibilitychange', visibilityChange);
    window.removeEventListener('pagehide', visibilityChange);
    window.removeEventListener('pageshow', visibilityChange);
    hud.dispose();
    world.dispose();
  };
}
