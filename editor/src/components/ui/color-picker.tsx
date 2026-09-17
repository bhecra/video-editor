"use client"

import Color from "color"
import { PipetteIcon } from "lucide-react"
import { Slider } from "radix-ui"
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ColorPickerContextValue {
  hue: number
  saturation: number
  lightness: number
  alpha: number
  mode: string
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
  setAlpha: (alpha: number) => void
  setMode: (mode: string) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined)

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext)

  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider")
  }

  return context
}

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Parameters<typeof Color>[0]
  defaultValue?: Parameters<typeof Color>[0]
  onChange?: (value: Parameters<typeof Color.rgb>[0]) => void
}

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const selectedColor = Color(value ?? defaultValue)
  const defaultColor = Color(defaultValue)
  const initial = value != null ? selectedColor : defaultColor

  const [hue, setHue] = useState(initial.hue())
  const [saturation, setSaturation] = useState(initial.saturationl())
  const [lightness, setLightness] = useState(initial.lightness())
  const [alpha, setAlpha] = useState(initial.alpha() * 100)
  const [mode, setMode] = useState("hex")

  // Update color when controlled value changes
  useEffect(() => {
    if (value) {
      const color = Color(value)

      setHue(color.hue())
      setSaturation(color.saturationl())
      setLightness(color.lightness())
      setAlpha(color.alpha() * 100)
    }
  }, [value])

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
      const rgba = color.rgb().array()

      onChange([rgba[0], rgba[1], rgba[2], alpha / 100])
    }
  }, [hue, saturation, lightness, alpha, onChange])

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div className={cn("flex size-full flex-col gap-4", className)} {...(props as any)} />
    </ColorPickerContext.Provider>
  )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker()
  const [positionX, setPositionX] = useState(() => saturation / 100)
  const [positionY, setPositionY] = useState(() => {
    const x = saturation / 100
    const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
    if (topLightness === 0) {
      return 1
    }
    return Math.max(0, Math.min(1, 1 - lightness / topLightness))
  })

  const backgroundGradient = useMemo(() => {
    return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`
  }, [hue])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!containerRef.current) {
        return
      }
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
      setPositionX(x)
      setPositionY(y)
      setSaturation(x * 100)
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)

      setLightness(topLightness * (1 - y))
    },
    [setSaturation, setLightness],
  )

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [isDragging, handlePointerMove])

  return (
    <div
      className={cn("relative size-full cursor-crosshair rounded", className)}
      onPointerDown={e => {
        e.preventDefault()
        setIsDragging(true)
        handlePointerMove(e.nativeEvent)
      }}
      ref={containerRef}
      style={{
        background: backgroundGradient,
      }}
      {...(props as any)}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white"
        style={{
          left: `${positionX * 100}%`,
          top: `${positionY * 100}%`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  )
})

ColorPickerSelection.displayName = "ColorPickerSelection"

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker()

  return (
    <Slider.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={360}
      onValueChange={([hue]) => setHue(hue)}
      step={1}
      value={[hue]}
      {...(props as any)}
    >
      <Slider.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <Slider.Range className="absolute h-full" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  )
}

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>

const CHECKERBOARD_BG =
  "url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==\")"

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
  const { hue, saturation, lightness, alpha, setAlpha } = useColorPicker()
  const opaque = `hsl(${hue} ${saturation}% ${lightness}%)`

  return (
    <Slider.Root
      aria-label="Transparencia"
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={100}
      onValueChange={([next]) => setAlpha(next)}
      step={1}
      value={[alpha]}
      {...props}
    >
      <Slider.Track
        className="relative my-0.5 h-3 w-full grow overflow-hidden rounded-full"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${opaque}), ${CHECKERBOARD_BG}`,
          backgroundSize: "100% 100%, 8px 8px",
          backgroundRepeat: "no-repeat, repeat",
        }}
      >
        <Slider.Range className="absolute h-full bg-transparent" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  )
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      const color = Color(result.sRGBHex)
      const [h, s, l] = color.hsl().array()

      setHue(h)
      setSaturation(s)
      setLightness(l)
      setAlpha(100)
    } catch (error) {
      console.error("EyeDropper failed:", error)
    }
  }

  return (
    <Button
      className={cn("shrink-0 text-muted-foreground", className)}
      onClick={handleEyeDropper}
      size="icon"
      type="button"
      variant="outline"
      {...(props as any)}
    >
      <PipetteIcon size={16} />
    </Button>
  )
}

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>

const formats = ["hex", "rgb", "css", "hsl"]

