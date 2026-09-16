import { useRef } from "react";
import { ImageIcon, Settings2, Trash2, Upload } from "lucide-react";
import type { VideoSettings } from "../../../src/scene-editor/scene-schema";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";

type Props = {
  settings: VideoSettings;
  onChange: (patch: Partial<VideoSettings>) => void;
};

export const VideoSettingsDialog: React.FC<Props> = ({
  settings,
  onChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const logo = settings.logo;

  const onLogoPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange({
        // Dropped top-right by default; it can be dragged from there.
        logo: { src: String(reader.result), x: 82, y: 6, w: 12 },
      });
    reader.readAsDataURL(file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings2 />
          Ajustes
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustes del video</DialogTitle>
          <DialogDescription>
            Opciones globales de la vista previa y el video final.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="subtitles" className="text-sm font-semibold">
              Subtítulos
            </Label>
            <p className="text-xs text-muted-foreground">
              Muestra el guion de cada escena abajo, con sombra marcada. Aplica
              en vista previa y al generar.
            </p>
          </div>
          <Switch
            id="subtitles"
            checked={settings.subtitles}
            onCheckedChange={(subtitles) => onChange({ subtitles })}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Logo de la empresa (opcional)
          </Label>
          <p className="text-xs text-muted-foreground">
            Aparece en todas las escenas. Arrástralo sobre el lienzo para
            ubicarlo donde quieras.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onLogoPicked}
          />

          <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-muted">
              {logo ? (
                <img
                  src={logo.src}
                  alt="Logo"
                  className="max-h-8 max-w-8 object-contain"
                />
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <span className="flex-1 text-sm text-muted-foreground">
              {logo ? "Logo cargado" : "PNG · hasta 2 MB"}
            </span>
            {logo && (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Quitar logo"
                onClick={() => onChange({ logo: undefined })}
              >
                <Trash2 />
              </Button>
            )}
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload />
              {logo ? "Cambiar" : "Subir"}
            </Button>
          </div>

          {logo && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs text-muted-foreground">
                Tamaño — {Math.round(logo.w)}% del ancho
              </Label>
              <Slider
                value={[logo.w]}
                min={4}
                max={40}
                step={1}
                onValueChange={([w]) => onChange({ logo: { ...logo, w } })}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Listo</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
