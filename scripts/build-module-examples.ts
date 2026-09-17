import fs from "fs";
import os from "os";
import path from "path";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";
import { PROJECT_ROOT, UPLOADS_DIR } from "../render-server/config";

/**
 * Turns a folder of course modules — one mp3, one png and one narration line
 * per scene — into examples the editor can open.
 *
 *   npm run build-module-examples [carpeta]
 *
 * The media is copied into the render server's uploads folder (out of git) and
 * the generated examples point at the URLs that serve it, exactly like media
 * uploaded from the editor does. Re-running it overwrites both.
 */

const SOURCE_DIR =
  process.argv[2] ?? path.join(os.homedir(), "Downloads", "Audios");

/** Where the copied media lands inside uploads/, and the URL that serves it. */
const MEDIA_SUBDIR = "modulos";
const MEDIA_BASE_URL = "http://localhost:4000/uploads";

// A scene is only generated when its three pieces line up, so a module is
// described by where each piece lives.
type ModuleSpec = {
  key: string;
  file: string;
  title: string;
  description: string;
  accentColor: string;
  audioDir: string;
  photoDir: string;
  narrationFile: string;
  exportName: string;
};

const MODULES: ModuleSpec[] = [
  {
    key: "m1",
    file: "modulo-1-conceptos.ts",
    exportName: "moduloConceptos",
    title: "Topografía · Módulo 1 — Conceptos",
    description:
      "Fundamentos del levantamiento topográfico: punto, cota, escala, azimut y coordenadas. Fotografía y narración del módulo, con subtítulos.",
    accentColor: "#1a6bff",
    audioDir: "audio_m1",
    photoDir: "m1_fotografia",
    narrationFile: "narraciones_m1_subtitulos.txt",
  },
  {
    key: "m2",
    file: "modulo-2-instrumentos.ts",
    exportName: "moduloInstrumentos",
    title: "Topografía · Módulo 2 — Instrumentos",
    description:
      "Del jalón y la cinta métrica a la estación total y el GNSS RTK, con lo que exige cada equipo en campo.",
    accentColor: "#0e9f6e",
    audioDir: "audio_m2",
    photoDir: "m2_fotografia",
    narrationFile: "narraciones_m2_acentos_subtitulos.txt",
  },
  {
    key: "m3",
    file: "modulo-3-trabajo-de-campo.ts",
    exportName: "moduloTrabajoDeCampo",
    title: "Topografía · Módulo 3 — Trabajo de campo",
    description:
      "Nivelación, poligonales, trazado y replanteo — más la seguridad que el trabajo en campo exige.",
    accentColor: "#f49e04",
    audioDir: "audio_m3",
    photoDir: "m3_fotografia",
    narrationFile: "narraciones_m3_acentos_subtitulos.txt",
  },
];

/** The audio decides how long its scene lasts; the tail keeps it from cutting. */
const TAIL_SECONDS = 0.4;

const durationOf = async (file: string) => {
  const { durationInSeconds } = await parseMedia({
    src: file,
    fields: { durationInSeconds: true },
    reader: nodeReader,
    acknowledgeRemotionLicense: true,
  });
  if (!durationInSeconds) throw new Error(`Sin duración: ${file}`);
  return Math.max(1, Math.round((durationInSeconds + TAIL_SECONDS) * 10) / 10);
};

/** The scene list shows names, not paragraphs: cut on a word, keep the sense. */
const sceneName = (line: string, max = 44) => {
  const clean = line
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;:]$/, "");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

const copyIfChanged = (from: string, to: string) => {
  const source = fs.statSync(from);
  const target = fs.existsSync(to) ? fs.statSync(to) : null;
  if (target && target.size === source.size) return false;
  fs.copyFileSync(from, to);
  return true;
};

const quote = (value: string) => JSON.stringify(value);

