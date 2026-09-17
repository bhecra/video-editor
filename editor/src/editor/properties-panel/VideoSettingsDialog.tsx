import { useEffect, useRef, useState } from "react";
import { ImageIcon, RotateCcw, Settings2, Trash2, Upload } from "lucide-react";
import {
  defaultLogoBackground,
  defaultSubtitleStyle,
  defaultTransition,
  LOGO_SIZE_MAX,
  LOGO_SIZE_MIN,
  type LogoSettings,
  type VideoSettings,
} from "@video/schema/scene-schema";
import {
  logoBackdropStyle,
  logoBoxStyle,
  logoMarkStyle,
  subtitleScrimStyle,
  subtitleTextStyle,
} from "@video/theme/canvas-styles";
import { COMPOSITION_HEIGHT, COMPOSITION_WIDTH } from "@video/video-config";
import { ColorField } from "@/components/fields/ColorField";
import { TransitionFields } from "@/components/fields/TransitionFields";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  footprintFromImage,
  readLogoFootprint,
  sameLogoSize,
} from "@/lib/logo-size";
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

// On-screen width of the logo swatch in the preview below, in px. The plate's
// padding and radius are relative to it, exactly as they are to the logo's
// width in the render.
const LOGO_PREVIEW_WIDTH = 120;

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
  const [originalSize, setOriginalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const subtitleStyle = settings.subtitleStyle ?? defaultSubtitleStyle;
  const patchSubtitleStyle = (patch: Partial<typeof subtitleStyle>) =>
    onChange({ subtitleStyle: { ...subtitleStyle, ...patch } });

  const patchLogo = (patch: Partial<LogoSettings>) =>
    logo && onChange({ logo: { ...logo, ...patch } });

  useEffect(() => {
    if (!logo?.src) {
      setOriginalSize(null);
      return;
    }
    let cancelled = false;
    readLogoFootprint(logo.src, (size) => {
      if (!cancelled) setOriginalSize(size);
    });
    return () => {
      cancelled = true;
    };
  }, [logo?.src]);

  const atOriginalSize =
    logo != null && originalSize != null && sameLogoSize(logo, originalSize);

  const resetLogoSize = () => {
    if (originalSize) {
      patchLogo(originalSize);
      return;
    }
    if (logo) readLogoFootprint(logo.src, patchLogo);
  };

  const onLogoPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const { w, h } = footprintFromImage(
          img.naturalWidth,
          img.naturalHeight,
        );
        onChange({
          // Dropped top-right by default; it can be dragged from there.
          logo: {
            ...defaultLogoBackground,
            src,
            x: Math.min(82, 95 - w),
            y: 6,
            w,
            h,
          },
        });
      };
      img.src = src;
    };
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

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajustes del video</DialogTitle>
          <DialogDescription>
            Opciones globales de la vista previa y el video final.
          </DialogDescription>
        </DialogHeader>

        {/* The settings scroll; the header and "Listo" stay put. */}
        <ScrollArea className="-mx-6 min-h-0 flex-1">
          <FieldGroup className="px-6">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="subtitles">Subtítulos</FieldLabel>
              <FieldDescription>
                Muestra el guion de cada escena abajo. Aplica en vista previa y
                al generar.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="subtitles"
              checked={settings.subtitles}
              onCheckedChange={(subtitles) => onChange({ subtitles })}
            />
          </Field>

          {settings.subtitles && (
            <FieldGroup className="gap-3 rounded-lg border p-3">
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

              <Field>
                <FieldLabel className="text-xs text-muted-foreground">
                  {subtitleStyle.outlineWidth === 0
                    ? "Borde — sin borde"
                    : `Borde — ${subtitleStyle.outlineWidth} px`}
                </FieldLabel>
                <Slider
                  value={[subtitleStyle.outlineWidth]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={([outlineWidth]) =>
                    patchSubtitleStyle({ outlineWidth })
                  }
                />
              </Field>

              {subtitleStyle.outlineWidth > 0 && (
                <ColorField
                  label="Color del borde"
                  value={subtitleStyle.outlineColor}
                  fallback={defaultSubtitleStyle.outlineColor}
                  onChange={(outlineColor) => patchSubtitleStyle({ outlineColor })}
                />
              )}

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel
                    htmlFor="subtitle-background"
                    className="text-xs text-muted-foreground"
                  >
                    Fondo detrás del texto
                  </FieldLabel>
                  <FieldDescription>
                    Degradado oscuro al pie del video para que el texto se lea
                    sobre escenas claras.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="subtitle-background"
                  checked={subtitleStyle.background}
                  onCheckedChange={(background) =>
                    patchSubtitleStyle({ background })
                  }
                />
              </Field>

              {subtitleStyle.background && (
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">
                    {`Opacidad del fondo — ${Math.round(
                      subtitleStyle.backgroundOpacity * 100,
                    )}%`}
                  </FieldLabel>
                  <Slider
                    value={[subtitleStyle.backgroundOpacity]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([backgroundOpacity]) =>
                      patchSubtitleStyle({ backgroundOpacity })
                    }
                  />
                </Field>
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
            </FieldGroup>
          )}

          <Separator />

          <FieldGroup className="gap-2">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="default-transition">
                  Transición entre escenas
                </FieldLabel>
                <FieldDescription>
                  Se aplica a cada corte, salvo donde la escena traiga la suya.
                  Acorta el video: cada transición solapa las dos escenas.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="default-transition"
                checked={Boolean(settings.defaultTransition)}
                onCheckedChange={(on) =>
                  onChange({
                    defaultTransition: on ? defaultTransition : undefined,
                  })
                }
              />
            </Field>

            {settings.defaultTransition && (
              <div className="rounded-lg border p-3">
                <TransitionFields
                  transition={settings.defaultTransition}
                  onChange={(defaultTransition) => onChange({ defaultTransition })}
                />
              </div>
            )}
          </FieldGroup>

          <Separator />

          <FieldGroup className="gap-2">
            <Field>
              <FieldLabel>Logo de la empresa (opcional)</FieldLabel>
              <FieldDescription>
                Aparece en todas las escenas. Arrástralo sobre el lienzo para
                ubicarlo. Tira de una esquina para escalar en proporción, o de un
                lado para cambiar solo el ancho o el alto.
              </FieldDescription>
            </Field>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onLogoPicked}
            />

            <Item variant="outline" className="border-dashed">
              <ItemMedia variant="icon">
                {logo ? (
                  <img
                    src={logo.src}
                    alt="Logo"
                    className="max-h-8 max-w-8 object-contain"
                  />
                ) : (
                  <ImageIcon />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemDescription>
                  {logo ? "Logo cargado" : "PNG · hasta 2 MB"}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
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
              </ItemActions>
            </Item>

            {logo && (
              <>
                <FieldGroup className="gap-3 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel className="text-xs text-muted-foreground">
                      Tamaño
                    </FieldLabel>
                    {!atOriginalSize && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={resetLogoSize}
                            aria-label="Restablecer tamaño original"
                          >
                            <RotateCcw />
                            Tamaño original
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Volver a la proporción de la imagen
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground">
                        Ancho — {Math.round(logo.w)}% del video
                      </FieldLabel>
                      <Slider
                        value={[logo.w]}
                        min={LOGO_SIZE_MIN}
                        max={LOGO_SIZE_MAX}
                        step={1}
                        onValueChange={([w]) => patchLogo({ w })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground">
                        Alto — {Math.round(logo.h ?? logo.w)}% del video
                      </FieldLabel>
                      <Slider
                        value={[logo.h ?? logo.w]}
                        min={LOGO_SIZE_MIN}
                        max={LOGO_SIZE_MAX}
                        step={1}
                        onValueChange={([h]) => patchLogo({ h })}
                      />
                    </Field>
                  </div>
                </FieldGroup>

                <FieldGroup className="gap-3 rounded-lg border p-3">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel
                        htmlFor="logo-background"
                        className="text-xs text-muted-foreground"
                      >
                        Fondo detrás del logo
                      </FieldLabel>
                      <FieldDescription>
                        Una placa bajo el logo, para que se lea sobre escenas
                        del mismo tono. Va dentro del tamaño de arriba.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="logo-background"
                      checked={logo.background}
                      onCheckedChange={(background) => patchLogo({ background })}
                    />
                  </Field>

                  {logo.background && (
                    <>
                      <ColorField
                        label="Color del fondo"
                        value={logo.backgroundColor}
                        fallback={defaultLogoBackground.backgroundColor}
                        onChange={(backgroundColor) =>
                          patchLogo({ backgroundColor })
                        }
                        onReset={
                          logo.backgroundColor ===
                          defaultLogoBackground.backgroundColor
                            ? undefined
                            : () =>
                                patchLogo({
                                  backgroundColor:
                                    defaultLogoBackground.backgroundColor,
                                })
                        }
                      />

                      <Field>
                        <FieldLabel className="text-xs text-muted-foreground">
                          {`Opacidad — ${Math.round(
                            logo.backgroundOpacity * 100,
                          )}%`}
                        </FieldLabel>
                        <Slider
                          value={[logo.backgroundOpacity]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={([backgroundOpacity]) =>
                            patchLogo({ backgroundOpacity })
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs text-muted-foreground">
                          {`Margen interno — ${logo.backgroundPadding}%`}
                        </FieldLabel>
                        <Slider
                          value={[logo.backgroundPadding]}
                          min={0}
                          max={25}
                          step={1}
                          onValueChange={([backgroundPadding]) =>
                            patchLogo({ backgroundPadding })
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs text-muted-foreground">
                          {logo.backgroundRadius === 0
                            ? "Esquinas — rectas"
                            : `Esquinas — ${logo.backgroundRadius}%`}
                        </FieldLabel>
                        <Slider
                          value={[logo.backgroundRadius]}
                          min={0}
                          max={50}
                          step={1}
                          onValueChange={([backgroundRadius]) =>
                            patchLogo({ backgroundRadius })
                          }
                        />
                      </Field>
                    </>
                  )}

                  {/* Same dark-to-light backdrop as the subtitle preview, with
                      the plate the render paints sitting on top of it. */}
                  <div
                    className="flex justify-center overflow-hidden rounded-md bg-[linear-gradient(110deg,#04101f_0%,#3b4a63_55%,#c9d3e4_100%)] p-4"
                    aria-hidden
                  >
                    <div
                      style={{
                        width: LOGO_PREVIEW_WIDTH,
                        height:
                          logo.h != null && logo.w > 0
                            ? (LOGO_PREVIEW_WIDTH * logo.h * COMPOSITION_HEIGHT) /
                              (logo.w * COMPOSITION_WIDTH)
                            : undefined,
                      }}
                    >
                      <div style={logoBoxStyle(logo, LOGO_PREVIEW_WIDTH)}>
                        {logo.background && (
                          <div
                            style={logoBackdropStyle(logo, LOGO_PREVIEW_WIDTH)}
                          />
                        )}
                        <img
                          src={logo.src}
                          alt=""
                          style={logoMarkStyle(logo)}
                        />
                      </div>
                    </div>
                  </div>
                </FieldGroup>
              </>
            )}
          </FieldGroup>
          </FieldGroup>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Listo</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
