import { Fragment } from "react";
import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Img, useVideoConfig } from "remotion";
import {
  defaultSubtitleStyle,
  type DynamicVideoProps,
  type SubtitleStyle,
} from "./schema/scene-schema";
import { SceneRenderer } from "./renderers/SceneRenderer";
import {
  logoBackdropStyle,
  logoBoxStyle,
  logoMarkStyle,
  logoPlacementStyle,
  subtitleScrimStyle,
  subtitleTextStyle,
} from "./theme/canvas-styles";
import {
  resolveTransitions,
  sceneDurationsInFrames,
  transitionPresentation,
  transitionTiming,
} from "./transitions";

const Subtitle: React.FC<{ text: string; style?: SubtitleStyle }> = ({
  text,
  style,
}) => {
  const resolved = style ?? defaultSubtitleStyle;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={subtitleScrimStyle(resolved)}>
        <div style={subtitleTextStyle(resolved)}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

export const DynamicVideo: React.FC<DynamicVideoProps> = ({
  scenes,
  settings,
}) => {
  const { fps, width, height } = useVideoConfig();
  const logo = settings?.logo;

  // A TransitionSeries with no transitions between its sequences behaves
  // exactly like a Series, so the same tree covers both cases.
  // The plate's padding and radius are a % of the logo, so they need the
  // width the logo is actually drawn at.
  const logoWidthPx = logo ? (logo.w / 100) * width : 0;
  const durations = sceneDurationsInFrames(scenes, fps);
  const transitions = resolveTransitions(scenes, settings, fps);

  return (
    <AbsoluteFill>
      <TransitionSeries>
        {scenes.map((scene, index) => {
          const transition = transitions[index];

          return (
            <Fragment key={scene.id}>
              {transition && (
                <TransitionSeries.Transition
                  timing={transitionTiming(transition)}
                  presentation={transitionPresentation(transition.transition, {
                    width,
                    height,
                  })}
                />
              )}
              <TransitionSeries.Sequence
                name={scene.name}
                durationInFrames={durations[index]}
              >
                <SceneRenderer scene={scene} />
                {settings?.subtitles && scene.script && (
                  <Subtitle text={scene.script} style={settings.subtitleStyle} />
                )}
                {scene.audioUrl && (
                  <Audio
                    src={scene.audioUrl}
                    volume={() => scene.audioVolume ?? 1}
                  />
                )}
              </TransitionSeries.Sequence>
            </Fragment>
          );
        })}
      </TransitionSeries>

      {/* Sits outside the series so it stays on screen for every scene, and so
          transitions move the scenes underneath it rather than the logo. */}
      {logo && (
        <div style={logoPlacementStyle(logo)}>
          <div style={logoBoxStyle(logo, logoWidthPx)}>
            {logo.background && (
              <div style={logoBackdropStyle(logo, logoWidthPx)} />
            )}
            <Img src={logo.src} style={logoMarkStyle(logo)} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
