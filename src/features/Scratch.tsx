import useSize from "@react-hook/size";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Shape, Stage } from "react-konva";
import { isCoreLoaded, wasmCore } from "@/tunnel";
import { useObject } from "./hooks";
import { Vector2d } from "konva/lib/types";
import * as R from "ramda";

function TextComponent({
  fm,
  text,
  position
}: {
  fm: wasmCore.FontManager;
  text: string;
  position: Vector2d;
}) {
  let [renders, setRenders] = useState<wasmCore.OutlineRender[]>([]);

  useEffect(() => {
    if (isCoreLoaded())
      setRenders(wasmCore.fm_render_string(fm, text));
  }, [text]);

  let spacing = 10;

  return (
    <Shape
      x={position.x}
      y={position.y}
      sceneFunc={(context, shape) => {
        const { DrawInstructionTag } = wasmCore;
        let left = 0;

        context.beginPath();
        for (let i = 0; i < renders.length; ++i) {
          let { aabb, instructions } = renders[i];

          let width = aabb.x_max;
          let height = aabb.y_max;

          // context.strokeRect(left, 0, width, height);

          instructions.forEach(inst => {
            let { point1, point2, point3 } = inst;
            let points = [point1, point2, point3];

            // Move to next character
            points.forEach(p => (p.x += left));

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
            else if (inst.tag == DrawInstructionTag.Close) context.closePath();
          });

          left += aabb.x_max + spacing;
        }

        context.fillStrokeShape(shape);
      }}
      // stroke='#13ad24'
      fill='black'
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
        <TextComponent fm={fm} text="abcdefghijklm" position={{ x: 10, y: 100 }} />
        <TextComponent fm={fm} text="nopqrstuvwxyz" position={{ x: 10, y: 200 }} />
        <TextComponent fm={fm} text="ABCDEFGHIJKLM" position={{ x: 10, y: 300 }} />
        <TextComponent fm={fm} text="NOPQRSTUVWXYZ" position={{ x: 10, y: 400 }} />
        <TextComponent fm={fm} text="0123456789" position={{ x: 10, y: 500 }} />
        <TextComponent fm={fm} text="!@#$%^&*()_+=-" position={{ x: 10, y: 600 }} />
        <TextComponent fm={fm} text="/<>.,;[]{}" position={{ x: 10, y: 700 }} />
      </Layer>
    </Stage>
  );
}

export function Scratch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(containerRef);

  return (
    <div className='flex-1 self-stretch'>
      <div ref={containerRef} className='fixed inset-0 flex flex-row-reverse py-1 px-2'>
        {width} x {height}
      </div>
      <Canvas width={width} height={height} />
    </div>
  );
}
