import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { HeroIntro } from "./scenes/HeroIntro";
import { LearningFeature } from "./scenes/LearningFeature";
import { AnalyticsFeature } from "./scenes/AnalyticsFeature";
import { GrowthFeature } from "./scenes/GrowthFeature";
import { ClosingCTA } from "./scenes/ClosingCTA";

export const UbitsShowcase: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={120} name="Hero">
        <HeroIntro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={150} name="Learning">
        <LearningFeature />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={150} name="Analytics">
        <AnalyticsFeature />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={150} name="Growth">
        <GrowthFeature />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={120} name="Closing">
        <ClosingCTA />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
