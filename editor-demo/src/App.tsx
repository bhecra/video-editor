import { useCallback, useMemo, useState } from "react";
import { Player, Thumbnail } from "@remotion/player";
import { DynamicVideo } from "../../src/scene-editor/DynamicVideo";
import { sampleOnboardingVideo } from "../../src/scene-editor/sample-data";
import {
  defaultVideoSettings,
  type CanvasLayer,
  type CanvasScene,
  type LogoSettings,
  type Scene,
  type VideoSettings,
} from "../../src/scene-editor/scene-schema";
import {
  canvasTemplates,
  createLayersForLayout,
} from "../../src/scene-editor/canvas-templates";
import { Copy, MoreVertical, Plus, Trash2 } from "lucide-react";
import { formatDuration, typeLabels } from "./lib/scene-meta";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { CanvasLayerOverlay } from "./components/CanvasLayerOverlay";
import { SceneAudioPanel } from "./components/SceneAudioPanel";
import { VideoSettingsDialog } from "./components/VideoSettingsDialog";
import { LogoOverlay } from "./components/LogoOverlay";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Card } from "./components/ui/card";
import { Alert, AlertDescription } from "./components/ui/alert";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { TooltipProvider } from "./components/ui/tooltip";
import { cn } from "./lib/utils";

const FPS = 30;
const RENDER_SERVER_URL = "http://localhost:4000";

type RenderState =
  | { status: "idle" }
  | { status: "rendering"; progress: number }
  | { status: "done"; outputUrl: string }
  | { status: "error"; message: string };

// Layers fade in staggered by index, so the editing surface is shown at a
// frame where every animation has already settled.
const settledFrame = (scene: Scene) => {
  const layerCount = scene.type === "canvas" ? scene.layers.length : 1;
  const lastStart = (layerCount - 1) * 4;
  const maxFrame = Math.round(scene.durationInSeconds * FPS) - 1;
  return Math.min(lastStart + 20, maxFrame);
};

const newLayer = (type: CanvasLayer["type"]): CanvasLayer => {
  const box = { id: `${type}-${Date.now()}`, x: 30, y: 40, w: 36, h: 18 };
  switch (type) {
    case "text":
      return { ...box, type: "text", variant: "body", text: "Nuevo texto" };
    case "image":
      return {
        ...box,
        type: "image",
        src: "https://picsum.photos/seed/nueva/1200/1200",
        h: 40,
      };
    case "shape":
      return { ...box, type: "shape", fill: "accent" };
    case "badge":
      return { ...box, type: "badge", title: "Badge", subtitle: "Subtítulo", h: 14 };
    case "list":
      return {
        ...box,
        type: "list",
        ordered: true,
        items: ["Primer item", "Segundo item"],
        h: 32,
      };
    case "stat":
      return { ...box, type: "stat", value: "100", label: "Métrica", h: 30 };
    case "quote":
      return { ...box, type: "quote", quote: "Nueva cita", author: "Autor", h: 30 };
  }
};

const DEFAULT_CLIP = "https://remotion.media/first-frame-at-4sec.webm";

const newScene = (type: Scene["type"]): Scene => {
  const id = `scene-${Date.now()}`;
  switch (type) {
    case "canvas":
      return {
        id,
        name: "Nueva escena",
        type: "canvas",
        layout: "una-columna",
        durationInSeconds: 6,
        accentColor: "#1a6bff",
        background: canvasTemplates["una-columna"].background,
        layers: createLayersForLayout("una-columna"),
      };
    case "imagen":
      return {
        id,
        name: "Nueva imagen",
        type: "imagen",
        durationInSeconds: 5,
        imageUrl: "https://picsum.photos/seed/nueva-escena/1920/1080",
      };
    case "video":
      return {
        id,
        name: "Nuevo video",
        type: "video",
        durationInSeconds: 5,
        videoUrl: DEFAULT_CLIP,
      };
    case "avatar":
      return {
        id,
        name: "Nuevo avatar",
        type: "avatar",
        durationInSeconds: 5,
        videoUrl: DEFAULT_CLIP,
      };
  }
};

