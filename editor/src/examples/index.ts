import type { DynamicVideoProps } from "@video/schema/scene-schema";
import { moduloConceptos } from "./modulo-1-conceptos";
import { moduloInstrumentos } from "./modulo-2-instrumentos";
import { moduloTrabajoDeCampo } from "./modulo-3-trabajo-de-campo";
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
  {
    title: "Topografía · Módulo 1 — Conceptos",
    description:
      "Fundamentos del levantamiento topográfico: punto, cota, escala, azimut y coordenadas. Fotografía y narración del módulo, con subtítulos.",
    video: moduloConceptos,
  },
  {
    title: "Topografía · Módulo 2 — Instrumentos",
    description:
      "Del jalón y la cinta métrica a la estación total y el GNSS RTK, con lo que exige cada equipo en campo.",
    video: moduloInstrumentos,
  },
  {
    title: "Topografía · Módulo 3 — Trabajo de campo",
    description:
      "Nivelación, poligonales, trazado y replanteo — más la seguridad que el trabajo en campo exige.",
    video: moduloTrabajoDeCampo,
  },
];

/** 1-based, as it appears in the URL. `null` when the number has no example. */
export const getExample = (number: number): VideoExample | null =>
  videoExamples[number - 1] ?? null;

export const totalSeconds = (example: VideoExample): number =>
  example.video.scenes.reduce((sum, s) => sum + s.durationInSeconds, 0);
