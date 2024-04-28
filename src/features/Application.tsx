import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";

type KvMouseEvent = KonvaEventObject<MouseEvent>;

const COLOR_NORMAL = "#0B1416";
const COLOR_HIGHLIGHT = "#FF0000";
const COLOR_SELECTED = "#00FF00";

interface SelectionInfo {
  pointIndex: number;
  pointSelected: boolean;
}

export class Application {
  private stage: Konva.Stage;
  private bgRect: Konva.Rect | null = null;

  private pointsLayer: Konva.Layer;
  private points: Array<Konva.Circle> = [];

  private selection: SelectionInfo = {
    pointIndex: -1,
    pointSelected: false
  };

  constructor(stageContainer: HTMLDivElement, width: number, height: number) {
    this.stage = new Konva.Stage({
      container: stageContainer,
      width,
      height
    });

    this.stage.add(this.createBackground());

    this.pointsLayer = new Konva.Layer();
    this.stage.add(this.pointsLayer);

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
      fill: "#F4F5F7"
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

  private addPoint = () => {
    let pos = this.stage.getPointerPosition()!;

    let point = new Konva.Circle({
      x: pos.x,
      y: pos.y,
      radius: 20,
      fill: COLOR_NORMAL
    });

    let thisPointIndex = this.points.length;

    point.on("mouseenter", () => {
      if (this.selection.pointIndex === -1) {
        this.highlightPoint(thisPointIndex);
      }
    });

    point.on("mouseleave", () => {
      if (
        this.selection.pointIndex === thisPointIndex &&
        !this.selection.pointSelected
      ) {
        this.highlightPoint(-1);
      }
    });

    this.points.push(point);
    this.pointsLayer.add(point);
    this.highlightPoint(thisPointIndex);
  };

  private handleMouseDown = () => {
    if (this.selection.pointIndex === -1) {
      this.addPoint();
    } else {
      this.selectPoint();
    }
  };

  private handleMouseUp = () => {
    this.deselectPoint();
  };

  private handleMouseMove = () => {
    if (this.selection.pointIndex !== -1 && this.selection.pointSelected) {
      let point = this.points[this.selection.pointIndex];
      let mouse = this.stage.getPointerPosition()!;
      point.x(mouse.x);
      point.y(mouse.y);
    }
  };

  private highlightPoint(index: number) {
    // unhighlight any previous point
    if (this.selection.pointIndex !== -1) {
      let point = this.points[this.selection.pointIndex];
      point.fill(COLOR_NORMAL);
      this.selection.pointIndex = -1;
      this.selection.pointSelected = false;
    }

    if (index != -1) {
      this.selection.pointIndex = index;
      this.selection.pointSelected = false;

      this.points[index].fill(COLOR_HIGHLIGHT);
    }
  }

  private selectPoint() {
    this.selection.pointSelected = true;
    let point = this.points[this.selection.pointIndex];
    point.fill(COLOR_SELECTED);
    point.setZIndex(this.points.length - 1);
  }

  private deselectPoint() {
    this.selection.pointSelected = false;
    if (this.selection.pointIndex !== -1) {
      this.points[this.selection.pointIndex].fill(COLOR_HIGHLIGHT);
    }
  }
}
