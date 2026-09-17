import { LOGO_SIZE_MAX, LOGO_SIZE_MIN } from "@video/schema/scene-schema";
import { COMPOSITION_HEIGHT, COMPOSITION_WIDTH } from "@video/video-config";

export const DEFAULT_LOGO_WIDTH = 12;

const clampLogoSize = (v: number) =>
  Math.max(LOGO_SIZE_MIN, Math.min(LOGO_SIZE_MAX, v));

// Starts the footprint at the image's own aspect, so a wordmark is wide and
// a column mark is tall. The user can then pull each axis on its own.
export const footprintFromImage = (
  naturalWidth: number,
  naturalHeight: number,
): { w: number; h: number } => {
  const aspect =
    naturalWidth > 0 && naturalHeight > 0
      ? naturalWidth / naturalHeight
      : COMPOSITION_WIDTH / COMPOSITION_HEIGHT;
  const canvasAspect = COMPOSITION_WIDTH / COMPOSITION_HEIGHT;
  let w = DEFAULT_LOGO_WIDTH;
  let h = (w / aspect) * canvasAspect;
  if (h > LOGO_SIZE_MAX) {
    h = LOGO_SIZE_MAX;
    w = (h * aspect) / canvasAspect;
  }
  if (w > LOGO_SIZE_MAX) {
    w = LOGO_SIZE_MAX;
    h = (w / aspect) * canvasAspect;
  }
  return { w: clampLogoSize(w), h: clampLogoSize(h) };
};

export const sameLogoSize = (
  current: { w: number; h?: number },
  original: { w: number; h: number },
) =>
  Math.abs(current.w - original.w) < 0.5 &&
  Math.abs((current.h ?? current.w) - original.h) < 0.5;

export const readLogoFootprint = (
  src: string,
  apply: (size: { w: number; h: number }) => void,
) => {
  const img = new Image();
  img.onload = () =>
    apply(footprintFromImage(img.naturalWidth, img.naturalHeight));
  img.src = src;
};