export const ColorPickerOutput = ({ className, ...props }: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker()

  return (
    <Select onValueChange={setMode} value={mode}>
      <SelectTrigger className="h-8 w-20 shrink-0 text-xs" {...props}>
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent className="z-[70]" position="popper">
        {formats.map((format) => (
          <SelectItem className="text-xs" key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const formatInputClassName =
  "h-8 bg-secondary px-2 text-xs shadow-none"

const applyParsedColor = (
  next: ReturnType<typeof Color>,
  setHue: (hue: number) => void,
  setSaturation: (saturation: number) => void,
  setLightness: (lightness: number) => void,
  setAlpha: (alpha: number) => void,
) => {
  setHue(next.hue())
  setSaturation(next.saturationl())
  setLightness(next.lightness())
  setAlpha(next.alpha() * 100)
}

const EditableValue = ({
  value,
  onCommit,
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  onCommit: (raw: string) => boolean
  className?: string
  "aria-label"?: string
}) => {
  const [draft, setDraft] = useState(value)
  const [focused, setFocused] = useState(false)
  const shown = focused ? draft : value

  return (
    <Input
      aria-label={ariaLabel}
      className={cn(formatInputClassName, className)}
      type="text"
      value={shown}
      onFocus={() => {
        setFocused(true)
        setDraft(value)
      }}
      onChange={(event) => {
        const next = event.target.value
        setDraft(next)
        onCommit(next)
      }}
      onBlur={() => {
        setFocused(false)
        if (!onCommit(draft)) {
          setDraft(value)
        }
      }}
    />
  )
}

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerFormat = ({ className, ...props }: ColorPickerFormatProps) => {
  const {
    hue,
    saturation,
    lightness,
    alpha,
    mode,
    setHue,
    setSaturation,
    setLightness,
    setAlpha,
  } = useColorPicker()
  const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
  const commitColor = (raw: string) => {
    try {
      applyParsedColor(Color(raw), setHue, setSaturation, setLightness, setAlpha)
      return true
    } catch {
      return false
    }
  }

  if (mode === "hex") {
    return (
      <div className={cn("flex w-full items-center", className)} {...props}>
        <EditableValue
          aria-label="Hex"
          className="rounded-md"
          value={color.hex()}
          onCommit={commitColor}
        />
      </div>
    )
  }

  if (mode === "rgb") {
    const rgb = color.rgb().array().slice(0, 3).map((value) => Math.round(value))
    const labels = ["R", "G", "B"]

    return (
      <div className={cn("-space-x-px flex items-center", className)} {...props}>
        {rgb.map((value, index) => (
          <EditableValue
            aria-label={labels[index]}
            className={cn(
              index === 0 ? "rounded-l-md rounded-r-none" : "rounded-none",
              index === rgb.length - 1 && "rounded-r-md",
            )}
            key={labels[index]}
            value={String(value)}
            onCommit={(raw) => {
              if (raw.trim() === "") {
                return false
              }
              const next = Number(raw)
              if (!Number.isFinite(next)) {
                return false
              }
              const [r = 0, g = 0, b = 0] = rgb
              const channels = [r, g, b]
              channels[index] = Math.max(0, Math.min(255, Math.round(next)))
              applyParsedColor(
                Color.rgb(channels[0], channels[1], channels[2]).alpha(alpha / 100),
                setHue,
                setSaturation,
                setLightness,
                setAlpha,
              )
              return true
            }}
          />
        ))}
      </div>
    )
  }

  if (mode === "css") {
    const rgb = color.rgb().array().slice(0, 3).map((value) => Math.round(value))
    const cssValue =
      alpha >= 99.5
        ? `rgb(${rgb.join(", ")})`
        : `rgba(${rgb.join(", ")}, ${Math.round(alpha) / 100})`

    return (
      <div className={cn("w-full", className)} {...props}>
        <EditableValue
          aria-label="CSS"
          className="w-full rounded-md"
          value={cssValue}
          onCommit={commitColor}
        />
      </div>
    )
  }

  if (mode === "hsl") {
    const hsl = [Math.round(hue), Math.round(saturation), Math.round(lightness)]
    const labels = ["H", "S", "L"]
    const max = [360, 100, 100]

    return (
      <div className={cn("-space-x-px flex items-center", className)} {...props}>
        {hsl.map((value, index) => (
          <EditableValue
            aria-label={labels[index]}
            className={cn(
              index === 0 ? "rounded-l-md rounded-r-none" : "rounded-none",
              index === hsl.length - 1 && "rounded-r-md",
            )}
            key={labels[index]}
            value={String(value)}
            onCommit={(raw) => {
              if (raw.trim() === "") {
                return false
              }
              const next = Number(raw)
              if (!Number.isFinite(next)) {
                return false
              }
              const [h = 0, s = 0, l = 0] = hsl
              const channels = [h, s, l]
              channels[index] = Math.max(0, Math.min(max[index] ?? 100, Math.round(next)))
              applyParsedColor(
                Color.hsl(channels[0], channels[1], channels[2]).alpha(alpha / 100),
                setHue,
                setSaturation,
                setLightness,
                setAlpha,
              )
              return true
            }}
          />
        ))}
      </div>
    )
  }

  return null
}
