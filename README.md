# Video Render — editor de escenas

Editor visual de video: se arma un guion por escenas (texto, imagen, video,
avatar), se previsualiza con el mismo motor que lo va a renderizar y se genera
el `.mp4` desde la propia interfaz.

## Cómo se levanta

Hacen falta dos procesos:

```bash
npm run render-server   # API de render en http://localhost:4000
```

```bash
npm run dev             # editor en http://localhost:5173
```

Otros comandos: `npm run studio` abre Remotion Studio sobre la misma
composición, `npm run lint` corre ESLint y los dos `tsc`, `npm run build`
genera el bundle de Remotion.

## Arquitectura

Tres piezas, cada una con una responsabilidad:

```
src/              MOTOR DE VIDEO — lo que se renderiza (Remotion)
editor/           EDITOR — la interfaz (React + Vite)
render-server/    API DE RENDER — genera el .mp4 (Express)
scripts/          HERRAMIENTAS — generadores que escriben contenido en editor/
```

### El flujo

```
  cualquier cliente  ──►  { scenes, settings }  ──►  POST /api/render  ──►  .mp4
      (editor/)             (src/video/schema)        (render-server)       (out/)
```

El editor no es un requisito: lo único que hace falta para generar un video es
un JSON válido según el schema. Otra app, un backend, un CLI o un LLM que
produzca ese objeto sirve igual.

### Las dependencias

```
        editor/                                    render-server/
    la interfaz (React)                            la API (Express)
        │      │                                     │        │
        │      └────────  POST /api/render  ─────────┘        │
        │                                                     │
        │ importa                                     importa │
        ▼                                                     ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                          src/video/                           │
  │                                                               │
  │   schema/      el contrato — lo comparten los dos             │
  │   renderers/   cómo se pinta cada escena                      │
  │   theme/       estilos, layouts y fuentes                     │
  │   DynamicVideo la composición que ensambla todo               │
  └───────────────────────────────────────────────────────────────┘
```

Las flechas van en un solo sentido: `src/video/` no sabe que existe un editor
ni un servidor, y tampoco contiene contenido — los guiones de ejemplo viven en el
editor, y Remotion Studio abre con una escena de relleno. Cada uno importa lo
que necesita del motor:

| Quién | Qué importa | Para qué |
|---|---|---|
| `editor/` | `schema/` | tipar y construir las escenas |
| `editor/` | `DynamicVideo` + `theme/` | pintar la vista previa en el navegador |
| `editor/` | `video-config` | que el Player use los mismos fps y tamaño del render |
| `render-server/` | `schema/` | validar el payload antes de renderizar |
| `render-server/` | `src/index.ts` (bundle) | renderizar el video de verdad |

Un cliente sin vista previa solo necesita la primera fila: el schema.

## Estructura

### `src/` — motor de video

```
src/
├── index.ts                        registerRoot
├── Root.tsx                        registra la composición "SceneEditor"
└── video/
    ├── DynamicVideo.tsx            composición raíz: escenas + subtítulos + logo
    ├── video-config.ts             fps y tamaño — fuente única para todo
    ├── transitions/                transiciones entre escenas
    │   ├── index.ts                efectos disponibles y duración real del video
    │   └── zoom.tsx               el zoom propio, en CSS
    ├── calculate-metadata.ts       duración derivada de las escenas
    ├── renderers/                  cómo se pinta cada tipo de escena
    │   ├── SceneRenderer.tsx       despacha por scene.type
    │   ├── CanvasSceneRenderer.tsx capas: texto, imagen, forma, badge, lista…
    │   └── MediaSceneRenderer.tsx  escenas de imagen, video y avatar
    ├── schema/                     el contrato compartido
    │   ├── scene-schema.ts         esquemas zod + tipos de escena y capa
    │   └── layer-fields.ts         leer/escribir un campo de una capa
    └── theme/                      apariencia
        ├── canvas-styles.ts        estilos de fondo, texto, subtítulos y logo
        ├── canvas-templates.ts     layouts predefinidos y sus capas
        └── fonts.ts                fuentes cargadas para el render
```

Hay una sola composición registrada, `SceneEditor`. El editor y el servidor le
pasan las escenas como `inputProps`, así que lo que se ve en la vista previa es
exactamente lo que sale renderizado.

#### Transiciones

Cada escena puede declarar cómo entra desde la anterior:

```ts
{ type: "fade", durationInSeconds: 0.5, direction: "from-right" }
```

