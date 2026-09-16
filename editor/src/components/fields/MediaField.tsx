import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, Video as VideoIcon } from "lucide-react";
import { uploadMedia } from "@/editor/api/upload-api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  kind: "image" | "video";
  value: string;
  onChange: (src: string) => void;
  label?: string;
};

const copy = {
  image: {
    accept: "image/*",
    empty: "Sube una imagen desde tu computador",
    action: "Subir imagen",
    hint: "JPG, PNG o WebP",
  },
  video: {
    accept: "video/*",
    empty: "Sube un video desde tu computador",
    action: "Subir video",
    hint: "MP4, MOV o WebM",
  },
} as const;

export const MediaField: React.FC<Props> = ({
  kind,
  value,
  onChange,
  label = "Media",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = copy[kind];
  const Icon = kind === "video" ? VideoIcon : ImageIcon;

  const pick = () => inputRef.current?.click();

  const onPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Cleared right away so picking the same file twice still fires a change.
    e.target.value = "";
    if (!file || !file.type.startsWith(`${kind}/`)) return;

    setUploading(true);
    setError(null);
    try {
      onChange(await uploadMedia(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </Label>

      <input
        ref={inputRef}
        type="file"
        accept={text.accept}
        hidden
        onChange={onPicked}
      />

      {value ? (
        <div className="flex items-center gap-3">
          <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
            {kind === "video" ? (
              <video
                src={value}
                muted
                playsInline
                preload="metadata"
                className="size-full object-cover"
              />
            ) : (
              <img src={value} alt="" className="size-full object-cover" />
            )}
          </div>
          <Button variant="outline" onClick={pick} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {uploading ? "Subiendo…" : "Reemplazar"}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-5 text-center transition-colors hover:border-ring hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <Icon className="size-5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {uploading ? "Subiendo…" : text.empty}
          </span>
          {/* A span, not a Button: it lives inside the clickable area, so it
              only has to look like the design system's outline button. */}
          <span className={buttonVariants({ variant: "outline" })}>
            <Upload />
            {text.action}
          </span>
          <span className="text-[0.7rem] text-muted-foreground">
            {text.hint}
          </span>
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
