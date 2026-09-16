import { useCallback, useState } from "react";
import { sampleOnboardingVideo } from "@video/schema/sample-data";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRenderJob } from "./api/useRenderJob";
import { EditorHeader } from "./EditorHeader";
import {
  PreviewPanel,
  type PreviewScope,
  type PreviewTab,
} from "./preview-panel/PreviewPanel";
import { PropertiesPanel } from "./properties-panel/PropertiesPanel";
import { ScenesPanel } from "./scenes-panel/ScenesPanel";
import { useSceneEditor } from "./state/useSceneEditor";

const VIDEO_TITLE = "Onboarding comercial — 30 días";

/**
 * The page: owns the document state (useSceneEditor) and the render job, and
 * lays out the three columns — scenes, preview, properties.
 */
export const EditorPage: React.FC = () => {
  const editor = useSceneEditor(sampleOnboardingVideo);
  const [activeTab, setActiveTab] = useState<PreviewTab>("editar");
  const [previewScope, setPreviewScope] = useState<PreviewScope>("escena");

  const showGenerated = useCallback(() => setActiveTab("generado"), []);
  const { renderState, generate } = useRenderJob({ onDone: showGenerated });

  const handleGenerate = () =>
    void generate({ scenes: editor.scenes, settings: editor.settings });

  // Adding or copying a scene selects it, so the editing tab is what to show.
  const editNewScene = <T,>(action: (arg: T) => void) => (arg: T) => {
    action(arg);
    setActiveTab("editar");
  };

  return (
    <TooltipProvider>
      <div className="ia-glow-orbs flex h-screen flex-col text-foreground">
        <EditorHeader
          title={VIDEO_TITLE}
          settings={editor.settings}
          onChangeSettings={editor.patchSettings}
          renderState={renderState}
          onGenerate={handleGenerate}
        />

        {/* pt-1 leaves room for the cards' ring, which is painted outside their
            box and would otherwise be clipped by overflow-hidden. */}
        <div className="flex flex-1 gap-4 overflow-hidden px-4 pt-1 pb-4">
          <ScenesPanel
            scenes={editor.scenes}
            selectedSceneId={editor.selectedSceneId}
            totalSeconds={editor.totalSeconds}
            onSelectScene={editor.selectScene}
            onAddScene={editNewScene(editor.addScene)}
            onDuplicateScene={editNewScene(editor.copyScene)}
            onDeleteScene={editor.deleteScene}
          />

          <PreviewPanel
            scenes={editor.scenes}
            scene={editor.selectedScene}
            sceneIndex={editor.scenes.indexOf(editor.selectedScene)}
            settings={editor.settings}
            selectedLayerId={editor.selectedLayerId}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            previewScope={previewScope}
            onChangePreviewScope={setPreviewScope}
            renderState={renderState}
            onSelectLayer={editor.selectLayer}
            onUpdateLayer={editor.updateLayer}
            onDeleteLayer={editor.deleteLayer}
            onReorderLayer={editor.reorderLayer}
            onChangeScene={editor.changeScene}
            onChangeLogo={(logo) => editor.patchSettings({ logo })}
          />

          <Card className="flex w-80 flex-col gap-0 overflow-hidden py-0 shadow-sm">
            <PropertiesPanel
              scene={editor.selectedScene}
              selectedLayerId={editor.selectedLayerId}
              onSelectLayer={editor.selectLayer}
              onChangeScene={editor.changeScene}
              onChangeLayout={editor.changeLayout}
              onUpdateLayer={editor.updateLayer}
              onAddLayer={editor.addLayer}
              onDeleteLayer={editor.deleteLayer}
              onReorderLayer={editor.reorderLayer}
            />
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
