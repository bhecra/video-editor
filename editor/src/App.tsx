import { useEffect } from "react";
import { EditorPage } from "./editor/EditorPage";
import { getExample } from "./examples";
import { ExamplesGallery } from "./gallery/ExamplesGallery";
import { NotFound } from "./gallery/NotFound";
import { useRoute } from "./router/useRoute";

/**
 * The only router: the gallery at /video-examples and one editor per example
 * at /video-examples/:number.
 */
export const App: React.FC = () => {
  const route = useRoute();
  const example = route.name === "example" ? getExample(route.number) : null;

  useEffect(() => {
    document.title = example
      ? `${example.title} — UBITS Video Editor`
      : "Ejemplos — UBITS Video Editor";
  }, [example]);

  if (route.name === "gallery") return <ExamplesGallery />;

  if (route.name === "example") {
    if (!example) {
      return <NotFound message={`No existe el ejemplo ${route.number}.`} />;
    }
    // The key remounts the editor when the route changes: useSceneEditor reads
    // its document once, on mount, and owns the edits from then on.
    return <EditorPage key={route.number} example={example} />;
  }

  return <NotFound message={`La ruta ${route.path} no existe.`} />;
};
