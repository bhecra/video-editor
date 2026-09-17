import { useRef } from "react";
import { ImageIcon, Settings2, Trash2, Upload } from "lucide-react";
import {
  defaultSubtitleStyle,
  defaultTransition,
  type VideoSettings,
} from "@video/schema/scene-schema";
import {
  subtitleScrimStyle,
  subtitleTextStyle,
} from "@video/theme/canvas-styles";
import { ColorField } from "@/components/fields/ColorField";
import { TransitionFields } from "@/components/fields/TransitionFields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

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
  const subtitleStyle = settings.subtitleStyle ?? defaultSubtitleStyle;
  const patchSubtitleStyle = (patch: Partial<typeof subtitleStyle>) =>
    onChange({ subtitleStyle: { ...subtitleStyle, ...patch } });

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
              Muestra el guion de cada escena abajo. Aplica en vista previa y
              al generar.
            </p>
          </div>
          <Switch
            id="subtitles"
            checked={settings.subtitles}
            onCheckedChange={(subtitles) => onChange({ subtitles })}
          />
        </div>

        {settings.subtitles && (
          <div className="space-y-3 rounded-lg border p-3">
            <ColorField
              label="Color del texto"
              value={subtitleStyle.color}
              fallback={defaultSubtitleStyle.color}
              onChange={(color) => patchSubtitleStyle({ color })}
              onReset={
                subtitleStyle.color === defaultSubtitleStyle.color
                  ? undefined
                  : () => patchSubtitleStyle({ color: defaultSubtitleStyle.color })
              }
            />

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {subtitleStyle.outlineWidth === 0
                  ? "Borde — sin borde"
                  : `Borde — ${subtitleStyle.outlineWidth} px`}
              </Label>
              <Slider
                value={[subtitleStyle.outlineWidth]}
                min={0}
                max={10}
                step={1}
                onValueChange={([outlineWidth]) =>
                  patchSubtitleStyle({ outlineWidth })
                }
              />
            </div>

            {subtitleStyle.outlineWidth > 0 && (
              <ColorField
                label="Color del borde"
                value={subtitleStyle.outlineColor}
                fallback={defaultSubtitleStyle.outlineColor}
                onChange={(outlineColor) => patchSubtitleStyle({ outlineColor })}
              />
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="subtitle-background"
                  className="text-xs text-muted-foreground"
                >
                  Fondo detrás del texto
                </Label>
                <p className="text-xs text-muted-foreground">
                  Degradado oscuro al pie del video para que el texto se lea
                  sobre escenas claras.
                </p>
              </div>
              <Switch
                id="subtitle-background"
                checked={subtitleStyle.background}
                onCheckedChange={(background) =>
                  patchSubtitleStyle({ background })
                }
              />
            </div>

            {subtitleStyle.background && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {`Opacidad del fondo — ${Math.round(
                    subtitleStyle.backgroundOpacity * 100,
                  )}%`}
                </Label>
                <Slider
                  value={[subtitleStyle.backgroundOpacity]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([backgroundOpacity]) =>
                    patchSubtitleStyle({ backgroundOpacity })
                  }
                />
              </div>
            )}

            {/* The backdrop runs dark to light so both the fill and the
                outline can be judged against either, with the same scrim the
                render paints behind the text sitting on top of it. */}
            <div
              className="flex items-end justify-center overflow-hidden rounded-md bg-[linear-gradient(110deg,#04101f_0%,#3b4a63_55%,#c9d3e4_100%)] pt-6"
              aria-hidden
            >
              <div style={subtitleScrimStyle(subtitleStyle, 18)}>
                <span style={subtitleTextStyle(subtitleStyle, 18)}>
                  Así se verán los subtítulos
                </span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="default-transition"
                className="text-sm font-semibold"
              >
                Transición entre escenas
              </Label>
              <p className="text-xs text-muted-foreground">
                Se aplica a cada corte, salvo donde la escena traiga la suya.
                Acorta el video: cada transición solapa las dos escenas.
              </p>
            </div>
            <Switch
              id="default-transition"
              checked={Boolean(settings.defaultTransition)}
              onCheckedChange={(on) =>
                onChange({
                  defaultTransition: on ? defaultTransition : undefined,
                })
              }
            />
          </div>

          {settings.defaultTransition && (
            <div className="rounded-lg border p-3">
              <TransitionFields
                transition={settings.defaultTransition}
                onChange={(defaultTransition) => onChange({ defaultTransition })}
              />
            </div>
          )}
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
