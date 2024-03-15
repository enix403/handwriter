import { useEffect, useRef, useState } from "react";
import { useObject } from "./hooks";
import Konva from "konva";
import { isCoreLoaded, wasmCore } from "@/tunnel";
import { Circle, Group, Layer, Line, Rect, Shape, Stage } from "react-konva";
import { Vector2d } from "konva/lib/types";

const { DrawCommandTag } = wasmCore;
// window.DrawCommandTag = DrawCommandTag

const AxisLine = ({
  orientation = "h",
  scale,
  physicalSize,
  offset,
  color = "#a0a0a0"
}: {
  orientation?: "h" | "v";
  scale: number;
  physicalSize: number;
  offset: number;
  color?: string;
}) => {
  let dirOffset = orientation == "h" ? -offset : offset;
  let dist = physicalSize / 2 + dirOffset * scale;

  let points =
    orientation == "h"
      ? [0, dist, physicalSize, dist]
      : [dist, 0, dist, physicalSize];

  return <Line points={points} stroke={color} strokeWidth={2} />;
};

export function Glyph({ glyph = "M" }: { glyph?: string }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const emSize = 350;
  const padding = 300;
  const physicalSize = emSize + padding;
  const halfSize = physicalSize / 2;

  const fm = useObject(() => wasmCore.fm_create());
  const fontMetrics = useObject(() => wasmCore.fm_metrics(fm));

  let scale = emSize / fontMetrics.upm;

  let [outline, setOutline] = useState<wasmCore.OutlineRender>(
    useObject(() => wasmCore.fm_render_char(fm, glyph))
  );

  useEffect(() => {
    if (isCoreLoaded()) setOutline(wasmCore.fm_render_char(fm, glyph));
  }, [glyph]);

  function transform({ x, y }: Vector2d): Vector2d {
    return {
      x: halfSize + x * scale,
      y: halfSize - y * scale
    };
  }

  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <Stage ref={stageRef} width={physicalSize} height={physicalSize}>
        <Layer ref={layerRef}>
          <Rect
            width={physicalSize}
            height={physicalSize}
            stroke='#a0a0a0'
            strokeWidth={4}
          />
          <Group>
            <AxisLine
              color='#e0e0e0'
              offset={0}
              orientation='h'
              physicalSize={physicalSize}
              scale={scale}
            />
            <AxisLine
              color='#e0e0e0'
              offset={0}
              orientation='v'
              physicalSize={physicalSize}
              scale={scale}
            />
          </Group>
          <Circle x={halfSize} y={halfSize} radius={3} fill="#c2c2c2" />
          <Group>
            <AxisLine
              color='#ebcc34'
              offset={fontMetrics.capital_height}
              physicalSize={physicalSize}
              scale={scale}
            />
            <AxisLine
              color='#ebcc34'
              offset={fontMetrics.ascender}
              physicalSize={physicalSize}
              scale={scale}
            />
            <AxisLine
              color='#ebcc34'
              offset={fontMetrics.descender}
              physicalSize={physicalSize}
              scale={scale}
            />
          </Group>
          {outline.bbox && (
            <Group>
              <AxisLine
                color='#05a3ff'
                orientation='h'
                offset={outline.bbox.y_min}
                physicalSize={physicalSize}
                scale={scale}
              />
              <AxisLine
                color='#05a3ff'
                orientation='h'
                offset={outline.bbox.y_max}
                physicalSize={physicalSize}
                scale={scale}
              />
              <AxisLine
                color='#05a3ff'
                orientation='v'
                offset={outline.bbox.x_min}
                physicalSize={physicalSize}
                scale={scale}
              />
              <AxisLine
                color='#05a3ff'
                orientation='v'
                offset={outline.bbox.x_max}
                physicalSize={physicalSize}
                scale={scale}
              />
            </Group>
          )}

          <Shape
            x={0}
            y={0}
            sceneFunc={(context, shape) => {
              context.beginPath();

              outline.commands.forEach(cmd => {
                let point = transform(cmd.point);
                let control1 = transform(cmd.control1);
                let control2 = transform(cmd.control2);

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

              context.fillStrokeShape(shape);
              context.strokeShape(shape);
            }}
            stroke='black'
            fill='#808080'
          />
        </Layer>
      </Stage>
      <p className='mt-4'>
        <strong>Glyph: </strong> {glyph}
      </p>
    </div>
  );
}
