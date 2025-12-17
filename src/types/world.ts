export const ShapeType = {
  RECT: 'RECT',
  ARROW: 'ARROW',
};

export interface World {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
}
