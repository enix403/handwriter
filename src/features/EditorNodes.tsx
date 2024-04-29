import Konva from "konva";
import { Vector2d } from "konva/lib/types";

export abstract class EditorNode {
  group: Konva.Group;

  constructor() {
    this.group = new Konva.Group({ });
  }

  public initialSize(width: number, height: number) {
    this.group.width(width);
    this.group.height(height);
  }

  public init(initialPosition: Vector2d) {
    this.setup(this.group);

    this.group.x(initialPosition.x - this.getWidth() / 2);
    this.group.y(initialPosition.y - this.getHeight() / 2);

    this.onResize();
  }

  public getWidth = () => this.group.width();
  public getHeight = () => this.group.height();

  public setup(container: Konva.Group) {}
  public onResize() {}
}

export class RectNode extends EditorNode {
  rect: Konva.Rect;

  constructor() {
    super();
    this.rect = new Konva.Rect({
      x: 0,
      y: 0,
      fill: "red"
    });
  }

  setup(container: Konva.Group) {
    this.initialSize(50, 50);

    container.add(this.rect);
  }

  onResize() {
    this.rect.width(this.getWidth());
    this.rect.height(this.getHeight());
  }
}
