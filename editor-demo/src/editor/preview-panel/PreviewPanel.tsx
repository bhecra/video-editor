import { useMemo } from "react";
import type {
  CanvasLayer,
  LogoSettings,
  Scene,
  VideoSettings,
} from "@video/schema/scene-schema";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { RenderState } from "../api/useRenderJob";
import { RenderedVideo } from "./RenderedVideo";
import { SceneAudioPanel } from "./SceneAudioPanel";
import { SceneCanvas } from "./SceneCanvas";
import { ScenePlayer } from "./ScenePlayer";

export type PreviewTab = "editar" | "preview" | "generado";
export type PreviewScope = "escena" | "completo";

type Props = {
  scenes: Scene[];
  scene: Scene;
  sceneIndex: number;
  settings: VideoSettings;
  selectedLayerId: string | null;
  activeTab: PreviewTab;
  onChangeTab: (tab: PreviewTab) => void;
  previewScope: PreviewScope;
  onChangePreviewScope: (scope: PreviewScope) => void;
  renderState: RenderState;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<CanvasLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, toIndex: number) => void;
  onChangeScene: (patch: Partial<Scene>) => void;
  onChangeLogo: (logo: LogoSettings) => void;
};

/**
 * Centre column: the three ways of looking at the video — editing the current
 * scene, playing it back, and the rendered file — plus its audio track.
 */
export const PreviewPanel: React.FC<Props> = ({
  scenes,
  scene,
  sceneIndex,
  settings,
  selectedLayerId,
  activeTab,
  onChangeTab,
  previewScope,
  onChangePreviewScope,
  renderState,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayer,
  onChangeScene,
  onChangeLogo,
}) => {
  const previewScenes = useMemo(
    () => (previewScope === "escena" ? [scene] : scenes),
    [previewScope, scene, scenes],
  );

  return (
    <Card className="flex flex-1 flex-col gap-0 overflow-hidden py-0 shadow-sm">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onChangeTab(v as PreviewTab)}
        className="flex flex-1 flex-col gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold">Vista previa</h2>
            <span className="text-xs text-muted-foreground">
              Escena {sceneIndex + 1}
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
              <SceneCanvas
                scene={scene}
                settings={settings}
                selectedLayerId={selectedLayerId}
                onSelectLayer={onSelectLayer}
                onUpdateLayer={onUpdateLayer}
                onDeleteLayer={onDeleteLayer}
                onReorderLayer={onReorderLayer}
                onChangeLogo={onChangeLogo}
              />
            </TabsContent>

            <TabsContent value="preview">
              <ScenePlayer
                scenes={previewScenes}
                settings={settings}
                playerKey={`${previewScope}-${scene.id}-${String(settings.subtitles)}`}
              />
            </TabsContent>

            <TabsContent value="generado">
              <RenderedVideo renderState={renderState} />
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
              onValueChange={(v) => v && onChangePreviewScope(v as PreviewScope)}
            >
              <ToggleGroupItem value="escena">Esta escena</ToggleGroupItem>
              <ToggleGroupItem value="completo">Video completo</ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>

        <SceneAudioPanel scene={scene} onChangeScene={onChangeScene} />
      </Tabs>
    </Card>
  );
};
