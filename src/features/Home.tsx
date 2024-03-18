import useSize from "@react-hook/size";
import Konva from "konva";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Circle, Layer, Rect, Shape, Stage } from "react-konva";
import { getRandomInt } from "./hooks";
import { KonvaEventObject } from "konva/lib/Node";

interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ComponentBase {
  (props: { transform: Transform }): ReactNode;
}

interface EditorNode {
  id: number;
  transform: Transform;
  Component: ComponentBase;
}

const RectComponent: ComponentBase = ({ transform }) => {
  return (
    <Rect
      x={transform.x}
      y={transform.y}
      width={transform.width}
      height={transform.height}
      fill='black'
    />
  );
};

const CircleComponent: ComponentBase = ({ transform }) => {
  return (
    <Circle
      x={transform.x}
      y={transform.y}
      radius={transform.width / 2}
      fill='green'
    />
  );
};

function Canvas({ width, height }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const lastId = useRef(0);

  const addRandomNode = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      let { x, y } = event.target.getStage()?.getPointerPosition() || {
        x: 0,
        y: 0
      };

      let rectWidth = getRandomInt(10, width * 0.2);
      let rectHeight = getRandomInt(10, height * 0.2);

      x -= rectWidth / 2;
      y -= rectHeight / 2;

      let node: EditorNode = {
        id: lastId.current++,
        transform: {
          x,
          y,
          width: rectWidth,
          height: rectHeight
        },
        Component: RectComponent
      };

      setNodes(oldNodes => [...oldNodes, node]);
    },
    [width, height]
  );

  return (
    <Stage ref={stageRef} onClick={addRandomNode} width={width} height={height}>
      <Layer ref={layerRef}>
        {nodes.map(node => (
          <node.Component key={node.id} transform={node.transform} />
        ))}
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
