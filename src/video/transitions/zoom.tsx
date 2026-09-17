import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

export type ZoomProps = {
  /** How far the scenes travel, as a fraction of the frame. */
  amount?: number;
};

const DEFAULT_AMOUNT = 0.18;

/**
 * A cross zoom: the camera keeps pushing forward through the cut. The scene on
 * its way out grows past the frame as it fades, and the one coming in starts
 * equally enlarged and settles back to its own size.
 *
 * Both scales stay at or above 1 on purpose. A scene scaled below 1 does not
 * cover the frame, and since the incoming scene is painted over the outgoing
 * one, its edges would show as a rectangle in the middle of the transition.
 *
 * `@remotion/transitions` ships zoom presentations of its own, but they are
 * WebGL shaders drawn through the HTML-in-Canvas API: the render needs
 * `--gl=swangle` and the browser needs Chrome 148+ with
 * `chrome://flags/#canvas-draw-element` enabled, which would break the
 * editor's preview for everyone else. Two CSS transforms get the same look
 * with none of that.
 */
const ZoomPresentation: React.FC<
  TransitionPresentationComponentProps<ZoomProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const amount = passedProps.amount ?? DEFAULT_AMOUNT;
  const isEntering = presentationDirection === "entering";

  const style: React.CSSProperties = useMemo(
    () => ({
      opacity: isEntering ? presentationProgress : 1 - presentationProgress,
      transform: isEntering
        ? `scale(${1 + amount * (1 - presentationProgress)})`
        : `scale(${1 + amount * presentationProgress})`,
    }),
    [amount, isEntering, presentationProgress],
  );

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const zoom = (
  props?: ZoomProps,
): TransitionPresentation<ZoomProps> => ({
  component: ZoomPresentation,
  props: props ?? {},
});
