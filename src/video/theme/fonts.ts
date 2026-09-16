import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadOpenSans } from "@remotion/google-fonts/OpenSans";
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";

export const { fontFamily: interFont } = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
export const { fontFamily: openSansFont } = loadOpenSans("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});
export const { fontFamily: monoFont } = loadRobotoMono("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});
