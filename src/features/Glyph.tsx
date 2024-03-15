import { useEffect, useRef, useState } from "react";
import { useObject } from "./hooks";
import Konva from "konva";
import { isCoreLoaded, wasmCore } from "@/tunnel";
import { Group, Layer, Line, Rect, Shape, Stage } from "react-konva";
import { Vector2d } from "konva/lib/types";

const {  DrawInstructionTag } = wasmCore;
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

export function Glyph({ glyph = "a" }: { glyph?: string }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const emSize = 250;
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

  function transform({x, y}: Vector2d): Vector2d {
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
          <Shape
            x={0}
            y={0}
            sceneFunc={(context, shape) => {
              context.beginPath();

              let {
                instructions,
                bbox,
              } = outline;

              instructions.forEach(inst => {
                let point1 = transform(inst.point1);
                let point2 = transform(inst.point2);
                let point3 = transform(inst.point3);

                if (inst.tag == DrawInstructionTag.MoveTo)
                  context.moveTo(point1.x, point1.y);
                else if (inst.tag == DrawInstructionTag.LineTo)
                  context.lineTo(point1.x, point1.y);
                else if (inst.tag == DrawInstructionTag.QuadTo)
                  context.quadraticCurveTo(
                    point1.x,
                    point1.y,
                    point2.x,
                    point2.y
                  );
                else if (inst.tag == DrawInstructionTag.CurveTo)
                  context.bezierCurveTo(
                    point1.x,
                    point1.y,
                    point2.x,
                    point2.y,
                    point3.x,
                    point3.y
                  );
                else if (inst.tag == DrawInstructionTag.Close)
                  context.closePath();
              });

              // let rectSize = 200;
              // let start = transform(-rectSize / 2, rectSize / 2);

              // context.rect(
              //   start.x,
              //   start.y,
              //   rectSize,
              //   rectSize
              // );

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
