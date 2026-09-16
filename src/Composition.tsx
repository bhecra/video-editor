import { Composition, Folder } from "remotion";
import { UbitsShowcase } from "./UbitsShowcase";
import { HeroIntro } from "./scenes/HeroIntro";
import { LearningFeature } from "./scenes/LearningFeature";
import { AnalyticsFeature } from "./scenes/AnalyticsFeature";
import { GrowthFeature } from "./scenes/GrowthFeature";
import { ClosingCTA } from "./scenes/ClosingCTA";
import { DynamicVideo } from "./scene-editor/DynamicVideo";
import { DynamicVideoSchema } from "./scene-editor/scene-schema";
import { calculateDynamicVideoMetadata } from "./scene-editor/calculate-metadata";
import { sampleOnboardingVideo } from "./scene-editor/sample-data";

export const MyComposition = () => {
  return (
    <>
      <Folder name="UbitsShowcase-Scenes">
        <Composition
          id="Hero"
          component={HeroIntro}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Learning"
          component={LearningFeature}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Analytics"
          component={AnalyticsFeature}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Growth"
          component={GrowthFeature}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Closing"
          component={ClosingCTA}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
      <Composition
        id="UbitsShowcase"
        component={UbitsShowcase}
        durationInFrames={610}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SceneEditor"
        component={DynamicVideo}
        durationInFrames={2430}
        fps={30}
        width={1920}
        height={1080}
        schema={DynamicVideoSchema}
        defaultProps={sampleOnboardingVideo}
        calculateMetadata={calculateDynamicVideoMetadata}
      />
    </>
  );
};
