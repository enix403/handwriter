import useSize from "@react-hook/size";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { useEffect, useRef } from "react";
import { Circle, Group, Layer, Rect, Shape, Stage } from "react-konva";
import { useImmer } from "use-immer";
import * as R from "ramda";
import { wasmCore } from "@/tunnel";

function useObject<T>(creator: () => T) {
  let ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = creator();
  }
  return ref.current;
}

function Canvas({ width, height }) {
  const firstRender = useFirstRender();

  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  // const fm = useManager(() => wasmCore.fm_create());
  const fm = useObject(() => wasmCore.fm_create());
  const outlineRender = useObject(() => wasmCore.fm_render_char("p", fm));
  // @ts-ignore
  window.outlineRender = outlineRender;

  return (
    <Stage ref={stageRef} width={width} height={height}>
      <Layer ref={layerRef}>
        <Rect
          x={0}
          y={0}
          width={outlineRender.aabb.x_max * 0.1}
          height={outlineRender.aabb.y_max * 0.1}
          fill="green"
        />
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();

            let rd = outlineRender;

            let numInstructions = rd.instructions.length;

            const { DrawInstructionTag } = wasmCore;

            for (let i = 0; i < numInstructions; ++i) {
              let inst = rd.instructions[i];
              // console.log(inst.point1.x, inst.point1.y);

              if (inst.tag == DrawInstructionTag.MoveTo)
                context.moveTo(inst.point1.x, inst.point1.y);
              else if (inst.tag == DrawInstructionTag.LineTo)
                context.lineTo(inst.point1.x, inst.point1.y);
              else if (inst.tag == DrawInstructionTag.QuadTo)
                context.quadraticCurveTo(
                  inst.point1.x,
                  inst.point1.y,
                  inst.point2.x,
                  inst.point2.y
                );
              else if (inst.tag == DrawInstructionTag.CurveTo)
                context.bezierCurveTo(
                  inst.point1.x,
                  inst.point1.y,
                  inst.point2.x,
                  inst.point2.y,
                  inst.point3.x,
                  inst.point3.y
                );
              else if (inst.tag == DrawInstructionTag.Close)
                context.closePath();
            }
            context.fillStrokeShape(shape);
          }}
          fill='black'
        />
      </Layer>
    </Stage>
  );
}

export function Scratch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(containerRef);

  return (
    <div className='flex-1 self-stretch'>
      <div ref={containerRef} className='fixed inset-0'>
        {width} x {height}
      </div>
      <Canvas width={width} height={height} />
    </div>
  );
}

function useFirstRender() {
  const firstRender = useRef(true);

  useEffect(() => {
    if (!firstRender.current) return;
    firstRender.current = false;
  }, []);

  return firstRender.current;
}
