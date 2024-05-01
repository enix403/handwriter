import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";

import { Controls } from "./Controls";

import { EditorNode, RectNode } from "./EditorNodes";

const COLOR_NORMAL = "#F4F5F7";
const COLOR_HIGHLIGHT = "#FF0000";
const COLOR_SELECTED = "#00FF00";

interface SelectionInfo {
  nodeIndex: number;
  nodeSelected: boolean;
  mouseOffset: Vector2d;
}

export class Application {
  private stage: Konva.Stage;
  private bgRect: Konva.Rect | null = null;

  private nodesLayer: Konva.Layer;
  private nodes: Array<EditorNode> = [];

  private controlsLayer: Konva.Layer;
  private controls: Controls;

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

    this.controlsLayer = new Konva.Layer();
    this.controls = new Controls(this.controlsLayer);
    this.stage.add(this.controlsLayer);

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
    let node: EditorNode = new RectNode();
    let nodeIndex = this.nodes.length;

    node.init(mousePosition);

    node.group.on("mouseenter", () => {
      if (this.selection.nodeIndex === -1) {
        this.highlightPoint(nodeIndex);
      }
    });

    node.group.on("mouseleave", () => {
      if (
        this.selection.nodeIndex === nodeIndex &&
        !this.selection.nodeSelected
      ) {
        this.highlightPoint(-1);
      }
    });

    this.nodes.push(node);
    this.nodesLayer.add(node.group);
    this.highlightPoint(nodeIndex);
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
      node.group.x(mouse.x + this.selection.mouseOffset.x);
      node.group.y(mouse.y + this.selection.mouseOffset.y);

      this.controls.adaptNode(node);
    }
  };

  private highlightPoint(index: number) {
    // unhighlight any previous node
    if (this.selection.nodeIndex !== -1) {

      // node.group.fill(COLOR_NORMAL);
      this.selection.nodeIndex = -1;
      this.selection.nodeSelected = false;
      // this.controls.hide();
    }

    if (index != -1) {
      this.selection.nodeIndex = index;
      this.selection.nodeSelected = false;

      let node = this.nodes[this.selection.nodeIndex];

      this.controls.showHover();
      this.controls.adaptNode(node);
    }
  }

  private selectPoint(mousePosition: Vector2d) {
    this.selection.nodeSelected = true;
    this.controls.showFull();

    let node = this.nodes[this.selection.nodeIndex];
    // node.fill(COLOR_SELECTED);
    node.group.setZIndex(this.nodes.length - 1);

    this.selection.mouseOffset = {
      x: node.group.x() - mousePosition.x,
      y: node.group.y() - mousePosition.y
    };
  }

  private deselectPoint() {
    this.selection.nodeSelected = false;
    if (this.selection.nodeIndex !== -1) {
      // this.nodes[this.selection.nodeIndex].fill(COLOR_HIGHLIGHT);
    }
  }
}
