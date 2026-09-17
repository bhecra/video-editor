import { ArrowRight } from "lucide-react";
import { totalSeconds, videoExamples } from "@/examples";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration } from "@/lib/scene-meta";
import { Link } from "@/router/Link";
import { examplePath } from "@/router/routes";
import { ExampleCover } from "./ExampleCover";

/**
 * The home page: every sample script in the catalogue, each one a link to its
 * own route. Adding an entry to examples/index.ts is enough to appear here.
 */
export const ExamplesGallery: React.FC = () => (
  <div className="ia-glow-orbs min-h-screen text-foreground">
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          UBITS Video Editor
        </div>
        <h1 className="mt-1 text-2xl font-semibold">Ejemplos de video</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Cada ejemplo abre el editor con un guion distinto. La URL es la
          dirección del ejemplo, así que se puede compartir o recargar.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {videoExamples.map((example, index) => {
          const path = examplePath(index + 1);
          return (
            <Card key={path} className="gap-0 py-0 shadow-sm">
              <Link to={path} aria-label={`Abrir ${example.title}`}>
                <ExampleCover scene={example.video.scenes[0]} />
              </Link>

              <CardHeader className="pt-4">
                <CardTitle className="text-base">{example.title}</CardTitle>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">
                    {example.video.scenes.length} escenas
                  </Badge>
                  <Badge variant="outline">
                    {formatDuration(totalSeconds(example))}
                  </Badge>
                  <Badge variant="outline">
                    {example.video.settings?.subtitles
                      ? "Con subtítulos"
                      : "Sin subtítulos"}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between py-4">
                <code className="font-mono text-xs text-muted-foreground">
                  {path}
                </code>
                <Button asChild size="sm" variant="outline">
                  <Link to={path}>
                    Abrir ejemplo
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  </div>
);
