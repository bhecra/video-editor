import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { CanvasLayer } from "@video/schema/scene-schema";
import { getLayerField } from "@video/schema/layer-fields";

import { COMPOSITION_WIDTH } from "@video/video-config";

type MeasuredField = {
  field: string;
  rect: { left: number; top: number; width: number; height: number };
  style: CSSProperties;
};

type Props = {
  layer: CanvasLayer;
  /** The element wrapping both the rendered frame and this overlay. */
  container: HTMLElement | null;
  onChangeField: (field: string, value: string) => void;
  onFinish: () => void;
};

// Rather than re-implementing each layer's internal layout, the editor measures
// the already-rendered fields (tagged with data-field) and drops a
// contenteditable box exactly on top of each one.
const measureFields = (
  container: HTMLElement,
  layerId: string,
): MeasuredField[] => {
  const root = container.querySelector(`[data-layer-id="${layerId}"]`);
  if (!root) return [];

  const containerRect = container.getBoundingClientRect();
  // The frame is scaled down with a CSS transform, so measured rects are in
  // screen pixels while computed font metrics are still composition pixels.
  const scale = containerRect.width / COMPOSITION_WIDTH;
  const px = (value: string) =>
    value.endsWith("px") ? `${parseFloat(value) * scale}px` : value;

  return [...root.querySelectorAll("[data-field]")].map((node) => {
    const el = node as HTMLElement;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);

    return {
      field: el.dataset.field!,
      rect: {
        left: r.left - containerRect.left,
        top: r.top - containerRect.top,
        width: Math.max(r.width, 24),
        height: Math.max(r.height, 16),
      },
      style: {
        fontFamily: cs.fontFamily,
        fontSize: px(cs.fontSize),
        fontWeight: cs.fontWeight,
        lineHeight: px(cs.lineHeight),
        letterSpacing: px(cs.letterSpacing),
        color: cs.color,
        textAlign: cs.textAlign as CSSProperties["textAlign"],
        textTransform: cs.textTransform as CSSProperties["textTransform"],
      },
    };
  });
};

const FieldBox: React.FC<{
  measured: MeasuredField;
  value: string;
  autoFocus: boolean;
  onChange: (value: string) => void;
  onFinish: () => void;
}> = ({ measured, value, autoFocus, onChange, onFinish }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Uncontrolled: writing back into a focused contenteditable resets the caret.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = value;
    if (!autoFocus) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onPointerDown={(e) => e.stopPropagation()}
      onInput={(e) => onChange(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          e.preventDefault();
          onFinish();
        }
      }}
      className="pointer-events-auto"
      style={{
        ...measured.style,
        position: "absolute",
        left: measured.rect.left,
        top: measured.rect.top,
        width: measured.rect.width,
        minHeight: measured.rect.height,
        outline: "2px solid var(--primary)",
        outlineOffset: 2,
        borderRadius: 2,
        cursor: "text",
        whiteSpace: "pre-wrap",
      }}
    />
  );
};

export const InlineFieldEditor: React.FC<Props> = ({
  layer,
  container,
  onChangeField,
  onFinish,
}) => {
  const [fields, setFields] = useState<MeasuredField[]>([]);

  // Re-measure after every edit so the boxes follow the text as it reflows.
  useLayoutEffect(() => {
    if (!container) return;
    setFields(measureFields(container, layer.id));
  }, [container, layer]);

  if (!container || fields.length === 0) return null;

  return (
    <>
      {/* Hide the rendered text so it doesn't show through the editor. */}
      <style>{`[data-layer-id="${layer.id}"] [data-field] { visibility: hidden; }`}</style>
      {/* The container must not capture pointer events, otherwise clicks
          outside the field boxes can never leave edit mode. */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        onBlur={(e) => {
          // Moving between fields of the same layer keeps editing alive.
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          onFinish();
        }}
      >
        {fields.map((measured, i) => (
          <FieldBox
            key={measured.field}
            measured={measured}
            value={getLayerField(layer, measured.field)}
            autoFocus={i === 0}
            onChange={(value) => onChangeField(measured.field, value)}
            onFinish={onFinish}
          />
        ))}
      </div>
    </>
  );
};
