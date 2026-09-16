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
ni un servidor, y tampoco contiene contenido — el guion de ejemplo vive en el
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
    ├── calculate-metadata.ts       duración derivada de las escenas
    ├── renderers/                  cómo se pinta cada tipo de escena
    │   ├── SceneRenderer.tsx       despacha por scene.type
    │   ├── CanvasSceneRenderer.tsx capas: texto, imagen, forma, badge, lista…
    │   └── MediaSceneRenderer.tsx  escenas de imagen, video y avatar
    ├── schema/                     el contrato compartido
    │   ├── scene-schema.ts         esquemas zod + tipos de escena y capa
    │   └── layer-fields.ts         leer/escribir un campo de una capa
    └── theme/                      apariencia
        ├── canvas-styles.ts        estilos de fondo, texto y subtítulos
        ├── canvas-templates.ts     layouts predefinidos y sus capas
        └── fonts.ts                fuentes cargadas para el render
```

Hay una sola composición registrada, `SceneEditor`. El editor y el servidor le
pasan las escenas como `inputProps`, así que lo que se ve en la vista previa es
exactamente lo que sale renderizado.

### `editor/` — el editor

Separado por capas: la page compone tres secciones y una capa de API.

```
editor/src/
├── App.tsx                         monta EditorPage
├── editor/
│   ├── EditorPage.tsx              LA PAGE: estado raíz + layout de 3 columnas
│   ├── EditorHeader.tsx            ajustes del video y botón "Generar video"
│   ├── state/                      el documento que se edita
│   │   ├── useSceneEditor.ts       escenas, settings, selección y operaciones
│   │   ├── scene-factory.ts        crear/duplicar escenas y capas
│   │   └── sample-video.ts         el guion con el que abre el editor
│   ├── scenes-panel/               SECCIÓN: escenas (columna izquierda)
│   │   ├── ScenesPanel.tsx         lista, duración total, añadir escena
│   │   └── SceneCard.tsx           una escena de la lista
│   ├── preview-panel/              SECCIÓN: vista previa (columna central)
│   │   ├── PreviewPanel.tsx        pestañas editar / preview / generado
│   │   ├── SceneCanvas.tsx         frame editable con overlays encima
│   │   ├── CanvasLayerOverlay.tsx  mover, redimensionar y editar capas
│   │   ├── InlineFieldEditor.tsx   edición de texto sobre el propio frame
│   │   ├── LogoOverlay.tsx         arrastrar el logo del video
│   │   ├── ScenePlayer.tsx         reproducción real de la composición
│   │   ├── RenderedVideo.tsx       el .mp4 ya generado
│   │   └── SceneAudioPanel.tsx     audio y guion de la escena
│   ├── properties-panel/           SECCIÓN: propiedades (columna derecha)
│   │   ├── PropertiesPanel.tsx     propiedades de la escena o de la capa
│   │   ├── LayoutPicker.tsx        elegir layout de una escena canvas
│   │   ├── LayersList.tsx          orden y gestión de capas
│   │   └── VideoSettingsDialog.tsx ajustes globales: logo y subtítulos
│   └── api/                        SECCIÓN: API para generar el video
│       ├── config.ts               URL del servidor de render
│       ├── render-api.ts           POST /api/render y polling del job
│       ├── useRenderJob.ts         estado del render: progreso, error, salida
│       └── upload-api.ts           POST /api/upload para la media local
├── components/
│   ├── ui/                         primitivas shadcn reutilizables
│   └── fields/                     campos reutilizables (color, media)
└── lib/                            utilidades (cn, etiquetas y formatos)
```

Nada fuera de `editor/api/` habla con el servidor de render, y nada fuera de
`editor/state/` modifica las escenas: las secciones reciben props y emiten
callbacks.

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
