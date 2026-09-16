import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ReactNode } from "react";
import type { CanvasLayer, CanvasScene } from "./scene-schema";
import { interFont, monoFont, openSansFont } from "./fonts";
import {
  backgroundStyle,
  isDarkBackground,
  shapeFillColor,
  textStyles,
} from "./canvas-styles";

const LayerBox: React.FC<{
  layer: CanvasLayer;
  index: number;
  children: ReactNode;
}> = ({ layer, index, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = index * 4;
  const end = start + 0.6 * fps;

  return (
    <div
      // The editor locates each layer and its editable fields through these
      // attributes, so inline editing never needs to duplicate this layout.
      data-layer-id={layer.id}
      style={{
        position: "absolute",
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        width: `${layer.w}%`,
        height: `${layer.h}%`,
        rotate: layer.rotation ? `${layer.rotation}deg` : undefined,
        opacity: interpolate(frame, [start, end], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate:
          interpolate(frame, [start, end], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }) + "px 0px",
      }}
    >
      {children}
    </div>
  );
};

const LayerContent: React.FC<{
  layer: CanvasLayer;
  scene: CanvasScene;
}> = ({ layer, scene }) => {
  const onDark = isDarkBackground(scene.background);

  switch (layer.type) {
    case "text":
      return (
        <div
          data-field="text"
          style={{
            ...textStyles(layer.variant, onDark),
            ...(layer.color ? { color: layer.color } : {}),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {layer.text}
        </div>
      );

    case "image":
      return (
        <CanvasImage
          src={layer.src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 24,
          }}
        />
      );

    case "shape":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 24,
            backgroundColor:
              layer.color ?? shapeFillColor(layer.fill, scene.accentColor),
            opacity: !layer.color && layer.fill === "white" ? 0.9 : 1,
          }}
        />
      );

    case "badge":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
            padding: "20px 28px",
            borderRadius: 16,
            backgroundColor: "rgba(4,16,31,0.72)",
          }}
        >
          <div
            data-field="title"
            style={{
              fontFamily: interFont,
              fontWeight: 700,
              fontSize: 30,
              color: "#ffffff",
            }}
          >
            {layer.title}
          </div>
          {layer.subtitle && (
            <div
              data-field="subtitle"
              style={{
                fontFamily: openSansFont,
                fontWeight: 400,
                fontSize: 22,
                color: "#cadeff",
              }}
            >
              {layer.subtitle}
            </div>
          )}
        </div>
      );

    case "list":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {layer.items.map((item, i) => (
            <div
              key={`${item}-${i}`}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  flexShrink: 0,
                  borderRadius: 999,
                  backgroundColor: scene.accentColor,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: monoFont,
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                {layer.ordered ? i + 1 : "•"}
              </div>
              <div
                data-field={`items.${i}`}
                style={{
                  fontFamily: openSansFont,
                  fontWeight: 400,
                  fontSize: 30,
                  color: onDark ? "#ffffff" : "#2a303f",
                }}
              >
                {item}
              </div>
            </div>
          ))}
        </div>
      );

    case "stat":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            borderRadius: 24,
            border: onDark ? "none" : "1px solid #d0d2d5",
            backgroundColor: onDark ? "rgba(255,255,255,0.06)" : "#ffffff",
            boxShadow: onDark ? "none" : "0 8px 24px rgba(4,16,31,0.15)",
          }}
        >
          {layer.label && (
            <div
              data-field="label"
              style={{
                fontFamily: interFont,
                fontWeight: 600,
                fontSize: 24,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: onDark ? "#cadeff" : "#6b7280",
              }}
            >
              {layer.label}
            </div>
          )}
          <div
            data-field="value"
            style={{
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 128,
              lineHeight: 1,
              color: onDark ? "#ffffff" : scene.accentColor,
            }}
          >
            {layer.value}
          </div>
        </div>
      );

    case "quote":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: interFont,
              fontWeight: 700,
              fontSize: 96,
              lineHeight: 0.5,
              color: scene.accentColor,
            }}
          >
            &ldquo;
          </div>
          <div
            data-field="quote"
            style={{
              fontFamily: interFont,
              fontWeight: 600,
              fontSize: 48,
              lineHeight: 1.3,
              textAlign: "center",
              color: onDark ? "#ffffff" : "#04101f",
            }}
          >
            {layer.quote}
          </div>
          {layer.author && (
            <div
              style={{
                fontFamily: openSansFont,
                fontWeight: 400,
                fontSize: 26,
                color: onDark ? "#cadeff" : "#6b7280",
              }}
            >
              {/* The dash stays outside the field so editing only writes the name. */}
              — <span data-field="author">{layer.author}</span>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

export const CanvasSceneRenderer: React.FC<{ scene: CanvasScene }> = ({
  scene,
}) => {
  return (
    <AbsoluteFill style={backgroundStyle(scene.background, scene.accentColor)}>
      {scene.layers.map((layer, index) => (
        <LayerBox key={layer.id} layer={layer} index={index}>
          <LayerContent layer={layer} scene={scene} />
        </LayerBox>
      ))}
    </AbsoluteFill>
  );
};
