import {
  textVariants,
  type CanvasLayer,
  type CanvasScene,
  type Scene,
  shapeFills,
} from "@video/schema/scene-schema";
import { typeLabels } from "@/lib/scene-meta";
import { LayersList } from "./LayersList";
import { ColorField } from "@/components/fields/ColorField";
import { MediaField } from "@/components/fields/MediaField";
import { LayoutPicker } from "./LayoutPicker";
import {
  isDarkBackground,
  shapeFillColor,
  textStyles,
} from "@video/theme/canvas-styles";
import { Badge } from "@/components/ui/badge";
import {
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const Labeled: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Field>
    <FieldLabel className="text-xs text-muted-foreground">{label}</FieldLabel>
    {children}
  </Field>
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
  scene: CanvasScene;
  onUpdate: (patch: Partial<CanvasLayer>) => void;
}> = ({ layer, scene, onUpdate }) => {
  switch (layer.type) {
    case "text":
      return (
        <>
          <Labeled label="Estilo">
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
          </Labeled>
          <Labeled label="Contenido">
            <Textarea
              value={layer.text}
              rows={3}
              onChange={(e) => onUpdate({ text: e.target.value })}
            />
          </Labeled>
          <ColorField
            label="Color del texto"
            value={layer.color}
            fallback={
              textStyles(
                layer.variant,
                isDarkBackground(scene.background),
              ).color as string
            }
            onChange={(color) => onUpdate({ color })}
            onReset={() => onUpdate({ color: undefined })}
          />
        </>
      );

    case "image":
      return (
        <MediaField
          kind="image"
          value={layer.src}
          onChange={(src) => onUpdate({ src })}
        />
      );

    case "shape":
      return (
        <>
          <Labeled label="Relleno">
            <Select
              value={layer.fill}
              onValueChange={(v) => onUpdate({ fill: v as typeof layer.fill })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shapeFills.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Labeled>
          <ColorField
            label="Color de la forma"
            value={layer.color}
            fallback={shapeFillColor(layer.fill, scene.accentColor)}
            onChange={(color) => onUpdate({ color })}
            onReset={() => onUpdate({ color: undefined })}
          />
        </>
      );

    case "badge":
      return (
        <>
          <Labeled label="Título">
            <Input
              value={layer.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </Labeled>
          <Labeled label="Subtítulo">
            <Input
              value={layer.subtitle ?? ""}
              onChange={(e) =>
                onUpdate({ subtitle: e.target.value || undefined })
              }
            />
          </Labeled>
        </>
      );

    case "list":
      return (
        <Labeled label="Items (uno por línea)">
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
        </Labeled>
      );

    case "stat":
      return (
        <>
          <Labeled label="Valor">
            <Input
              value={layer.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
            />
          </Labeled>
          <Labeled label="Etiqueta">
            <Input
              value={layer.label ?? ""}
              onChange={(e) => onUpdate({ label: e.target.value || undefined })}
            />
          </Labeled>
        </>
      );

    case "quote":
      return (
        <>
          <Labeled label="Cita">
            <Textarea
              value={layer.quote}
              rows={3}
              onChange={(e) => onUpdate({ quote: e.target.value })}
            />
          </Labeled>
          <Labeled label="Autor">
            <Input
              value={layer.author ?? ""}
              onChange={(e) => onUpdate({ author: e.target.value || undefined })}
            />
          </Labeled>
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
      <CardHeader className="border-b py-3">
        <CardTitle className="text-sm font-semibold">Propiedades</CardTitle>
        <CardAction>
          <Badge variant="outline">{typeLabels[scene.type]}</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
      <FieldGroup>
      <Labeled label="Nombre de la escena">
        <Input
          value={scene.name}
          onChange={(e) => onChangeScene({ name: e.target.value })}
        />
      </Labeled>

      <Labeled label="Duración (segundos)">
        <Input
          type="number"
          min={1}
          value={scene.durationInSeconds}
          onChange={(e) =>
            onChangeScene({ durationInSeconds: Number(e.target.value) || 1 })
          }
        />
      </Labeled>

      {scene.type === "canvas" && (
        <>
          <Separator />

          <LayoutPicker
            value={scene.layout}
            onChange={(layout) => onChangeLayout(layout)}
          />

          <ColorField
            label="Color de acento"
            value={scene.accentColor}
            fallback={scene.accentColor}
            onChange={(accentColor) => onChangeScene({ accentColor })}
          />

          <Labeled label="Fondo">
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
          </Labeled>

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
              <FieldGroup className="gap-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Capa · {layerTypeLabels[selectedLayer.type]}
                </h3>
                <LayerFields
                  layer={selectedLayer}
                  scene={scene}
                  onUpdate={(patch) => onUpdateLayer(selectedLayer.id, patch)}
                />
                <div className="grid grid-cols-2 gap-2">
                  {(["x", "y", "w", "h"] as const).map((k) => (
                    <Labeled key={k} label={k.toUpperCase() + " (%)"}>
                      <Input
                        type="number"
                        value={Math.round(selectedLayer[k])}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            [k]: Number(e.target.value),
                          } as Partial<CanvasLayer>)
                        }
                      />
                    </Labeled>
                  ))}
                </div>
                <Labeled
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
                </Labeled>
              </FieldGroup>
            </>
          )}
        </>
      )}

      {(scene.type === "avatar" || scene.type === "video") && (
        <>
          <MediaField
            kind="video"
            value={scene.videoUrl}
            onChange={(videoUrl) => onChangeScene({ videoUrl })}
          />
        </>
      )}

      {scene.type === "image" && (
        <>
          <MediaField
            kind="image"
            value={scene.imageUrl}
            onChange={(imageUrl) => onChangeScene({ imageUrl })}
          />
        </>
      )}

      </FieldGroup>
      </CardContent>
    </div>
  );
};
