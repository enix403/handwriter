import { useEffect, useRef, useState } from "react";
import { useObject } from "./hooks";
import Konva from "konva";
import { isCoreLoaded, wasmCore } from "@/tunnel";
import { Layer, Rect, Shape, Stage } from "react-konva";
import { Vector2d } from "konva/lib/types";

const { DrawInstructionTag } = wasmCore;

export function Glyph({ glyph = "a" }: { glyph?: string }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const emSize = 250;
  const padding = 300;
  const physicalSize = emSize + padding;
  const halfSize = physicalSize / 2;

  function transform(x: number, y: number): Vector2d {
    return {
      x: halfSize + x,
      y: halfSize - y
    };
  }

  const fm = useObject(() => wasmCore?.fm_create());

  let [outline, setOutline] = useState<wasmCore.OutlineRender>(
    useObject(() => wasmCore.fm_render_char(fm, glyph))
  );

  useEffect(() => {
    if (isCoreLoaded()) setOutline(wasmCore.fm_render_char(fm, glyph));
  }, [glyph]);

  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <Stage ref={stageRef} width={physicalSize} height={physicalSize}>
        <Layer ref={layerRef}>
          <Rect
            x={0}
            y={0}
            width={physicalSize}
            height={physicalSize}
            stroke='#a0a0a0'
            strokeWidth={4}
          />
          <Shape
            x={0}
            y={0}
            sceneFunc={(context, shape) => {
              // context.beginPath();
              // {
              //   let upm = 2048;
              //   let scale = physicalSize / upm;
              //   let point: Vector2d = { x: -upm / 2, y: upm / 2 };

              //   let origin = transform(0, 0);
              //   point = [point].map(p => ({
              //     x: p.x * scale,
              //     y: p.y * scale
              //   }))
              //   .map(p => transform(p.x, p.y))[0];


              //   console.log(origin, point);

              //   context.moveTo(origin.x, origin.y);
              //   context.lineTo(point.x, point.y);
              //   context.lineTo(origin.x + 10, origin.y);
              //   // context.arc(origin.x, origin.y, 10, 0, 2 * Math.PI);
              //   context.closePath();
              // }

              // context.fillStrokeShape(shape);

              // return;

              context.beginPath();

              let { instructions, upm, bbox } = outline;
              let box = bbox!;

              let origin = transform(0, 0);
              let axisSize = 1;

              // Horizontal
              context.fillRect(0, origin.y - axisSize / 2, physicalSize, axisSize);
              // Vertical
              // context.fillRect(origin.x - axisSize / 2, 0, axisSize, physicalSize);

              let scale = emSize / upm;

              box.x_min *= scale;
              box.x_max *= scale;
              box.y_min *= scale;
              box.y_max *= scale;

              let bw = box.x_max - box.x_min;
              let bh = box.y_max - box.y_min;

              // Horizontal
              context.fillRect(0, halfSize - box.y_min - axisSize / 2, physicalSize, axisSize);
              context.fillRect(0, halfSize - box.y_max - axisSize / 2, physicalSize, axisSize);

              // Vertical
              context.fillRect(halfSize + box.x_min - axisSize / 2, 0, axisSize, physicalSize)
              context.fillRect(halfSize + box.x_max - axisSize / 2, 0, axisSize, physicalSize)

              instructions.forEach(inst => {
                let { point1, point2, point3 } = inst;
                let points: Vector2d[] = [point1, point2, point3]
                .map(p => ({
                  x: p.x * scale,
                  y: p.y * scale
                }))
                .map(p => transform(p.x, p.y))

                if (inst.tag == DrawInstructionTag.MoveTo)
                  context.moveTo(points[0].x, points[0].y);
                else if (inst.tag == DrawInstructionTag.LineTo)
                  context.lineTo(points[0].x, points[0].y);
                else if (inst.tag == DrawInstructionTag.QuadTo)
                  context.quadraticCurveTo(
                    points[0].x,
                    points[0].y,
                    points[1].x,
                    points[1].y
                  );
                else if (inst.tag == DrawInstructionTag.CurveTo)
                  context.bezierCurveTo(
                    points[0].x,
                    points[0].y,
                    points[1].x,
                    points[1].y,
                    points[2].x,
                    points[2].y
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
            stroke="black"
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