// Layer ids have to be regenerated so the copy can be selected independently.
const duplicateScene = (scene: Scene): Scene => {
  const suffix = Math.random().toString(36).slice(2, 7);
  const copy = {
    ...scene,
    id: `${scene.id}-copy-${suffix}`,
    name: `${scene.name} (copia)`,
  };
  return copy.type === "canvas"
    ? {
        ...copy,
        layers: copy.layers.map((l) => ({ ...l, id: `${l.id}-${suffix}` })),
      }
    : copy;
};

export const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(sampleOnboardingVideo.scenes);
  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0].id);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"editar" | "preview" | "generado">(
    "editar",
  );
  const [previewScope, setPreviewScope] = useState<"escena" | "completo">(
    "escena",
  );
  const [settings, setSettings] = useState<VideoSettings>(
    sampleOnboardingVideo.settings ?? defaultVideoSettings,
  );
  const [renderState, setRenderState] = useState<RenderState>({
    status: "idle",
  });

  const patchSettings = (patch: Partial<VideoSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const selectedScene =
    scenes.find((s) => s.id === selectedSceneId) ?? scenes[0];

  const totalSeconds = scenes.reduce((sum, s) => sum + s.durationInSeconds, 0);

  const previewScenes = useMemo(
    () => (previewScope === "escena" ? [selectedScene] : scenes),
    [previewScope, selectedScene, scenes],
  );
  const previewSeconds = previewScenes.reduce(
    (sum, s) => sum + s.durationInSeconds,
    0,
  );

  const handleSelectScene = (scene: Scene) => {
    setSelectedSceneId(scene.id);
    setSelectedLayerId(null);
  };

  const insertAfterSelected = (scene: Scene) => {
    setScenes((prev) => {
      const at = prev.findIndex((s) => s.id === selectedSceneId);
      const next = [...prev];
      next.splice(at + 1, 0, scene);
      return next;
    });
    setSelectedSceneId(scene.id);
    setSelectedLayerId(null);
    setActiveTab("editar");
  };

  const handleAddScene = (type: Scene["type"]) => insertAfterSelected(newScene(type));

  const handleDuplicateScene = (scene: Scene) =>
    insertAfterSelected(duplicateScene(scene));

  const handleDeleteScene = (id: string) => {
    if (scenes.length === 1) return;
    const at = scenes.findIndex((s) => s.id === id);
    const next = scenes.filter((s) => s.id !== id);
    // Both updates have to be siblings: nesting setSelectedSceneId inside the
    // setScenes updater lets React drop it, leaving the selection dangling.
    setScenes(next);
    if (id === selectedSceneId) {
      setSelectedSceneId(next[Math.min(at, next.length - 1)].id);
      setSelectedLayerId(null);
    }
  };

  const patchScene = useCallback(
    (updater: (scene: Scene) => Scene) => {
      setScenes((prev) =>
        prev.map((s) => (s.id === selectedSceneId ? updater(s) : s)),
      );
    },
    [selectedSceneId],
  );

  const handleChangeScene = (patch: Partial<Scene>) => {
    patchScene((s) => ({ ...s, ...patch }) as Scene);
  };

  const handleChangeLayout = (layout: CanvasScene["layout"]) => {
    patchScene((s) =>
      s.type === "canvas"
        ? {
            ...s,
            layout,
            background: canvasTemplates[layout].background,
            layers: createLayersForLayout(layout),
          }
        : s,
    );
    setSelectedLayerId(null);
  };

  const handleUpdateLayer = useCallback(
    (id: string, patch: Partial<CanvasLayer>) => {
      patchScene((s) =>
        s.type === "canvas"
          ? {
              ...s,
              layers: s.layers.map((l) =>
                l.id === id ? ({ ...l, ...patch } as CanvasLayer) : l,
              ),
            }
          : s,
      );
    },
    [patchScene],
  );

  const handleAddLayer = (type: CanvasLayer["type"]) => {
    const layer = newLayer(type);
    patchScene((s) =>
      s.type === "canvas" ? { ...s, layers: [...s.layers, layer] } : s,
    );
    setSelectedLayerId(layer.id);
  };

  const handleDeleteLayer = useCallback(
    (id: string) => {
      patchScene((s) =>
        s.type === "canvas"
          ? { ...s, layers: s.layers.filter((l) => l.id !== id) }
          : s,
      );
      setSelectedLayerId((cur) => (cur === id ? null : cur));
    },
    [patchScene],
  );

  // Array order is paint order: the last layer is the front-most one.
  const handleReorderLayer = useCallback(
    (id: string, toIndex: number) => {
      patchScene((s) => {
        if (s.type !== "canvas") return s;
        const from = s.layers.findIndex((l) => l.id === id);
        if (from < 0) return s;
        const target = Math.max(0, Math.min(s.layers.length - 1, toIndex));
        if (target === from) return s;
        const layers = [...s.layers];
        const [moved] = layers.splice(from, 1);
        layers.splice(target, 0, moved);
        return { ...s, layers };
      });
    },
    [patchScene],
  );

  const handleGenerate = async () => {
    setRenderState({ status: "rendering", progress: 0 });

    try {
      const startRes = await fetch(`${RENDER_SERVER_URL}/api/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes, settings }),
      });
      if (!startRes.ok) {
        throw new Error(`El servidor de render respondió ${startRes.status}`);
      }
      const { jobId } = await startRes.json();

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const progressRes = await fetch(
          `${RENDER_SERVER_URL}/api/render/${jobId}`,
        );
        const job = await progressRes.json();

        if (job.status === "error") {
          setRenderState({ status: "error", message: job.error });
          return;
        }
        if (job.status === "done") {
          setRenderState({
            status: "done",
            outputUrl: `${RENDER_SERVER_URL}${job.outputFile}`,
          });
          setActiveTab("generado");
          return;
        }
        setRenderState({ status: "rendering", progress: job.progress ?? 0 });
      }
    } catch (err) {
      setRenderState({
        status: "error",
        message:
          err instanceof Error
            ? `${err.message} — ¿está corriendo "npm run render-server"?`
            : String(err),
      });
    }
  };

  return (
    <TooltipProvider>
    <div className="ia-glow-orbs flex h-screen flex-col text-foreground">
      <header className="flex items-center justify-between px-5 py-3">
        <div className="text-base font-semibold">
          Onboarding comercial — 30 días
        </div>
        <div className="flex items-center gap-4">
          {renderState.status === "rendering" && (
            <span className="font-mono text-xs text-muted-foreground">
              Renderizando… {Math.round(renderState.progress * 100)}%
            </span>
          )}
          {renderState.status === "error" && (
            <Alert variant="destructive" className="max-w-sm py-2">
              <AlertDescription className="text-xs">
                {renderState.message}
              </AlertDescription>
            </Alert>
          )}
          <VideoSettingsDialog settings={settings} onChange={patchSettings} />
          <Button
            onClick={handleGenerate}
            disabled={renderState.status === "rendering"}
          >
            {renderState.status === "rendering"
              ? "Generando…"
              : "Generar video"}
          </Button>
        </div>
      </header>

      {/* pt-1 leaves room for the cards' ring, which is painted outside their
          box and would otherwise be clipped by overflow-hidden. */}
      <div className="flex flex-1 gap-4 overflow-hidden px-4 pt-1 pb-4">
        <Card className="flex w-72 flex-col gap-0 py-0 shadow-sm">
          <div className="flex items-baseline gap-2 border-b px-4 py-3">
            <h2 className="text-sm font-semibold">
              Escenas ({scenes.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              {formatDuration(totalSeconds)} min en total
            </span>
          </div>
          <ScrollArea className="min-h-0 flex-1 p-2">
            <div className="flex flex-col gap-1">
              {scenes.map((scene, index) => {
                const isSelected = scene.id === selectedSceneId;
                return (
                  <div
                    key={scene.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectScene(scene)}
                    className={cn(
                      "group cursor-pointer rounded-lg border-l-2 px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "border-l-primary bg-primary/5"
                        : "border-l-transparent hover:bg-muted",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        ESCENA {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">
                          {typeLabels[scene.type]}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              aria-label="Opciones de escena"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDuplicateScene(scene)}
                            >
                              <Copy />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={scenes.length === 1}
                              onClick={() => handleDeleteScene(scene.id)}
                            >
                              <Trash2 />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{scene.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      0:{scene.durationInSeconds.toString().padStart(2, "0")}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="border-t p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus />
                  Añadir escena
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                {(["canvas", "imagen", "video", "avatar"] as const).map((t) => (
                  <DropdownMenuItem key={t} onClick={() => handleAddScene(t)}>
                    {typeLabels[t]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>

        <Card className="flex flex-1 flex-col gap-0 overflow-hidden py-0 shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab(v as "editar" | "preview" | "generado")
            }
            className="flex flex-1 flex-col gap-0 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm font-semibold">Vista previa</h2>
                <span className="text-xs text-muted-foreground">
                  Escena {scenes.indexOf(selectedScene) + 1}
                </span>
              </div>
              <TabsList>
                <TabsTrigger value="editar">Editar</TabsTrigger>
                <TabsTrigger value="preview">Vista previa</TabsTrigger>
                <TabsTrigger
                  value="generado"
                  disabled={renderState.status !== "done"}
                >
                  Video generado
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto p-6">
              <div className="w-full max-w-3xl">

            <TabsContent value="editar">
              <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10">
                <Thumbnail
                  component={DynamicVideo}
                  inputProps={{ scenes: [selectedScene], settings }}
                  frameToDisplay={settledFrame(selectedScene)}
                  durationInFrames={Math.round(
                    selectedScene.durationInSeconds * FPS,
                  )}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  fps={FPS}
                  style={{ width: "100%" }}
                />
                {settings.logo && (
                  <LogoOverlay
                    logo={settings.logo}
                    onChange={(logo: LogoSettings) => patchSettings({ logo })}
                  />
                )}
                {selectedScene.type === "canvas" && (
                  <CanvasLayerOverlay
                    scene={selectedScene}
                    selectedLayerId={selectedLayerId}
                    onSelectLayer={setSelectedLayerId}
                    onUpdateLayer={handleUpdateLayer}
                    onDeleteLayer={handleDeleteLayer}
                    onReorderLayer={handleReorderLayer}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                <Player
                  key={previewScope + selectedScene.id + String(settings.subtitles)}
                  component={DynamicVideo}
                  inputProps={{ scenes: previewScenes, settings }}
                  durationInFrames={Math.round(previewSeconds * FPS)}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  fps={FPS}
                  style={{ width: "100%" }}
                  controls
                  loop
                />
              </div>
            </TabsContent>

            <TabsContent value="generado">
              {renderState.status === "done" ? (
                <video
                  src={renderState.outputUrl}
                  controls
                  className="w-full rounded-xl"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                  Aún no has generado un video. Dale a "Generar video".
                </div>
              )}
            </TabsContent>
              </div>

              {activeTab === "editar" && (
                <span className="text-xs text-muted-foreground">
                  Arrastra para mover · esquina para redimensionar · Supr para
                  borrar
                </span>
              )}

              {activeTab === "preview" && (
                <ToggleGroup
                  type="single"
                  size="sm"
                  value={previewScope}
                  onValueChange={(v) =>
                    v && setPreviewScope(v as "escena" | "completo")
                  }
                >
                  <ToggleGroupItem value="escena">Esta escena</ToggleGroupItem>
                  <ToggleGroupItem value="completo">
                    Video completo
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>

            <SceneAudioPanel
              scene={selectedScene}
              onChangeScene={handleChangeScene}
            />
          </Tabs>
        </Card>

        <Card className="flex w-80 flex-col gap-0 overflow-hidden py-0 shadow-sm">
          <PropertiesPanel
            scene={selectedScene}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onChangeScene={handleChangeScene}
            onChangeLayout={handleChangeLayout}
            onUpdateLayer={handleUpdateLayer}
            onAddLayer={handleAddLayer}
            onDeleteLayer={handleDeleteLayer}
            onReorderLayer={handleReorderLayer}
          />
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
};
