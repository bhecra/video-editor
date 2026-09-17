import { ArrowLeft } from "lucide-react";
import type { VideoSettings } from "@video/schema/scene-schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/router/Link";
import { GALLERY_PATH } from "@/router/routes";
import type { RenderState } from "./api/useRenderJob";
import { VideoSettingsDialog } from "./properties-panel/VideoSettingsDialog";

type Props = {
  title: string;
  settings: VideoSettings;
  onChangeSettings: (patch: Partial<VideoSettings>) => void;
  renderState: RenderState;
  onGenerate: () => void;
};

/** Top bar: video-wide settings and the entry point to the render API. */
export const EditorHeader: React.FC<Props> = ({
  title,
  settings,
  onChangeSettings,
  renderState,
  onGenerate,
}) => (
  <header className="flex items-center justify-between px-5 py-3">
    <div className="flex min-w-0 items-center gap-2">
      <Button
        asChild
        size="icon-sm"
        variant="ghost"
        aria-label="Ver los ejemplos"
      >
        <Link to={GALLERY_PATH}>
          <ArrowLeft />
        </Link>
      </Button>
      <div className="truncate text-base font-semibold">{title}</div>
    </div>
    <div className="flex items-center gap-4">
      {renderState.status === "rendering" && (
        <div className="flex w-44 flex-col gap-1">
          <span className="font-mono text-xs text-muted-foreground">
            Renderizando… {Math.round(renderState.progress * 100)}%
          </span>
          <Progress value={renderState.progress * 100} />
        </div>
      )}
      {renderState.status === "error" && (
        <Alert variant="destructive" className="max-w-sm py-2">
          <AlertDescription className="text-xs">
            {renderState.message}
          </AlertDescription>
        </Alert>
      )}
      <VideoSettingsDialog settings={settings} onChange={onChangeSettings} />
      <Button
        onClick={onGenerate}
        disabled={renderState.status === "rendering"}
      >
        {renderState.status === "rendering" ? "Generando…" : "Generar video"}
      </Button>
    </div>
  </header>
);
