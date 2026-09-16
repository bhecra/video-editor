import type {
  CanvasBackground,
  CanvasLayer,
  CanvasLayout,
} from "../schema/scene-schema";

export const canvasLayoutLabels: Record<CanvasLayout, string> = {
  portada: "Portada",
  "texto-imagen": "Texto e imagen",
  "dato-clave": "Dato clave",
  cita: "Cita",
  "una-columna": "Una columna",
  "dos-columnas": "Dos columnas",
  "lista-ordenada": "Lista ordenada",
  "agenda-indice": "Agenda / Índice",
  "divisor-seccion": "Divisor de sección",
  afirmacion: "Afirmación",
};

const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/ubits-canvas/1200/1200";

type Template = {
  background: CanvasBackground;
  layers: CanvasLayer[];
};

const uid = (layout: string, role: string) => `${layout}-${role}`;

export const canvasTemplates: Record<CanvasLayout, Template> = {
  portada: {
    background: "gradient",
    layers: [
      {
        id: uid("portada", "eyebrow"),
        type: "text",
        variant: "eyebrow",
        text: "Tus primeros treinta días",
        x: 6,
        y: 32,
        w: 40,
        h: 6,
      },
      {
        id: uid("portada", "title"),
        type: "text",
        variant: "title",
        text: "Título de la portada",
        x: 6,
        y: 40,
        w: 40,
        h: 18,
      },
      {
        id: uid("portada", "body"),
        type: "text",
        variant: "body",
        text: "Una línea de apoyo que explica de qué trata el video.",
        x: 6,
        y: 60,
        w: 38,
        h: 12,
      },
      {
        id: uid("portada", "plate"),
        type: "shape",
        fill: "white",
        x: 50,
        y: 12,
        w: 42,
        h: 72,
        rotation: -11,
      },
      {
        id: uid("portada", "photo"),
        type: "image",
        src: PLACEHOLDER_IMAGE,
        x: 52,
        y: 12,
        w: 40,
        h: 76,
      },
      {
        id: uid("portada", "badge"),
        type: "badge",
        title: "Treinta días",
        subtitle: "Cuatro semanas, cuatro objetivos",
        x: 60,
        y: 70,
        w: 32,
        h: 14,
      },
    ],
  },
  "texto-imagen": {
    background: "light",
    layers: [
      {
        id: uid("texto-imagen", "title"),
        type: "text",
        variant: "title",
        text: "Título de la sección",
        x: 6,
        y: 34,
        w: 40,
        h: 16,
      },
      {
        id: uid("texto-imagen", "body"),
        type: "text",
        variant: "body",
        text: "Describe la idea principal en una o dos frases cortas.",
        x: 6,
        y: 52,
        w: 38,
        h: 16,
      },
      {
        id: uid("texto-imagen", "photo"),
        type: "image",
        src: PLACEHOLDER_IMAGE,
        x: 52,
        y: 14,
        w: 42,
        h: 72,
      },
    ],
  },
  "dato-clave": {
    background: "light",
    layers: [
      {
        id: uid("dato-clave", "stat"),
        type: "stat",
        value: "+120",
        label: "Etiqueta de la métrica",
        x: 22,
        y: 32,
        w: 56,
        h: 36,
      },
    ],
  },
  cita: {
    background: "dark",
    layers: [
      {
        id: uid("cita", "quote"),
        type: "quote",
        quote: "Una frase que vale la pena recordar.",
        author: "Autor de la cita",
        x: 14,
        y: 30,
        w: 72,
        h: 40,
      },
    ],
  },
  "una-columna": {
    background: "light",
    layers: [
      {
        id: uid("una-columna", "eyebrow"),
        type: "text",
        variant: "eyebrow",
        text: "Sección",
        x: 8,
        y: 26,
        w: 40,
        h: 6,
      },
      {
        id: uid("una-columna", "title"),
        type: "text",
        variant: "title",
        text: "Título de la columna",
        x: 8,
        y: 34,
        w: 70,
        h: 14,
      },
      {
        id: uid("una-columna", "body"),
        type: "text",
        variant: "body",
        text: "El cuerpo del contenido va aquí, con espacio suficiente para respirar.",
        x: 8,
        y: 50,
        w: 70,
        h: 22,
      },
    ],
  },
  "dos-columnas": {
    background: "light",
    layers: [
      {
        id: uid("dos-columnas", "title"),
        type: "text",
        variant: "title",
        text: "Título comparativo",
        x: 8,
        y: 14,
        w: 84,
        h: 12,
      },
      {
        id: uid("dos-columnas", "left"),
        type: "text",
        variant: "body",
        text: "Columna izquierda.",
        x: 8,
        y: 34,
        w: 38,
        h: 40,
      },
      {
        id: uid("dos-columnas", "right"),
        type: "text",
        variant: "body",
        text: "Columna derecha.",
        x: 54,
        y: 34,
        w: 38,
        h: 40,
      },
    ],
  },
  "lista-ordenada": {
    background: "light",
    layers: [
      {
        id: uid("lista-ordenada", "title"),
        type: "text",
        variant: "title",
        text: "Título de la lista",
        x: 8,
        y: 16,
        w: 70,
        h: 12,
      },
      {
        id: uid("lista-ordenada", "items"),
        type: "list",
        ordered: true,
        items: ["Primer paso", "Segundo paso", "Tercer paso"],
        x: 8,
        y: 32,
        w: 70,
        h: 48,
      },
    ],
  },
  "agenda-indice": {
    background: "dark",
    layers: [
      {
        id: uid("agenda-indice", "title"),
        type: "text",
        variant: "title",
        text: "Agenda",
        x: 8,
        y: 16,
        w: 70,
        h: 12,
      },
      {
        id: uid("agenda-indice", "items"),
        type: "list",
        ordered: true,
        items: ["Primer tema", "Segundo tema", "Tercer tema", "Cuarto tema"],
        x: 8,
        y: 32,
        w: 80,
        h: 52,
      },
    ],
  },
  "divisor-seccion": {
    background: "accent",
    layers: [
      {
        id: uid("divisor-seccion", "title"),
        type: "text",
        variant: "title",
        text: "Nueva sección",
        x: 12,
        y: 42,
        w: 76,
        h: 16,
      },
    ],
  },
  afirmacion: {
    background: "dark",
    layers: [
      {
        id: uid("afirmacion", "statement"),
        type: "text",
        variant: "statement",
        text: "Una afirmación que cierra la idea.",
        x: 12,
        y: 36,
        w: 76,
        h: 28,
      },
    ],
  },
};

// Ids are minted in the editor when a layout is picked and then stored in the
// scene, so they never change between frames of a render — which is what
// Remotion's deterministic-randomness rule guards against.
export const createLayersForLayout = (layout: CanvasLayout): CanvasLayer[] =>
  canvasTemplates[layout].layers.map((layer) => ({
    ...layer,
    // eslint-disable-next-line @remotion/deterministic-randomness
    id: `${layer.id}-${Math.random().toString(36).slice(2, 7)}`,
  }));
