/**
 * The single source for the composition's frame rate and size. Root.tsx
 * registers the composition with these, the metadata calculation turns seconds
 * into frames with them, and the editor's Player and Thumbnail mirror them so
 * the preview matches the render pixel for pixel.
 */
export const FPS = 30;
export const COMPOSITION_WIDTH = 1920;
export const COMPOSITION_HEIGHT = 1080;
