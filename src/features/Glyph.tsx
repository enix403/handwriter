import { useEffect, useRef, useState } from "react";
import { useObject } from "./hooks";
import Konva from "konva";
import { isCoreLoaded, wasmCore } from "@/tunnel";
import { Group, Layer, Line, Rect, Shape, Stage } from "react-konva";
import { Vector2d } from "konva/lib/types";

const { DrawCommandTag } = wasmCore;
const { DrawCommandTag: DrawInstructionTag } = wasmCore;
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

  function transform({ x, y }: wasmCore.Point): Vector2d {
    return {
      x: halfSize + x,
      y: halfSize - y
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

              let { commands: instructions, bbox } = outline;

              if (bbox) {
                bbox.x_min *= scale;
                bbox.x_max *= scale;
                bbox.y_min *= scale;
                bbox.y_max *= scale;
              }

              // Bounds
              // let axisSize = 1;
              // if (bbox) {
              //   context.fillRect(
              //     halfSize + bbox.x_min - axisSize / 2,
              //     0,
              //     axisSize,
              //     physicalSize
              //   );
              //   context.fillRect(
              //     halfSize + bbox.x_max - axisSize / 2,
              //     0,
              //     axisSize,
              //     physicalSize
              //   );
              // }

              instructions.forEach(inst => {
                let { point1, point2, point3 } = inst;
                let points: Vector2d[] = [point1, point2, point3]
                  .map(p => ({
                    x: p.x * scale,
                    y: p.y * scale
                  }))
                  .map(p => transform(p));

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

/*
<Shape
  x={0}
  y={0}
  sceneFunc={(context, shape) => {
    return;
    context.beginPath();

    let {
      instructions,
      upm,
      bbox,
      ascender,
      descender,
      capital_height
    } = outline;
    let box = bbox!;

    let origin = transform(0, 0);
    let axisSize = 1;

    // Horizontal
    context.fillRect(
      0,
      origin.y - axisSize / 2,
      physicalSize,
      axisSize
    );
    // Vertical
    // context.fillRect(origin.x - axisSize / 2, 0, axisSize, physicalSize);

    let scale = emSize / upm;

    if (bbox) {
      box.x_min *= scale;
      box.x_max *= scale;
      box.y_min *= scale;
      box.y_max *= scale;
    }

    ascender *= scale;
    descender *= scale;
    capital_height *= scale;

    // let bw = box.x_max - box.x_min;
    // let bh = box.y_max - box.y_min;

    // Horizontal bound
    // context.fillRect(0, halfSize - box.y_min - axisSize / 2, physicalSize, axisSize);
    // context.fillRect(0, halfSize - box.y_max - axisSize / 2, physicalSize, axisSize);

    // Vertical bound
    if (bbox) {
      context.fillRect(
        halfSize + box.x_min - axisSize / 2,
        0,
        axisSize,
        physicalSize
      );
      context.fillRect(
        halfSize + box.x_max - axisSize / 2,
        0,
        axisSize,
        physicalSize
      );
    }


    // Horizontal ascender
    context.fillRect(
      0,
      halfSize - capital_height - axisSize / 2,
      physicalSize,
      axisSize
    );
    context.fillRect(
      0,
      halfSize - ascender - axisSize / 2,
      physicalSize,
      axisSize
    );
    context.fillRect(
      0,
      halfSize - descender - axisSize / 2,
      physicalSize,
      axisSize
    );

    instructions.forEach(inst => {
      let { point1, point2, point3 } = inst;
      let points: Vector2d[] = [point1, point2, point3]
        .map(p => ({
          x: p.x * scale,
          y: p.y * scale
        }))
        .map(p => transform(p.x, p.y));

      if (inst.tag == DrawInstructionTag.MoveTo)
        context.moveTo(point.x, point.y);
      else if (inst.tag == DrawInstructionTag.LineTo)
        context.lineTo(point.x, point.y);
      else if (inst.tag == DrawInstructionTag.QuadTo)
        context.quadraticCurveTo(
          point.x,
          point.y,
          control1.x,
          control1.y
        );
      else if (inst.tag == DrawInstructionTag.CurveTo)
        context.bezierCurveTo(
          point.x,
          point.y,
          control1.x,
          control1.y,
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
  stroke='black'
  fill='#808080'
/>

*/
