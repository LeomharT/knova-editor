import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useControls } from 'leva';
import { useEffect, useRef } from 'react';
import { Group, Line, Rect } from 'react-konva';
import { useBearStore } from '../../../hooks/useBearStore';
import { PRIMARY_COLOR } from '../config';
import type { GroupBasePosition, GroupBaseSize } from '../tpye';

type TransformerControls = {
  size: GroupBaseSize;
  position: GroupBasePosition;
  points: number[];
  rotation: number;
  visible?: boolean;
  onResize?: (size: GroupBaseSize) => void;
  onUpdatePosition?: (position: GroupBasePosition) => void;
  onRotate?: (angle: number) => void;
  onRotateEnd?: () => void;
};

export default function TransformerControls(props: TransformerControls) {
  const { scale } = useBearStore();

  const LINE_WIDTH = 1 / scale;

  const CORNERS = {
    TOP_LEFT: [0, 0],
    TOP_RIGHT: [props.size.width, 0],
    BOTTOM_RIGHT: [props.size.width, props.size.height],
    BOTTOM_LEFT: [0, props.size.height],
  };

  const ref = useRef<Konva.Group>(null);

  const enableResize = useRef(false);

  const enableRotate = useRef(false);

  const prevCoord = useRef({
    x: 0,
    y: 0,
  });

  const rotation = useRef({
    pointerAngle: 0,
    prevRotate: props.rotation,
    currRotate: 0,
  });

  const { debugControls } = useControls('TransformerControls', {
    debugControls: false,
  });

  function enterScale(e: KonvaEventObject<PointerEvent>, position: keyof typeof CORNERS) {
    e.evt.stopPropagation();

    const cursor = {
      TOP_LEFT: 'url("/resize-nw.png") 20 20, auto',
      TOP_RIGHT: 'url("/resize-ne.png") 20 20, auto',
      BOTTOM_RIGHT: 'url("/resize-nw.png") 20 20, auto',
      BOTTOM_LEFT: 'url("/resize-ne.png") 20 20, auto',
    };

    document.body.style.cursor = cursor[position];
  }

  function enterRotate(e: KonvaEventObject<PointerEvent>, position: keyof typeof CORNERS) {
    e.evt.stopPropagation();

    const cursor = {
      TOP_LEFT: 'url("/rotate.svg") 12 12, auto',
      TOP_RIGHT: 'url("/rotate.svg") 12 12, auto',
      BOTTOM_RIGHT: 'url("/rotate.svg") 12 12, auto',
      BOTTOM_LEFT: 'url("/rotate.svg") 12 12, auto',
    };

    document.body.style.cursor = cursor[position];
  }

  function leaveControl() {
    document.body.style.cursor = "url('/cursor.png') 0 0, default";
  }

  function onResizeStart(e: KonvaEventObject<PointerEvent>) {
    const stage = e.target.getStage()!;

    enableResize.current = true;

    const canvas = e.target;
    canvas.setPointerCapture(e.evt.pointerId);

    prevCoord.current = stage.getPointerPosition()!;
  }

  function onResizeEnd() {
    enableResize.current = false;
  }

  function resizeRect(e: KonvaEventObject<PointerEvent>, position: keyof typeof CORNERS) {
    const stage = e.target.getStage();

    if (!enableResize.current || !stage) return;

    const corner = {
      TOP_LEFT: { x: 1, y: 1, up: -1, left: -1 },
      TOP_RIGHT: { x: -1, y: 1, up: -1, left: 1 },
      BOTTOM_RIGHT: { x: -1, y: -1, up: 1, left: 1 },
      BOTTOM_LEFT: { x: 1, y: -1, up: 1, left: -1 },
    };

    const coord = {
      x: stage.getPointerPosition()?.x ?? 0,
      y: stage.getPointerPosition()?.y ?? 0,
    };

    const amount = {
      x: coord.x - prevCoord.current.x,
      y: coord.y - prevCoord.current.y,
    };
    amount.x /= scale;
    amount.y /= scale;

    prevCoord.current = {
      x: coord.x,
      y: coord.y,
    };

    const rad = props.rotation * (Math.PI / 180);
    const localDx = amount.x * Math.cos(rad) + amount.y * Math.sin(rad);
    const localDy = -amount.x * Math.sin(rad) + amount.y * Math.cos(rad);

    const newSize = {
      width: props.size.width + localDx * corner[position].left,
      height: props.size.height + localDy * corner[position].up,
    };

    props.onResize?.(newSize);

    // const localOffsetX = corner[position].x === 1 ? localDx : 0;
    // const localOffsetY = corner[position].y === 1 ? localDy : 0;
    const moveLocalX = ((localDx * corner[position].left) / 2) * corner[position].x * -1;
    const moveLocalY = ((localDy * corner[position].up) / 2) * corner[position].y * -1;

    const globalDX = moveLocalX * Math.cos(rad) - moveLocalY * Math.sin(rad);
    const globalDY = moveLocalX * Math.sin(rad) + moveLocalY * Math.cos(rad);

    const newPosition = {
      x: globalDX,
      y: globalDY,
    };

    props.onUpdatePosition?.(newPosition);
  }

  function onRotateStart(e: KonvaEventObject<PointerEvent>) {
    const stage = e.target.getStage()!;

    enableRotate.current = true;

    const canvas = e.target;
    canvas.setPointerCapture(e.evt.pointerId);

    const coord = stage.getPointerPosition()!;

    const center = props.position;

    rotation.current.pointerAngle =
      Math.atan2(coord.y - center.y, coord.x - center.x) * (180 / Math.PI);
  }

  function onRotateEnd() {
    enableRotate.current = false;
    props.onRotateEnd?.call({});

    rotation.current.prevRotate = rotation.current.currRotate;
  }

  function rotateRect(e: KonvaEventObject<PointerEvent>) {
    const stage = e.target.getStage();

    if (!enableRotate.current || !stage) return;

    const coord = stage.getPointerPosition()!;

    const center = props.position;

    const angle = Math.atan2(coord.y - center.y, coord.x - center.x) * (180 / Math.PI);
    const rotateAngle = rotation.current.pointerAngle - angle;

    rotation.current.currRotate = rotation.current.prevRotate + rotateAngle;

    props.onRotate?.call({}, -rotation.current.currRotate);
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.offsetX(props.size.width / 2.0);
      ref.current.offsetY(props.size.height / 2.0);

      ref.current.rotation(props.rotation);

      ref.current.x(props.position.x);
      ref.current.y(props.position.y);
    }
  }, [props.rotation, props.position, props.size]);

  return (
    <Group ref={ref} name='TransformerControls' visible={props.visible}>
      <Line
        name='TopLine'
        closed={false}
        points={[...CORNERS.TOP_LEFT, ...CORNERS.TOP_RIGHT]}
        stroke={PRIMARY_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      <Line
        name='RightLine'
        closed={false}
        points={[...CORNERS.TOP_RIGHT, ...CORNERS.BOTTOM_RIGHT]}
        stroke={PRIMARY_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      <Line
        name='BottomLine'
        closed={false}
        points={[...CORNERS.BOTTOM_RIGHT, ...CORNERS.BOTTOM_LEFT]}
        stroke={PRIMARY_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      <Line
        name='LeftLine'
        closed={false}
        points={[...CORNERS.BOTTOM_LEFT, ...CORNERS.TOP_LEFT]}
        stroke={PRIMARY_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      {/* Top Left */}
      <Group>
        <Rect
          name='TopLeftCtl_Rotate'
          fill={debugControls ? 'white' : 'transparent'}
          x={-16}
          y={-16}
          width={16}
          height={16}
          stroke={debugControls ? PRIMARY_COLOR : 'transparent'}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterRotate(e, 'TOP_LEFT')}
          onPointerLeave={leaveControl}
          onPointerDown={onRotateStart}
          onPointerUp={onRotateEnd}
          onPointerMove={rotateRect}
        />
        <Rect
          name='TopLeftCtl_Scale'
          fill='white'
          x={-4.5}
          y={-4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterScale(e, 'TOP_LEFT')}
          onPointerLeave={leaveControl}
          onPointerDown={onResizeStart}
          onPointerUp={onResizeEnd}
          onPointerMove={(e) => resizeRect(e, 'TOP_LEFT')}
        />
      </Group>
      {/* Top Right */}
      <Group>
        <Rect
          name='TopRightCtl_Rotate'
          fill={debugControls ? 'white' : 'transparent'}
          x={props.size.width}
          y={-16}
          width={16}
          height={16}
          stroke={debugControls ? PRIMARY_COLOR : 'transparent'}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterRotate(e, 'TOP_RIGHT')}
          onPointerLeave={leaveControl}
          onPointerDown={onRotateStart}
          onPointerUp={onRotateEnd}
          onPointerMove={rotateRect}
        />
        <Rect
          name='TopRightCtl_Scale'
          fill='white'
          x={props.size.width - 4.5}
          y={-4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterScale(e, 'TOP_RIGHT')}
          onPointerLeave={leaveControl}
          onPointerDown={onResizeStart}
          onPointerUp={onResizeEnd}
          onPointerMove={(e) => resizeRect(e, 'TOP_RIGHT')}
        />
      </Group>
      {/* Bottom Right */}
      <Group>
        <Rect
          name='BottomRightCtl_Rotate'
          fill={debugControls ? 'white' : 'transparent'}
          x={props.size.width}
          y={props.size.height}
          width={16}
          height={16}
          stroke={debugControls ? PRIMARY_COLOR : 'transparent'}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterRotate(e, 'BOTTOM_RIGHT')}
          onPointerLeave={leaveControl}
          onPointerDown={onRotateStart}
          onPointerUp={onRotateEnd}
          onPointerMove={rotateRect}
        />
        <Rect
          name='BottomRightCtl_Scale'
          fill='white'
          x={props.size.width - 4.5}
          y={props.size.height - 4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterScale(e, 'BOTTOM_RIGHT')}
          onPointerLeave={leaveControl}
          onPointerDown={onResizeStart}
          onPointerUp={onResizeEnd}
          onPointerMove={(e) => resizeRect(e, 'BOTTOM_RIGHT')}
        />
      </Group>
      {/* Bottom Left */}
      <Group>
        <Rect
          name='BottomLeftCtl_Rotate'
          fill={debugControls ? 'white' : 'transparent'}
          x={-16}
          y={props.size.height}
          width={16}
          height={16}
          stroke={debugControls ? PRIMARY_COLOR : 'transparent'}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterRotate(e, 'BOTTOM_LEFT')}
          onPointerLeave={leaveControl}
          onPointerDown={onRotateStart}
          onPointerUp={onRotateEnd}
          onPointerMove={rotateRect}
        />
        <Rect
          name='BottomLeftCtl_Scale'
          fill='white'
          x={-4.5}
          y={props.size.height - 4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={LINE_WIDTH}
          onPointerEnter={(e) => enterScale(e, 'BOTTOM_LEFT')}
          onPointerLeave={leaveControl}
          onPointerDown={onResizeStart}
          onPointerUp={onResizeEnd}
          onPointerMove={(e) => resizeRect(e, 'BOTTOM_LEFT')}
        />
      </Group>
    </Group>
  );
}
