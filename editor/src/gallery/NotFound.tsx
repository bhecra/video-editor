import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/router/Link";
import { GALLERY_PATH } from "@/router/routes";

type Props = {
  message: string;
};

/** Dead end: an unknown path or an example number that nobody wrote yet. */
export const NotFound: React.FC<Props> = ({ message }) => (
  <div className="ia-glow-orbs flex min-h-screen items-center justify-center px-6 text-foreground">
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyTitle>{message}</EmptyTitle>
        <EmptyDescription>
          Los ejemplos disponibles están en la galería, cada uno con su propia
          ruta.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline" size="sm">
          <Link to={GALLERY_PATH}>
            <ArrowLeft data-icon="inline-start" />
            Ver los ejemplos
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  </div>
);
