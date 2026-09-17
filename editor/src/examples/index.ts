import type { DynamicVideoProps } from "@video/schema/scene-schema";
import { onboardingComercial } from "./onboarding-comercial";
import { seguridadInformacion } from "./seguridad-informacion";

export type VideoExample = {
  title: string;
  description: string;
  video: DynamicVideoProps;
};

/**
 * The catalogue of sample scripts. Order is the route: the first entry opens at
 * /video-examples/1, the second at /video-examples/2, and so on — so adding an
 * example is a single push here.
 */
export const videoExamples: VideoExample[] = [
  {
    title: "Onboarding comercial — 30 días",
    description:
      "Guion de bienvenida para el equipo de ventas: portada, agenda, dato clave, cita y escenas de avatar y video.",
    video: onboardingComercial,
  },
  {
    title: "Seguridad de la información",
    description:
      "Capacitación con subtítulos activados, escena de imagen y los layouts de una y dos columnas.",
    video: seguridadInformacion,
  },
];

/** 1-based, as it appears in the URL. `null` when the number has no example. */
export const getExample = (number: number): VideoExample | null =>
  videoExamples[number - 1] ?? null;

export const totalSeconds = (example: VideoExample): number =>
  example.video.scenes.reduce((sum, s) => sum + s.durationInSeconds, 0);
