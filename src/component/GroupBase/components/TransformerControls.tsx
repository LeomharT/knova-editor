import type { KonvaEventObject } from 'konva/lib/Node';
import { useControls } from 'leva';
import { useRef } from 'react';
import { Group, Line, Rect } from 'react-konva';
import { PRIMARY_COLOR } from '../config';
import type { GroupBasePosition, GroupBaseSize } from '../tpye';

type TransformerControls = {
  size: GroupBaseSize;
  position: GroupBasePosition;
  points: number[];
  visible?: boolean;
  onResize?: (size: GroupBaseSize) => void;
  onUpdatePosition?: (position: GroupBasePosition) => void;
};

export default function TransformerControls(props: TransformerControls) {
  const LINE_WIDTH = 1;

  const CORNERS = {
    TOP_LEFT: [0, 0],
    TOP_RIGHT: [props.size.width, 0],
    BOTTOM_RIGHT: [props.size.width, props.size.height],
    BOTTOM_LEFT: [0, props.size.height],
  };

  const enableResize = useRef(false);

  const prevCoord = useRef({
    x: 0,
    y: 0,
  });

  const { debugControls } = useControls({
    debugControls: true,
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
      TOP_LEFT: 'url("/rotate1.png") 20 20, auto',
      TOP_RIGHT: 'url("/rotate2.png") 20 20, auto',
      BOTTOM_RIGHT: 'url("/rotate3.png") 20 20, auto',
      BOTTOM_LEFT: 'url("/rotate4.png") 20 20, auto',
    };

    document.body.style.cursor = cursor[position];
  }

  function leaveControl() {
    document.body.style.cursor = "url('/cursor.png') 0 0, default";
  }

  function onResizeStart(e: KonvaEventObject<PointerEvent>) {
    enableResize.current = true;

    const canvas = e.target;
    canvas.setPointerCapture(e.evt.pointerId);

    prevCoord.current = {
      x: e.evt.clientX,
      y: e.evt.clientY,
    };
  }

  function onResizeEnd() {
    enableResize.current = false;
  }

  function resizeRect(e: KonvaEventObject<PointerEvent>, position: keyof typeof CORNERS) {
    if (!enableResize.current) return;

    const corner = {
      TOP_LEFT: { x: 0, y: 0, up: -1, left: -1 },
      TOP_RIGHT: { x: -1, y: 0, up: -1, left: 1 },
      BOTTOM_RIGHT: { x: -1, y: -1, up: 1, left: 1 },
      BOTTOM_LEFT: { x: 0, y: -1, up: 1, left: -1 },
    };

    const coord = {
      x: e.evt.clientX,
      y: e.evt.clientY,
    };

    const amount = {
      x: coord.x - prevCoord.current.x,
      y: coord.y - prevCoord.current.y,
    };

    prevCoord.current = {
      x: coord.x,
      y: coord.y,
    };

    props.onResize?.call(
      {},
      {
        width: props.size.width + amount.x * corner[position].left,
        height: props.size.height + amount.y * corner[position].up,
      }
    );

    const newPosition = { x: 0, y: 0 };

    newPosition.x = props.size.width + amount.x * corner[position].left;
    newPosition.x *= corner[position].x;

    newPosition.y = props.size.height + amount.y * corner[position].up;
    newPosition.y *= corner[position].y;

    props.onUpdatePosition?.call(
      {},
      {
        x: coord.x + newPosition.x,
        y: coord.y + newPosition.y,
      }
    );
  }

  return (
    <Group
      name='TransformerControls'
      x={props.position.x}
      y={props.position.y}
      visible={props.visible}
    >
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
          strokeWidth={1}
          onPointerEnter={(e) => enterRotate(e, 'TOP_LEFT')}
          onPointerLeave={leaveControl}
        />
        <Rect
          name='TopLeftCtl_Scale'
          fill='white'
          x={-4.5}
          y={-4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={1}
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
          strokeWidth={1}
          onPointerEnter={(e) => enterRotate(e, 'TOP_RIGHT')}
          onPointerLeave={leaveControl}
        />
        <Rect
          name='TopRightCtl_Scale'
          fill='white'
          x={props.size.width - 4.5}
          y={-4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={1}
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
          strokeWidth={1}
          onPointerEnter={(e) => enterRotate(e, 'BOTTOM_RIGHT')}
          onPointerLeave={leaveControl}
        />
        <Rect
          name='BottomRightCtl_Scale'
          fill='white'
          x={props.size.width - 4.5}
          y={props.size.height - 4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={1}
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
          strokeWidth={1}
          onPointerEnter={(e) => enterRotate(e, 'BOTTOM_LEFT')}
          onPointerLeave={leaveControl}
        />
        <Rect
          name='BottomLeftCtl_Scale'
          fill='white'
          x={-4.5}
          y={props.size.height - 4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={1}
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
