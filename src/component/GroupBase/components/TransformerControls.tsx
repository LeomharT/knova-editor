import type { KonvaEventObject } from 'konva/lib/Node';
import { Group, Line, Rect } from 'react-konva';
import { PRIMARY_COLOR } from '../config';
import type { GroupBasePosition, GroupBaseSize } from '../tpye';

type TransformerControls = {
  size: GroupBaseSize;
  position: GroupBasePosition;
  points: number[];
  visible?: boolean;
};

export default function TransformerControls(props: TransformerControls) {
  const LINE_WIDTH = 1;

  const CORNERS = {
    TOP_LEFT: [0, 0],
    TOP_RIGHT: [props.size.width, 0],
    BOTTOM_RIGHT: [props.size.width, props.size.height],
    BOTTOM_LEFT: [0, props.size.height],
  };

  function enterScale(e: KonvaEventObject<PointerEvent>, position: keyof typeof CORNERS) {
    e.evt.stopPropagation();

    const cursor = {
      TOP_LEFT: 'url("/resize-nw.png") 20 20, auto',
      TOP_RIGHT: 'url("/resize-ne.png") 20 20, auto',
      BOTTOM_RIGHT: 'url("/resize-ne.png") 20 20, auto',
      BOTTOM_LEFT: 'url("/resize-nw.png") 20 20, auto',
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
    document.body.style.cursor = 'default';
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
      <Group>
        <Rect
          name='TopLeftCtl_Rotate'
          fill='white'
          x={-16}
          y={-16}
          width={16}
          height={16}
          stroke={PRIMARY_COLOR}
          strokeWidth={1}
          onPointerEnter={(e) => enterRotate(e, 'TOP_LEFT')}
          onPointerLeave={leaveControl}
        />
        <Rect
          name='TopLeftCtl_Scale'
          fill='red'
          x={-4.5}
          y={-4.5}
          width={8}
          height={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={1}
          onPointerEnter={(e) => enterScale(e, 'TOP_LEFT')}
          onPointerLeave={leaveControl}
        />
      </Group>
    </Group>
  );
}