Los efectos disponibles son `none`, `zoom`, `fade`, `slide`, `wipe`, `flip`,
`clock-wipe` e `iris`; `direction` solo la leen `slide`, `wipe` y `flip`. La
primera escena ignora el campo, y una escena sin transición propia usa la de
`settings.defaultTransition` — que en los ejemplos y en los videos nuevos es un
`zoom` de 0.5 s.

El `zoom` es propio (`transitions/zoom.tsx`): dos transforms CSS, la escena que
sale creciendo mientras se desvanece y la que entra subiendo hasta su tamaño.
`@remotion/transitions` trae zooms propios, pero son shaders WebGL dibujados
por la API HTML-in-Canvas: el render necesitaría `--gl=swangle` y el navegador,
Chrome 148+ con `chrome://flags/#canvas-draw-element` activado, así que la
vista previa se rompería para casi todos.

Una transición **solapa** las dos escenas que une, así que el video dura menos
que la suma de sus escenas. Ese cálculo vive entero en `transitions.ts`, y lo
usan la metadata de la composición, el Player del editor y la duración total de
la lista de escenas, para que los tres coincidan. Remotion no admite una
transición más larga que las escenas que une: la duración se recorta a la mitad
de la escena más corta de las dos, lo que solo se nota en escenas muy breves.

### `editor/` — el editor

Separado por capas: una ruta elige el ejemplo, la page compone tres secciones
y una capa de API.

```
editor/src/
├── App.tsx                         EL ROUTER: galería o editor de un ejemplo
├── examples/                       el catálogo de guiones de ejemplo
│   ├── index.ts                    registro: el orden define la ruta
│   ├── onboarding-comercial.ts     ejemplo 1 — escrito a mano
│   ├── seguridad-informacion.ts    ejemplo 2 — escrito a mano
│   ├── modulo-1-conceptos.ts       ejemplo 3 — generado desde los módulos
│   ├── modulo-2-instrumentos.ts    ejemplo 4 — generado
│   └── modulo-3-trabajo-de-campo.ts ejemplo 5 — generado
├── router/                         rutas sin dependencias externas
│   ├── routes.ts                   el mapa: /video-examples/:n
│   ├── useRoute.ts                 ruta actual (History API) y navigate
│   └── Link.tsx                    <a href> que navega sin recargar
├── gallery/                        LA HOME: los ejemplos disponibles
│   ├── ExamplesGallery.tsx         una tarjeta por ejemplo
│   ├── ExampleCover.tsx            portada: primera escena real del guion
│   └── NotFound.tsx                ruta o ejemplo inexistente
├── editor/
│   ├── EditorPage.tsx              LA PAGE: estado raíz + layout de 3 columnas
│   ├── EditorHeader.tsx            ajustes del video y botón "Generar video"
│   ├── state/                      el documento que se edita
│   │   ├── useSceneEditor.ts       escenas, settings, selección y operaciones
│   │   └── scene-factory.ts        crear/duplicar escenas y capas
│   ├── scenes-panel/               SECCIÓN: escenas (columna izquierda)
│   │   ├── ScenesPanel.tsx         lista, duración total, añadir escena
│   │   ├── SceneCard.tsx           una escena de la lista
│   │   ├── TransitionRow.tsx       la transición en el hueco entre dos escenas
│   │   └── SceneThumbnail.tsx      miniatura de una escena
│   ├── preview-panel/              SECCIÓN: vista previa (columna central)
│   │   ├── PreviewPanel.tsx        pestañas editar / preview / generado
│   │   ├── SceneCanvas.tsx         frame editable con overlays encima
│   │   ├── CanvasLayerOverlay.tsx  mover, redimensionar y editar capas
│   │   ├── InlineFieldEditor.tsx   edición de texto sobre el propio frame
│   │   ├── LogoOverlay.tsx         mover y escalar el logo del video
│   │   ├── ScenePlayer.tsx         reproducción real de la composición
│   │   ├── RenderedVideo.tsx       el .mp4 ya generado
│   │   └── SceneAudioPanel.tsx     audio y guion de la escena
│   ├── properties-panel/           SECCIÓN: propiedades (columna derecha)
│   │   ├── PropertiesPanel.tsx     propiedades de la escena o de la capa
│   │   ├── LayoutPicker.tsx        elegir layout de una escena canvas
│   │   ├── LayersList.tsx          orden y gestión de capas
│   │   └── VideoSettingsDialog.tsx ajustes globales: logo, subtítulos y
│   │                               transición por defecto
│   └── api/                        SECCIÓN: API para generar el video
│       ├── config.ts               URL del servidor de render
│       ├── render-api.ts           POST /api/render y polling del job
│       ├── useRenderJob.ts         estado del render: progreso, error, salida
│       └── upload-api.ts           POST /api/upload para la media local
├── components/
│   ├── ui/                         primitivas shadcn reutilizables
│   └── fields/                     campos reutilizables (color, media,
│                                   transición)
└── lib/                            utilidades (cn, etiquetas y formatos)
```

