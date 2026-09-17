import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    // Scenes carry a `transition` field describing how they enter. The rule
    // reads any `transition` property as the CSS one, which would be a
    // non-deterministic animation — here it is plain data, resolved into
    // frames before it reaches the composition.
    files: ["src/video/transitions/*.ts", "src/video/schema/scene-schema.ts"],
    rules: { "@remotion/non-pure-animation": "off" },
  },
];
