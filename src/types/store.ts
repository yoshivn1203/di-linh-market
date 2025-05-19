export type ShapeType =
  | 'rect'
  | 'rounded'
  | 'circle'
  | 'ellipse'
  | 'hexagon'
  | 'triangle'
  | 'diamond'
  | 'custom1'
  | 'custom2';

export interface Store {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  shapeType: ShapeType;
  rotation: number;
  storeOwner: string;
}
