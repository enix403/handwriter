import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";

type KvMouseEvent = KonvaEventObject<MouseEvent>;

const COLOR_NORMAL = "#F4F5F7";
const COLOR_HIGHLIGHT = "#FF0000";
const COLOR_SELECTED = "#00FF00";

const RECT_SIZE = 100;

interface SelectionInfo {
  nodeIndex: number;
  nodeSelected: boolean;
  mouseOffset: Vector2d;
}

abstract class EditorNode {
  private group: Konva.Group;

  constructor() {
    this.group = new Konva.Group();
  }

  public getGroup(): Konva.Group {
    return this.group;
  }
}


export class Application {
  private stage: Konva.Stage;
  private bgRect: Konva.Rect | null = null;

  private nodesLayer: Konva.Layer;
  private nodes: Array<Konva.Rect> = [];

  private selection: SelectionInfo = {
    nodeIndex: -1,
    nodeSelected: false,
    mouseOffset: { x: 0, y: 0 }
  };

  constructor(stageContainer: HTMLDivElement, width: number, height: number) {
    this.stage = new Konva.Stage({
      container: stageContainer,
      width,
      height
    });

    this.stage.add(this.createBackground());

    this.nodesLayer = new Konva.Layer();
    this.stage.add(this.nodesLayer);

    this.stage.on("mousedown", this.handleMouseDown);
    this.stage.on("mouseup", this.handleMouseUp);
    this.stage.on("mousemove", this.handleMouseMove);
  }

  private createBackground(): Konva.Layer {
    let layer = new Konva.Layer({ listening: false });

    this.bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: "#3b4547"
    });

    layer.add(this.bgRect);

    return layer;
  }

  public onResize(width: number, height: number) {
    this.stage.width(width);
    this.stage.height(height);

    this.bgRect?.width(width);
    this.bgRect?.height(height);
  }

  private addPoint = (mousePosition: Vector2d) => {
    let node = new Konva.Rect({
      x: mousePosition.x - RECT_SIZE / 2,
      y: mousePosition.y - RECT_SIZE / 2,
      width: RECT_SIZE,
      height: RECT_SIZE,
      fill: COLOR_NORMAL
    });

    let thisPointIndex = this.nodes.length;

    node.on("mouseenter", () => {
      if (this.selection.nodeIndex === -1) {
        this.highlightPoint(thisPointIndex);
      }
    });

    node.on("mouseleave", () => {
      if (
        this.selection.nodeIndex === thisPointIndex &&
        !this.selection.nodeSelected
      ) {
        this.highlightPoint(-1);
      }
    });

    this.nodes.push(node);
    this.nodesLayer.add(node);
    this.highlightPoint(thisPointIndex);
  };

  private handleMouseDown = () => {
    let mousePosition = this.stage.getPointerPosition()!;
    if (this.selection.nodeIndex === -1) {
      this.addPoint(mousePosition);
    } else {
      this.selectPoint(mousePosition);
    }
  };

  private handleMouseUp = () => {
    this.deselectPoint();
  };

  private handleMouseMove = () => {
    if (this.selection.nodeIndex !== -1 && this.selection.nodeSelected) {
      let node = this.nodes[this.selection.nodeIndex];
      let mouse = this.stage.getPointerPosition()!;
      node.x(mouse.x + this.selection.mouseOffset.x);
      node.y(mouse.y + this.selection.mouseOffset.y);
    }
  };

  private highlightPoint(index: number) {
    // unhighlight any previous node
    if (this.selection.nodeIndex !== -1) {
      let node = this.nodes[this.selection.nodeIndex];
      node.fill(COLOR_NORMAL);
      this.selection.nodeIndex = -1;
      this.selection.nodeSelected = false;
    }

    if (index != -1) {
      this.selection.nodeIndex = index;
      this.selection.nodeSelected = false;

      this.nodes[index].fill(COLOR_HIGHLIGHT);
    }
  }

  private selectPoint(mousePosition: Vector2d) {
    this.selection.nodeSelected = true;

    let node = this.nodes[this.selection.nodeIndex];
    node.fill(COLOR_SELECTED);
    node.setZIndex(this.nodes.length - 1);

    this.selection.mouseOffset = {
      x: node.x() - mousePosition.x,
      y: node.y() - mousePosition.y,
    };
  }

  private deselectPoint() {
    this.selection.nodeSelected = false;
    if (this.selection.nodeIndex !== -1) {
      this.nodes[this.selection.nodeIndex].fill(COLOR_HIGHLIGHT);
    }
  }
}
