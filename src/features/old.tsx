/*


function useFirstRender() {
  const firstRender = useRef(true);

  useEffect(() => {
    if (!firstRender.current) return;
    firstRender.current = false;
  }, []);

  return firstRender.current;
}

type Node = {
  id: string;
  pos: Vector2d;
  active: boolean;
};

function Canvas({ width, height }) {
  const firstRender = useFirstRender();

  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const [nodes, setNodes] = useImmer<Node[]>(() => {
    return [
      { id: "1", pos: { x: 114, y: 448 }, active: false },
      { id: "2", pos: { x: 569, y: 145 }, active: false },
      { id: "3", pos: { x: 375, y: 665 }, active: false }
    ];
  });

  function activateNode(e: KonvaEventObject<MouseEvent>) {
    let shape = e.target as Konva.Shape;
    let shapeId = shape.id();

    setNodes(nodes => {
      nodes.forEach(n => {
        n.active = shapeId == n.id;
      });
    });

    e.cancelBubble = true;
  }

  function clearActiveNode() {
    setNodes(nodes => nodes.forEach(n => (n.active = false)));
  }

  return (
    <Stage
      onClick={clearActiveNode}
      ref={stageRef}
      width={width}
      height={height}
    >
      <Layer ref={layerRef}>
        {nodes.map(node => (
          <Group key={node.id}>
            <Rect
              id={node.id}
              x={node.pos.x}
              y={node.pos.y}
              width={90}
              height={90}
              fill='#D3D3D3'
              stroke='#0DA5FE'
              strokeWidth={node.active ? 3 : 0}
              draggable
              onClick={activateNode}
              onDragStart={activateNode}
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
}

// ===========================================

function Canvas({ width, height }) {
  const firstRender = useFirstRender();

  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const nodes = useRef<Konva.Node[]>([]).current;

  // const hoverNode = useVariable<Konva.Shape | null>(null);
  const activeNode = useRef<Konva.Shape | null>(null);

  function addCircle({ x, y }: Vector2d) {
    const layer = layerRef.current!;

    const node = new Konva.Circle({
      x: x,
      y: y,
      radius: 30,
      fill: "#D3D3D3",
      stroke: "#0DA5FE",
      strokeWidth: 0
    });

    node.on("click", function (event) {
      if (activeNode.current) {
        activeNode.current.strokeWidth(0);
      }
      activeNode.current = node;
      node.strokeWidth(3);
      event.evt.preventDefault();
    });

    nodes.push(node);
    layer.add(node);
  }

  useEffect(() => {

    while (nodes.length) nodes.pop()?.destroy();

    addCircle({ x: 114, y: 448 });
    addCircle({ x: 569, y: 145 });
    addCircle({ x: 375, y: 665 });
  }, []);

  return (
    <Stage ref={stageRef} width={width} height={height}>
      <Layer
        onClick={() => {
          // if (activeNode.current) {
          //   activeNode.current.strokeWidth(0);
          //   activeNode.current = null;
          // }
        }}
        ref={layerRef}
      />
    </Stage>
  );
}

// =============================================

import { IconSquareAsterisk } from "@tabler/icons-react";
import clsx from "clsx";

function SidebarButton({ icon, label, active = false }) {
  return (
    <button
      className={clsx(
        "tc flex flex-col items-center px-2 py-3 hover:bg-purple-200",
        {
          "bg-purple-200": active
        }
      )}
    >
      {icon}
      <p className='text-xs'>{label}</p>
    </button>
  );
}

export function Sidebar() {
  return (
    <nav className='border-r-2 border-slate-300 bg-white'>
      <SidebarButton label={"Elements"} icon={<IconSquareAsterisk />} />
    </nav>
  );
}

//  ================================

import useSize from "@react-hook/size";
import { Stage, Layer, Rect } from "react-konva";

import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
export function Scratch() {
  const firstRender = useRef(true);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  let [counter, setCounter] = useState(0);
  const increment = useCallback(() => setCounter(x => x + 1), []);

  useEffect(() => {
    console.log(counter);
  }, [counter]);

  useEffect(() => {
    if (!firstRender.current) return;

    firstRender.current = false;

    const stage = stageRef.current!;
    const layer = layerRef.current!;

    console.log("stage", stage);
    console.log("layer", layer);


    var hexagon = new Konva.RegularPolygon({
      x: 100,
      y: 150,
      sides: 3,
      radius: 70,
      fill: "violet",
      rotation: radians(45),
      draggable: true
    });

    layer.add(hexagon);
  }, []);

  return (
    <Stage
      onClick={increment}
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
    >
      <Layer ref={layerRef}></Layer>
    </Stage>
  );
}
 */

/*
export function Scratch() {
  const containerRef = useRef(null);
  const [width, height] = useSize(containerRef);

  let canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let ctx = canvasRef.current.getContext("2d")!;
    ctx.fillStyle = "#f46542";
    ctx.fillRect(0, 0, 100, 100);
    console.log("Hello", ctx);
    // ctx.font = "48px Fira Code";
    // ctx.fillText("Hello world", 10, 50);
  }, []);

  return (
    <>
      <div ref={containerRef} className='max-h-full flex-1'>
        <canvas
          aria-atomic
          aria-autocomplete='list'
          aria-busy
          ref={canvasRef}
          width={width}
          height={height - 10}
          className=''
        ></canvas>
      </div>
    </>
  );
}
*/
