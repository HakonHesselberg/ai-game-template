import type { GameState } from '../../core/game';

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required UI element: ${id}`);
  return element as T;
}

export function createHud(onPause: () => void, onReset: () => void) {
  const score = getElement<HTMLElement>('score');
  const status = getElement<HTMLElement>('status');
  const pause = getElement<HTMLButtonElement>('pause-button');
  const reset = getElement<HTMLButtonElement>('reset-button');
  pause.addEventListener('click', onPause);
  reset.addEventListener('click', onReset);

  function render(state: GameState, contextLost: boolean) {
    const nextScore = String(state.score);
    const nextPause = state.paused ? 'Resume' : 'Pause';
    const nextStatus = contextLost
      ? 'Graphics context lost — waiting to recover'
      : state.paused ? 'Paused' : `Target ${state.score + 1} ready · Space to pause · Enter to collect · R to reset`;
    if (score.textContent !== nextScore) score.textContent = nextScore;
    if (pause.textContent !== nextPause) pause.textContent = nextPause;
    if (status.textContent !== nextStatus) status.textContent = nextStatus;
  }

  function dispose() {
    pause.removeEventListener('click', onPause);
    reset.removeEventListener('click', onReset);
  }

  return { render, dispose };
}