const buildModule = async (spec: ModuleSpec) => {
  const audioDir = path.join(SOURCE_DIR, spec.audioDir);
  const photoDir = path.join(SOURCE_DIR, spec.photoDir);
  const narrationPath = path.join(SOURCE_DIR, spec.narrationFile);

  for (const required of [audioDir, photoDir, narrationPath]) {
    if (!fs.existsSync(required)) {
      throw new Error(`No existe ${required} — revisa la carpeta de origen.`);
    }
  }

  const lines = fs
    .readFileSync(narrationPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const mediaDir = path.join(UPLOADS_DIR, MEDIA_SUBDIR, spec.key);
  fs.mkdirSync(mediaDir, { recursive: true });

  const scenes: string[] = [];
  let copied = 0;
  let total = 0;

  for (const [index, line] of lines.entries()) {
    const n = index + 1;
    const audio = path.join(audioDir, `escena_${n}.mp3`);
    const photo = path.join(photoDir, `fotografia_${n}.png`);
    // A narration line without its media is skipped, not faked: the rest of
    // the module still makes a valid video.
    if (!fs.existsSync(audio) || !fs.existsSync(photo)) {
      console.warn(`  ⚠ escena ${n} sin audio o fotografía — se omite`);
      continue;
    }

    if (copyIfChanged(audio, path.join(mediaDir, `escena_${n}.mp3`))) copied++;
    if (copyIfChanged(photo, path.join(mediaDir, `fotografia_${n}.png`)))
      copied++;

    const durationInSeconds = await durationOf(audio);
    total += durationInSeconds;

    scenes.push(
      [
        `    {`,
        `      id: ${quote(`${spec.key}-${n}`)},`,
        `      name: ${quote(sceneName(line))},`,
        `      type: "image",`,
        `      durationInSeconds: ${durationInSeconds},`,
        `      imageUrl: \`\${MEDIA}/fotografia_${n}.png\`,`,
        `      audioUrl: \`\${MEDIA}/escena_${n}.mp3\`,`,
        `      accentColor: ${quote(spec.accentColor)},`,
        `      script: ${quote(line)},`,
        `    },`,
      ].join("\n"),
    );
  }

  const contents = `import type { DynamicVideoProps } from "@video/schema/scene-schema";

// GENERADO por scripts/build-module-examples.ts — no editar a mano.
// Fuente: ${spec.audioDir}/ + ${spec.photoDir}/ + ${spec.narrationFile}
// Una escena por línea de narración: su audio manda la duración y su
// fotografía es la imagen. La media vive en render-server/uploads/, así que el
// servidor de render tiene que estar arriba para verla.
const MEDIA = "${MEDIA_BASE_URL}/${MEDIA_SUBDIR}/${spec.key}";

export const ${spec.exportName}: DynamicVideoProps = {
  settings: { subtitles: true },
  scenes: [
${scenes.join("\n")}
  ],
};
`;

  const destination = path.join(
    PROJECT_ROOT,
    "editor",
    "src",
    "examples",
    spec.file,
  );
  fs.writeFileSync(destination, contents);

  const minutes = Math.floor(total / 60);
  const seconds = Math.round(total % 60);
  console.log(
    `${spec.key}: ${scenes.length} escenas · ${minutes}:${String(seconds).padStart(2, "0")} · ${copied} archivos copiados → ${path.relative(PROJECT_ROOT, destination)}`,
  );
};

/** The catalogue is written by hand — this is the entry to paste into it. */
const catalogueEntry = (spec: ModuleSpec) =>
  [
    `  {`,
    `    title: ${quote(spec.title)},`,
    `    description:`,
    `      ${quote(spec.description)},`,
    `    video: ${spec.exportName},`,
    `  },`,
  ].join("\n");

const main = async () => {
  console.log(`Origen: ${SOURCE_DIR}`);
  for (const spec of MODULES) await buildModule(spec);

  const index = fs.readFileSync(
    path.join(PROJECT_ROOT, "editor", "src", "examples", "index.ts"),
    "utf8",
  );
  const missing = MODULES.filter((spec) => !index.includes(spec.exportName));
  if (missing.length === 0) return;

  console.log("\nFalta registrarlos en editor/src/examples/index.ts:\n");
  console.log(missing.map(catalogueEntry).join("\n"));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
