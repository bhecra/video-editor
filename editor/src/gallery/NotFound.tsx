import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/router/Link";
import { GALLERY_PATH } from "@/router/routes";

type Props = {
  message: string;
};

/** Dead end: an unknown path or an example number that nobody wrote yet. */
export const NotFound: React.FC<Props> = ({ message }) => (
  <div className="ia-glow-orbs flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-foreground">
    <div className="text-sm font-semibold">{message}</div>
    <p className="max-w-md text-sm text-muted-foreground">
      Los ejemplos disponibles están en la galería, cada uno con su propia ruta.
    </p>
    <Button asChild variant="outline" size="sm">
      <Link to={GALLERY_PATH}>
        <ArrowLeft data-icon="inline-start" />
        Ver los ejemplos
      </Link>
    </Button>
  </div>
);
