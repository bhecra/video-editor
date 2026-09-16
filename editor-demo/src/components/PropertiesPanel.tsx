import {
  canvasLayouts,
  textVariants,
  type CanvasLayer,
  type CanvasScene,
  type Scene,
} from "../../../src/scene-editor/scene-schema";
import { canvasLayoutLabels } from "../../../src/scene-editor/canvas-templates";
import { typeLabels } from "../lib/scene-meta";
import { LayersList } from "./LayersList";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  scene: Scene;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onChangeScene: (patch: Partial<Scene>) => void;
  onChangeLayout: (layout: CanvasScene["layout"]) => void;
  onUpdateLayer: (id: string, patch: Partial<CanvasLayer>) => void;
  onAddLayer: (type: CanvasLayer["type"]) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, toIndex: number) => void;
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const layerTypeLabels: Record<CanvasLayer["type"], string> = {
  text: "Texto",
  image: "Imagen",
  shape: "Forma",
  badge: "Badge",
  list: "Lista",
  stat: "Dato clave",
  quote: "Cita",
};

const LayerFields: React.FC<{
  layer: CanvasLayer;
  onUpdate: (patch: Partial<CanvasLayer>) => void;
}> = ({ layer, onUpdate }) => {
  switch (layer.type) {
    case "text":
      return (
        <>
          <Field label="Estilo">
            <Select
              value={layer.variant}
              onValueChange={(v) =>
                onUpdate({ variant: v as typeof layer.variant })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textVariants.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Contenido">
            <Textarea
              value={layer.text}
              rows={3}
              onChange={(e) => onUpdate({ text: e.target.value })}
            />
          </Field>
        </>
      );

    case "image":
      return (
        <Field label="URL de imagen">
          <Input
            value={layer.src}
            onChange={(e) => onUpdate({ src: e.target.value })}
          />
        </Field>
      );

    case "shape":
      return (
        <Field label="Relleno">
          <Select
            value={layer.fill}
            onValueChange={(v) => onUpdate({ fill: v as typeof layer.fill })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["accent", "white", "dark", "tint"] as const).map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );

    case "badge":
      return (
        <>
          <Field label="Título">
            <Input
              value={layer.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </Field>
          <Field label="Subtítulo">
            <Input
              value={layer.subtitle ?? ""}
              onChange={(e) =>
                onUpdate({ subtitle: e.target.value || undefined })
              }
            />
          </Field>
        </>
      );

    case "list":
      return (
        <Field label="Items (uno por línea)">
          <Textarea
            value={layer.items.join("\n")}
            rows={5}
            onChange={(e) =>
              onUpdate({
                items: e.target.value
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
      );

    case "stat":
      return (
        <>
          <Field label="Valor">
            <Input
              value={layer.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
            />
          </Field>
          <Field label="Etiqueta">
            <Input
              value={layer.label ?? ""}
              onChange={(e) => onUpdate({ label: e.target.value || undefined })}
            />
          </Field>
        </>
      );

    case "quote":
      return (
        <>
          <Field label="Cita">
            <Textarea
              value={layer.quote}
              rows={3}
              onChange={(e) => onUpdate({ quote: e.target.value })}
            />
          </Field>
          <Field label="Autor">
            <Input
              value={layer.author ?? ""}
              onChange={(e) => onUpdate({ author: e.target.value || undefined })}
            />
          </Field>
        </>
      );

    default:
      return null;
  }
};

export const PropertiesPanel: React.FC<Props> = ({
  scene,
  selectedLayerId,
  onSelectLayer,
  onChangeScene,
  onChangeLayout,
  onUpdateLayer,
  onAddLayer,
  onDeleteLayer,
  onReorderLayer,
}) => {
  const selectedLayer =
    scene.type === "canvas"
      ? (scene.layers.find((l) => l.id === selectedLayerId) ?? null)
      : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Propiedades</h2>
        <Badge>{typeLabels[scene.type]}</Badge>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
      <Field label="Nombre de la escena">
        <Input
          value={scene.name}
          onChange={(e) => onChangeScene({ name: e.target.value })}
        />
      </Field>

      <Field label="Duración (segundos)">
        <Input
          type="number"
          min={1}
          value={scene.durationInSeconds}
          onChange={(e) =>
            onChangeScene({ durationInSeconds: Number(e.target.value) || 1 })
          }
        />
      </Field>

      {scene.type === "canvas" && (
        <>
          <Separator />

          <Field label="Plantilla">
            <Select
              value={scene.layout}
              onValueChange={(v) =>
                onChangeLayout(v as CanvasScene["layout"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {canvasLayouts.map((layout) => (
                  <SelectItem key={layout} value={layout}>
                    {canvasLayoutLabels[layout]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Color de acento">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={scene.accentColor}
                onChange={(e) => onChangeScene({ accentColor: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              />
              <Input
                value={scene.accentColor}
                onChange={(e) => onChangeScene({ accentColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </Field>

          <Field label="Fondo">
            <Select
              value={scene.background}
              onValueChange={(v) =>
                onChangeScene({
                  background: v as CanvasScene["background"],
                } as Partial<Scene>)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["gradient", "light", "dark", "accent"] as const).map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Separator />

          <LayersList
            layers={scene.layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={onSelectLayer}
            onDeleteLayer={onDeleteLayer}
            onAddLayer={onAddLayer}
            onReorderLayer={onReorderLayer}
          />

          {selectedLayer && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Capa · {layerTypeLabels[selectedLayer.type]}
                </h3>
                <LayerFields
                  layer={selectedLayer}
                  onUpdate={(patch) => onUpdateLayer(selectedLayer.id, patch)}
                />
                <div className="grid grid-cols-2 gap-2">
                  {(["x", "y", "w", "h"] as const).map((k) => (
                    <Field key={k} label={k.toUpperCase() + " (%)"}>
                      <Input
                        type="number"
                        value={Math.round(selectedLayer[k])}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            [k]: Number(e.target.value),
                          } as Partial<CanvasLayer>)
                        }
                      />
                    </Field>
                  ))}
                </div>
                <Field
                  label={`Rotación — ${Math.round(selectedLayer.rotation ?? 0)}°`}
                >
                  <Slider
                    value={[selectedLayer.rotation ?? 0]}
                    min={-45}
                    max={45}
                    step={1}
                    onValueChange={([v]) =>
                      onUpdateLayer(selectedLayer.id, { rotation: v })
                    }
                  />
                </Field>
              </div>
            </>
          )}
        </>
      )}

      {(scene.type === "avatar" || scene.type === "video") && (
        <>
          <Field label="URL de video">
            <Input
              value={scene.videoUrl}
              onChange={(e) => onChangeScene({ videoUrl: e.target.value })}
            />
          </Field>
          <Field label="Caption">
            <Input
              value={scene.caption ?? ""}
              onChange={(e) =>
                onChangeScene({ caption: e.target.value || undefined })
              }
            />
          </Field>
        </>
      )}

      {scene.type === "imagen" && (
        <>
          <Field label="URL de imagen">
            <Input
              value={scene.imageUrl}
              onChange={(e) => onChangeScene({ imageUrl: e.target.value })}
            />
          </Field>
          <Field label="Caption">
            <Input
              value={scene.caption ?? ""}
              onChange={(e) =>
                onChangeScene({ caption: e.target.value || undefined })
              }
            />
          </Field>
        </>
      )}

      <Separator />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Audio de la escena
        </h3>
        <Field label="URL de audio (voz en off / música)">
          <Input
            value={scene.audioUrl ?? ""}
            placeholder="https://…"
            onChange={(e) =>
              onChangeScene({ audioUrl: e.target.value || undefined })
            }
          />
        </Field>
        {scene.audioUrl && (
          <>
            <audio
              key={scene.audioUrl}
              src={scene.audioUrl}
              controls
              className="h-8 w-full"
            />
            <Field
              label={`Volumen — ${Math.round((scene.audioVolume ?? 1) * 100)}%`}
            >
              <Slider
                value={[scene.audioVolume ?? 1]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([v]) => onChangeScene({ audioVolume: v })}
              />
            </Field>
          </>
        )}
        </div>
      </div>
    </div>
  );
};
