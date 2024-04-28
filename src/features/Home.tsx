import useSize from "@react-hook/size";
import Konva from "konva";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Circle, Layer, Rect, Shape, Stage } from "react-konva";
import { getRandomInt } from "./hooks";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";

interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CustomComponentProps {
  transform: Transform;
  onMouseEnter?: VoidFunction;
  onMouseLeave?: VoidFunction;
  onClick?: VoidFunction;
}

interface ComponentBase {
  (props: CustomComponentProps): ReactNode;
}

interface EditorNode {
  id: number;
  transform: Transform;
  Component: ComponentBase;
}

const RectComponent: ComponentBase = ({ transform, ...rest }) => {
  return (
    <Rect
      {...rest}
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

  let [activeNode, setActiveNode] = useState<number>(-1);

  useEffect(() => {
    function makeRect(x: number, y: number) {
      let rectWidth = 100;
      let rectHeight = 100;

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

      return node;
    }

    let nodes = [makeRect(100, 100), makeRect(400, 70), makeRect(300, 500)];

    setNodes(nodes);
  }, []);

  return (
    <Stage ref={stageRef} width={width} height={height}>
      <Layer ref={layerRef}>
        <Rect width={width} height={height} fill='#F4F5F7' />
        {nodes.map(node => (
          <node.Component
            onMouseEnter={() => {
              console.log(node);
              setActiveNode(node.id);
            }}
            onMouseLeave={() => {
              if (activeNode === node.id)
                setActiveNode(-1);
            }}
            key={node.id}
            transform={node.transform}
          />
        ))}
      </Layer>
    </Stage>
  );
}

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(containerRef);

  return (
    <>
      <main className='flex h-full max-h-full'>
        <div className='w-64 border-r border-slate-400 '>
          {width} x {height}
        </div>
        <div ref={containerRef} className='flex-1'>
          <Canvas width={width} height={height} />
        </div>
      </main>
    </>
  );
}
