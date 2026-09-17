import {
  linearTiming,
  type TransitionPresentation,
  type TransitionTiming,
} from "@remotion/transitions";
import { Easing } from "remotion";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type {
  Scene,
  SceneTransition,
  VideoSettings,
} from "../schema/scene-schema";
import { zoom } from "./zoom";

/**
 * Transitions overlap the two scenes they join, so the video is always shorter
 * than the sum of its scenes. Everything that needs a frame count — the
 * composition metadata, the editor's Player, the duration shown in the scene
 * list — resolves it here, so the preview and the render never disagree.
 */

/** The transition that plays before scene `index`, already clamped to frames. */
export type ResolvedTransition = {
  transition: SceneTransition;
  durationInFrames: number;
};

const sceneFrames = (scene: Scene, fps: number) =>
  Math.max(1, Math.round(scene.durationInSeconds * fps));

export const sceneDurationsInFrames = (scenes: Scene[], fps: number) =>
  scenes.map((scene) => sceneFrames(scene, fps));

const transitionFor = (
  scene: Scene,
  settings: VideoSettings | undefined,
): SceneTransition | null => {
  const transition = scene.transition ?? settings?.defaultTransition;
  if (!transition || transition.type === "none") return null;
  return transition;
};

/**
 * One entry per scene: the transition that brings it in, or null. The first
 * scene is always null — it has no scene to come from.
 *
 * Remotion refuses to render a transition longer than either scene it joins, so
 * the duration is capped at half of the shorter neighbour. That only bites on
 * very short scenes; at the usual lengths the configured duration survives
 * untouched.
 */
export const resolveTransitions = (
  scenes: Scene[],
  settings: VideoSettings | undefined,
  fps: number,
): (ResolvedTransition | null)[] => {
  const durations = sceneDurationsInFrames(scenes, fps);

  return scenes.map((scene, index) => {
    if (index === 0) return null;

    const transition = transitionFor(scene, settings);
    if (!transition) return null;

    const room = Math.floor(Math.min(durations[index - 1], durations[index]) / 2);
    const durationInFrames = Math.min(
      Math.round(transition.durationInSeconds * fps),
      room,
    );

    return durationInFrames < 1 ? null : { transition, durationInFrames };
  });
};

/** The video's real length: every scene, minus the overlap each transition eats. */
export const totalDurationInFrames = (
  scenes: Scene[],
  settings: VideoSettings | undefined,
  fps: number,
) => {
  const scenesTotal = sceneDurationsInFrames(scenes, fps).reduce(
    (sum, frames) => sum + frames,
    0,
  );
  const overlap = resolveTransitions(scenes, settings, fps).reduce(
    (sum, resolved) => sum + (resolved?.durationInFrames ?? 0),
    0,
  );

  return Math.max(1, scenesTotal - overlap);
};

export const totalDurationInSeconds = (
  scenes: Scene[],
  settings: VideoSettings | undefined,
  fps: number,
) => totalDurationInFrames(scenes, settings, fps) / fps;

export const transitionTiming = (
  resolved: ResolvedTransition,
): TransitionTiming =>
  linearTiming({
    durationInFrames: resolved.durationInFrames,
    // The zoom moves the frame, and a constant rate reads as mechanical on
    // movement. The rest are cross-fades, where linear is what you want.
    easing:
      resolved.transition.type === "zoom"
        ? Easing.inOut(Easing.ease)
        : undefined,
  });

/**
 * The presentation component for a transition. `clock-wipe` and `iris` mask the
 * frame with a shape, so they need the composition's size.
 */
export const transitionPresentation = (
  transition: SceneTransition,
  dimensions: { width: number; height: number },
): TransitionPresentation<Record<string, unknown>> => {
  const direction = transition.direction ?? "from-right";

  const presentation = (() => {
    switch (transition.type) {
      case "zoom":
        return zoom();
      case "slide":
        return slide({ direction });
      case "wipe":
        return wipe({ direction });
      case "flip":
        return flip({ direction });
      case "clock-wipe":
        return clockWipe(dimensions);
      case "iris":
        return iris(dimensions);
      case "fade":
      default:
        return fade();
    }
  })();

  return presentation as TransitionPresentation<Record<string, unknown>>;
};
