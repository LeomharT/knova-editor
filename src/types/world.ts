import type Konva from 'konva';

export const Shapes = {
  RECT: 'RECT',
  ARROW: 'ARROW',
} as const;

type BaseShape = {
  key: string;
  fill?: string;
};

export type ShapeRect = BaseShape & {
  shape: typeof Shapes.RECT;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ShapeArrow = BaseShape & {
  shape: typeof Shapes.ARROW;
  node: Konva.Arrow;
  fromNode: Konva.Group | null;
  toNode: Konva.Group | null;
  points: number[];
  stroke: 'string';
  dashEnabled: boolean;
  dash: number[];
  dashOffset: number;
  draggable: boolean;
  pointerLength: number;
  pointerWidth: number;
  pointerAtEnding: boolean;
  pointerAtBeginning: boolean;
  listening: boolean;
};

export type World = ShapeRect | ShapeArrow;
