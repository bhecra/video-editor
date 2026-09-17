import { useCallback, useState } from "react";
import {
  defaultVideoSettings,
  type CanvasLayer,
  type CanvasScene,
  type DynamicVideoProps,
  type Scene,
  type SceneTransition,
  type VideoSettings,
} from "@video/schema/scene-schema";
import { canvasTemplates, createLayersForLayout } from "@video/theme/canvas-templates";
import { totalDurationInSeconds } from "@video/transitions";
import { FPS } from "@video/video-config";
import { createLayer, createScene, duplicateScene } from "./scene-factory";

/**
 * The editor's document: the scene list, the video-wide settings and the
 * current selection, plus every operation the panels can run on them. The UI
 * layers below only receive the slices they need.
 */
export const useSceneEditor = (initial: DynamicVideoProps) => {
  const [scenes, setScenes] = useState<Scene[]>(initial.scenes);
  const [settings, setSettings] = useState<VideoSettings>(
    initial.settings ?? defaultVideoSettings,
  );
  const [selectedSceneId, setSelectedSceneId] = useState(initial.scenes[0].id);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const selectedScene =
    scenes.find((s) => s.id === selectedSceneId) ?? scenes[0];
  // Transitions overlap the scenes they join, so this is not the plain sum of
  // the scene durations.
  const totalSeconds = totalDurationInSeconds(scenes, settings, FPS);

  const patchSettings = useCallback(
    (patch: Partial<VideoSettings>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    [],
  );

  const selectScene = useCallback((id: string) => {
    setSelectedSceneId(id);
    setSelectedLayerId(null);
  }, []);

  const insertAfterSelected = useCallback(
    (scene: Scene) => {
      setScenes((prev) => {
        const at = prev.findIndex((s) => s.id === selectedSceneId);
        const next = [...prev];
        next.splice(at + 1, 0, scene);
        return next;
      });
      setSelectedSceneId(scene.id);
      setSelectedLayerId(null);
    },
    [selectedSceneId],
  );

  const addScene = useCallback(
    (type: Scene["type"]) => insertAfterSelected(createScene(type)),
    [insertAfterSelected],
  );

  const copyScene = useCallback(
    (scene: Scene) => insertAfterSelected(duplicateScene(scene)),
    [insertAfterSelected],
  );

  const deleteScene = useCallback(
    (id: string) => {
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
    },
    [scenes, selectedSceneId],
  );

  /**
   * The transition into `sceneId` — the one that joins it to the scene before
   * it. Unlike the other scene edits this one takes an id, because it is driven
   * from the gaps in the scene list rather than from the current selection.
   * `undefined` falls back to the video's default transition; a transition of
   * type "none" pins the cut.
   */
  const setSceneTransition = useCallback(
    (sceneId: string, transition: SceneTransition | undefined) => {
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, transition } : s)),
      );
    },
    [],
  );

  const patchScene = useCallback(
    (updater: (scene: Scene) => Scene) => {
      setScenes((prev) =>
        prev.map((s) => (s.id === selectedSceneId ? updater(s) : s)),
      );
    },
    [selectedSceneId],
  );

  const changeScene = useCallback(
    (patch: Partial<Scene>) => patchScene((s) => ({ ...s, ...patch }) as Scene),
    [patchScene],
  );

  // Switching layout swaps the whole layer set for that template's own layers.
  const changeLayout = useCallback(
    (layout: CanvasScene["layout"]) => {
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
    },
    [patchScene],
  );

  const addLayer = useCallback(
    (type: CanvasLayer["type"]) => {
      const layer = createLayer(type);
      patchScene((s) =>
        s.type === "canvas" ? { ...s, layers: [...s.layers, layer] } : s,
      );
      setSelectedLayerId(layer.id);
    },
    [patchScene],
  );

  const updateLayer = useCallback(
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

  const deleteLayer = useCallback(
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
  const reorderLayer = useCallback(
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

  return {
    scenes,
    settings,
    selectedScene,
    selectedSceneId,
    selectedLayerId,
    totalSeconds,
    patchSettings,
    selectScene,
    addScene,
    copyScene,
    deleteScene,
    changeScene,
    changeLayout,
    setSceneTransition,
    selectLayer: setSelectedLayerId,
    addLayer,
    updateLayer,
    deleteLayer,
    reorderLayer,
  };
};

export type SceneEditor = ReturnType<typeof useSceneEditor>;
