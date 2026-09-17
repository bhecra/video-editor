import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Scene } from "@video/schema/scene-schema";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  scene: Scene;
  onChangeScene: (patch: Partial<Scene>) => void;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const SceneAudioPanel: React.FC<Props> = ({ scene, onChangeScene }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const volume = scene.audioVolume ?? 1;

  // Stop and rewind when switching scenes or swapping the track.
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [scene.id, scene.audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="size-3.5 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Audio de la escena</h3>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {scene.audioUrl ? (
        <div className="flex items-center gap-3">
          <audio
            ref={audioRef}
            src={scene.audioUrl}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
            hidden
          />
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>

          <Slider
            className="flex-1"
            value={[currentTime]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={([v]) => seek(v)}
          />

          <div className="flex w-32 items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onChangeScene({ audioVolume: volume > 0 ? 0 : 1 })}
              aria-label={volume > 0 ? "Silenciar" : "Activar sonido"}
            >
              {volume > 0 ? <Volume2 /> : <VolumeX />}
            </Button>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => onChangeScene({ audioVolume: v })}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Esta escena no tiene audio. Pega una URL para agregar la voz en off.
        </p>
      )}

      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel className="text-xs text-muted-foreground">
            Voz en off / guion de esta escena
          </FieldLabel>
          <Textarea
            value={scene.script ?? ""}
            rows={2}
            placeholder="Escribe el guion que se narrará en esta escena…"
            onChange={(e) =>
              onChangeScene({ script: e.target.value || undefined })
            }
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs text-muted-foreground">
            URL de audio (voz en off / música)
          </FieldLabel>
          <Input
            value={scene.audioUrl ?? ""}
            placeholder="https://…"
            onChange={(e) =>
              onChangeScene({ audioUrl: e.target.value || undefined })
            }
          />
        </Field>
      </FieldGroup>
    </div>
  );
};
