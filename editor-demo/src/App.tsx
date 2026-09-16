import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { DynamicVideo } from "../../src/scene-editor/DynamicVideo";
import { sampleOnboardingVideo } from "../../src/scene-editor/sample-data";
import type {
  CanvasLayer,
  CanvasScene,
  Scene,
} from "../../src/scene-editor/scene-schema";
import {
  canvasTemplates,
  createLayersForLayout,
} from "../../src/scene-editor/canvas-templates";
import { formatDuration, typeBadgeVariant, typeLabels } from "./lib/scene-meta";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { CanvasLayerOverlay } from "./components/CanvasLayerOverlay";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ScrollArea } from "./components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { cn } from "./lib/utils";

const FPS = 30;
const RENDER_SERVER_URL = "http://localhost:4000";

type RenderState =
  | { status: "idle" }
  | { status: "rendering"; progress: number }
  | { status: "done"; outputUrl: string }
  | { status: "error"; message: string };

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

export const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(sampleOnboardingVideo.scenes);
  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0].id);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"editar" | "generado">("editar");
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderState, setRenderState] = useState<RenderState>({
    status: "idle",
  });
  const playerRef = useRef<PlayerRef>(null);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId)!;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, []);

  const sceneStartFrames = useMemo(() => {
    const starts: Record<string, number> = {};
    let cursor = 0;
    for (const scene of scenes) {
      starts[scene.id] = cursor;
      cursor += Math.round(scene.durationInSeconds * FPS);
    }
    return starts;
  }, [scenes]);

  const totalSeconds = scenes.reduce((sum, s) => sum + s.durationInSeconds, 0);

  const handleSelectScene = (scene: Scene) => {
    setSelectedSceneId(scene.id);
    setSelectedLayerId(null);
    setActiveTab("editar");
    playerRef.current?.pause();
    playerRef.current?.seekTo(sceneStartFrames[scene.id] + 20);
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

  const handleGenerate = async () => {
    setRenderState({ status: "rendering", progress: 0 });

    try {
      const startRes = await fetch(`${RENDER_SERVER_URL}/api/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes }),
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
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div>
          <div className="text-base font-semibold">
            Onboarding comercial — 30 días
          </div>
          <div className="text-xs text-muted-foreground">
            Escenas ({scenes.length}) · {formatDuration(totalSeconds)} min en
            total
          </div>
        </div>
        <div className="flex items-center gap-4">
          {renderState.status === "rendering" && (
            <span className="font-mono text-xs text-muted-foreground">
              Renderizando… {Math.round(renderState.progress * 100)}%
            </span>
          )}
          {renderState.status === "error" && (
            <span className="max-w-xs text-xs text-destructive">
              {renderState.message}
            </span>
          )}
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

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r">
          <ScrollArea className="h-full p-3">
            <div className="flex flex-col gap-2">
              {scenes.map((scene, index) => {
                const isSelected = scene.id === selectedSceneId;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(scene)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-muted",
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        ESCENA {index + 1}
                      </span>
                      <Badge variant={typeBadgeVariant[scene.type]}>
                        {typeLabels[scene.type]}
                      </Badge>
                    </div>
                    <div className="mb-1 text-sm font-semibold">
                      {scene.name}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      0:{scene.durationInSeconds.toString().padStart(2, "0")}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        <main className="flex flex-1 items-center justify-center overflow-hidden p-8">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "editar" | "generado")}
            className="w-full max-w-4xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="editar">Editar</TabsTrigger>
                <TabsTrigger
                  value="generado"
                  disabled={renderState.status !== "done"}
                >
                  Video generado
                </TabsTrigger>
              </TabsList>
              {activeTab === "editar" && (
                <span className="text-xs text-muted-foreground">
                  {isPlaying
                    ? "Pausa para editar las capas"
                    : "Arrastra para mover · esquina para redimensionar · Supr para borrar"}
                </span>
              )}
            </div>
            <TabsContent value="editar">
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <Player
                  ref={playerRef}
                  component={DynamicVideo}
                  inputProps={{ scenes }}
                  durationInFrames={Math.round(totalSeconds * FPS)}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  fps={FPS}
                  style={{ width: "100%" }}
                  controls
                  loop
                />
                {!isPlaying && selectedScene.type === "canvas" && (
                  <CanvasLayerOverlay
                    scene={selectedScene}
                    selectedLayerId={selectedLayerId}
                    onSelectLayer={setSelectedLayerId}
                    onUpdateLayer={handleUpdateLayer}
                    onDeleteLayer={handleDeleteLayer}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="generado">
              {renderState.status === "done" ? (
                <video
                  src={renderState.outputUrl}
                  controls
                  className="w-full rounded-2xl shadow-lg"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
                  Aún no has generado un video. Dale a "Generar video".
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <aside className="w-80 border-l">
          <PropertiesPanel
            scene={selectedScene}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onChangeScene={handleChangeScene}
            onChangeLayout={handleChangeLayout}
            onUpdateLayer={handleUpdateLayer}
            onAddLayer={handleAddLayer}
            onDeleteLayer={handleDeleteLayer}
          />
        </aside>
      </div>
    </div>
  );
};
