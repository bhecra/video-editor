import { staticFile, CanvasImage, Solid } from "remotion";
import React from "react";

export const NewComposition: React.FC = () => {
  return (
    <>
      <Solid
        width={1280}
        height={720}
        color="blue"
        style={{
          position: "absolute",
        }}
        from={-3}
      />
      <CanvasImage
        src={staticFile("FONDO DE PANTALLA NUEVO 3.png")}
        from={-11}
        style={{
          position: "absolute",
          translate: "-3360.6px -1890.6px",
          scale: 0.15,
        }}
        durationInFrames={71}
      />

      <CanvasImage
        src={staticFile("ubits-logo-white.svg")}
        style={{
          position: "absolute",
          width: 149,
          height: 48,
          rotate: "24.5deg",
          translate: "58.8px 49.6px",
        }}
      />
    </>
  );
};
