/** Renderer-neutral screen coordinates are CSS pixels relative to both canvases. */
export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
}
