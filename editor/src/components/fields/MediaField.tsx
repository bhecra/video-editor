import { useRef, useState } from "react";
import { ImageIcon, Upload, Video as VideoIcon } from "lucide-react";
import { uploadMedia } from "@/editor/api/upload-api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

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
    <Field data-invalid={Boolean(error)}>
      <FieldLabel className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </FieldLabel>

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
            {uploading ? <Spinner /> : <Upload />}
            {uploading ? "Subiendo…" : "Reemplazar"}
          </Button>
        </div>
      ) : (
        <Empty
          role="button"
          tabIndex={0}
          aria-disabled={uploading}
          onClick={uploading ? undefined : pick}
          onKeyDown={(e) => {
            if (uploading) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              pick();
            }
          }}
          className="cursor-pointer border p-5 hover:border-ring hover:bg-muted/50 aria-disabled:pointer-events-none aria-disabled:opacity-60"
        >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {uploading ? <Spinner /> : <Icon />}
            </EmptyMedia>
            <EmptyTitle className="text-xs font-normal text-muted-foreground">
              {uploading ? "Subiendo…" : text.empty}
            </EmptyTitle>
            <EmptyDescription>{text.hint}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" disabled={uploading} tabIndex={-1}>
              <Upload />
              {text.action}
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Field>
  );
};