Nada fuera de `editor/api/` habla con el servidor de render, y nada fuera de
`editor/state/` modifica las escenas: las secciones reciben props y emiten
callbacks.

#### Las rutas

| Ruta | Qué abre |
|---|---|
| `/` | redirige visualmente a la galería |
| `/video-examples` | la galería con todos los ejemplos |
| `/video-examples/1` | Onboarding comercial — 30 días |
| `/video-examples/2` | Seguridad de la información |
| `/video-examples/3` | Topografía · Módulo 1 — Conceptos |
| `/video-examples/4` | Topografía · Módulo 2 — Instrumentos |
| `/video-examples/5` | Topografía · Módulo 3 — Trabajo de campo |
| `/video-examples/:n` | el editor con el ejemplo n |

El número de la URL es la posición en `examples/index.ts`, así que añadir un
ejemplo es empujar una entrada a ese array: la galería y la ruta salen solas.

```ts
export const videoExamples: VideoExample[] = [
  { title, description, video: onboardingComercial },   // /video-examples/1
  { title, description, video: seguridadInformacion },  // /video-examples/2
];
```

El editor se monta con `key={número}`: `useSceneEditor` lee su documento una
sola vez, al montar, así que cambiar de ejemplo lo remonta con el guion nuevo y
no arrastra las ediciones del anterior.

#### Ejemplos generados desde un curso

Los tres módulos de topografía no se escribieron a mano: salen de una carpeta
con el material del curso, una escena por línea de narración.

```bash
npm run build-module-examples [carpeta]   # por defecto ~/Downloads/Audios
```

El script espera esta forma, y el número de escena es lo que une las tres
piezas:

```
carpeta/
├── audio_m1/escena_N.mp3               la narración locutada
├── m1_fotografia/fotografia_N.png      la imagen de esa escena
└── narraciones_m1_subtitulos.txt       línea N = guion de la escena N
```

Por cada escena: el audio define la duración (su duración real más una cola de
0,4 s), la fotografía es la imagen y la línea de narración queda como `script`,
que con `subtitles: true` se ve como subtítulo. Si a una línea le falta el audio
o la fotografía, esa escena se omite con un aviso y el resto del módulo sigue
siendo un video válido.

La media se copia a `render-server/uploads/modulos/<módulo>/` — fuera de git,
igual que cualquier archivo subido desde el editor — y los ejemplos apuntan a
las URL que la sirven. **Estos tres ejemplos necesitan el servidor de render
arriba** para ver las fotos y oír el audio, no solo para generar el `.mp4`.

Los archivos generados llevan un encabezado que lo dice: se regeneran, no se
editan a mano.

Los alias evitan rutas relativas largas: `@/` apunta a `editor/src` y
`@video/` a `src/video`.

### `render-server/` — API de render

```
render-server/
├── server.ts             app Express: estáticos + monta los routers en /api
├── config.ts             puerto, rutas y la composición que se renderiza
├── bundler.ts            bundle de Remotion cacheado por mtime de src/
├── render-jobs.ts        cola en memoria: arranca el render y reporta progreso
├── routes/
│   ├── render.ts         POST /api/render · GET /api/render/:jobId
│   └── upload.ts         POST /api/upload
└── uploads/              media subida desde el editor (fuera de git)
```

Flujo al pulsar "Generar video":

1. `POST /api/render` con `{ scenes, settings }`; el servidor lo valida contra
   `DynamicVideoSchema` y devuelve un `jobId`.
2. El render corre en segundo plano sobre la composición `SceneEditor`.
3. El editor consulta `GET /api/render/:jobId` cada segundo hasta que termina.
4. El `.mp4` queda en `out/` y se sirve en `/out/<jobId>.mp4`.

La media que se sube desde el editor no viaja dentro del render: se sube antes a
`/api/upload` y en la escena solo queda la URL.
