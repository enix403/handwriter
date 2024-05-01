import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { EditorNode } from "./EditorNodes";

export class Controls {
  private rect: Konva.Rect;

  constructor(layer: Konva.Layer) {
    this.rect = this.build();
    this.rect.hide();
    layer.add(this.rect);
  }

  build() {
    let rect = new Konva.Rect({
      stroke: 'white',
      strokeWidth: 2,
      listening: false
    });

    return rect;
  }

  hide() {
    this.rect.hide();
  }

  showHover() {
    this.rect.show();
    this.rect.stroke('white');
  }

  showFull() {
    this.rect.show();
    this.rect.stroke('blue');
  }

  adaptNode(node: EditorNode) {
    this.rect.x(node.getX());
    this.rect.y(node.getY());
    this.rect.width(node.getWidth());
    this.rect.height(node.getHeight());
  }
}
