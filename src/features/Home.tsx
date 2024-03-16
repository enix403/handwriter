import useSize from "@react-hook/size";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Shape, Stage } from "react-konva";
import { isCoreLoaded, wasmCore } from "@/tunnel";
import { useObject } from "./hooks";
import { Vector2d } from "konva/lib/types";

const { DrawCommandTag } = wasmCore;

function TextComponent({
  position,
  fm,
  text,
  fontSize
}: {
  position: Vector2d;
  fm: wasmCore.FontManager;
  text: string;
  fontSize: number;
}) {
  const fontMetrics = useObject(() => wasmCore.fm_metrics(fm));

  const [outlines, setOutlines] = useState<wasmCore.OutlineRender[]>([]);

  useEffect(() => {
    if (!isCoreLoaded()) return;

    let outlines = wasmCore.fm_render_string(fm, text);
    setOutlines(outlines);
  }, [text]);

  let scale = (1.0 / fontMetrics.upm) * fontSize;
  let baselineY = fontMetrics.ascender * scale;

  function transform({ x, y }: Vector2d, left: number, top: number): Vector2d {
    return {
      x: left + x * scale,
      y: top + baselineY - y * scale
    };
  }

  let wrapWidth = 200;

  return (
    <Shape
      x={position.x}
      y={position.y}
      fill='black'
      sceneFunc={(context, shape) => {
        // context.beginPath();
        // context.fillRect(0, 0, 100, 100);
        // context.fillStrokeShape(shape);

        if (outlines.length === 0) return;

        context.beginPath();

        let left = 0;
        let top = 0;

        for (let i = 0; i < outlines.length; ++i) {
          // Some really basic text wrapping
          if (left >= wrapWidth) {
            left = 0;
            top += (fontMetrics.ascender - fontMetrics.descender) * scale;
          }

          let outline = outlines[i];
          outline.commands.forEach(cmd => {
            let point = transform(cmd.point, left, top);
            let control1 = transform(cmd.control1, left, top);
            let control2 = transform(cmd.control2, left, top);

            if (cmd.tag == DrawCommandTag.MoveTo)
              context.moveTo(point.x, point.y);
            else if (cmd.tag == DrawCommandTag.LineTo)
              context.lineTo(point.x, point.y);
            else if (cmd.tag == DrawCommandTag.QuadTo)
              context.quadraticCurveTo(
                control1.x,
                control1.y,
                point.x,
                point.y
              );
            else if (cmd.tag == DrawCommandTag.CurveTo)
              context.bezierCurveTo(
                control1.x,
                control1.y,
                control2.x,
                control2.y,
                point.x,
                point.y
              );
            else if (cmd.tag == DrawCommandTag.Close) context.closePath();
          });

          left += outline.advance_width * scale;
        }

        context.fillStrokeShape(shape);
      }}
    />
  );
}

function Canvas({ width, height }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const fm = useObject(() => wasmCore?.fm_create());

  return (
    <Stage ref={stageRef} width={width} height={height}>
      <Layer ref={layerRef}>
        <TextComponent
          fm={fm}
          text='They looked up at the sky and saw a million stars.'
          fontSize={20}
          position={{ x: 0, y: 0 }}
        />
      </Layer>
    </Stage>
  );
}

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(containerRef);

  return (
    <div className='flex-1 self-stretch'>
      <div
        ref={containerRef}
        className='fixed inset-0 flex flex-row-reverse px-2 py-1'
      >
        {width} x {height}
      </div>
      <Canvas width={width} height={height} />
    </div>
  );
}
