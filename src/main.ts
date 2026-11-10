import './style.css';
import { startGame } from './application/start';

let dispose: (() => void) | undefined;
try {
  dispose = startGame();
} catch (error) {
  // Surface missing WebGL/Canvas support as readable UI rather than a blank page.
  const status = document.getElementById('status');
  if (status) status.textContent = `Unable to start graphics: ${error instanceof Error ? error.message : String(error)}`;
  console.error(error);
}
if (import.meta.hot) import.meta.hot.dispose(() => dispose?.());
