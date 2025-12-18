import Konva from 'konva';
import type { GroupConfig } from 'konva/lib/Group';
import type { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { button, folder, useControls } from 'leva';
import { useEffect, useId, useRef, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import { useBearStore } from '../../hooks/useBearStore';
import { Shapes, type ShapeRect } from '../../types/world';
import Outline from '../Outline';
import Indicator from './components/Indicator';
import TransformerControls from './components/TransformerControls';
import { PRIMARY_COLOR } from './config';
import type { GroupBasePosition, GroupBaseSize } from './tpye';

type GroupBaseProps = GroupConfig & ShapeRect;

export default function GroupBase(props: GroupBaseProps) {
  const id = useId();

  const ref = useRef<Konva.Group>(null);

  const coverRef = useRef<Konva.Image>(null);

  const { world, selected, action, scale, setSelected } = useBearStore();

  const [isHover, setHover] = useState(false);

  const [position, setPosition] = useState({
    x: props.x + props.width / 2.0,
    y: props.y + props.height / 2.0,
  });

  const [size, setSize] = useState({ width: props.width, height: props.height });

  const [rotation, setRotation] = useState(0);

  const outlinePoints = [0, 0, size.width, 0, size.width, size.height, 0, size.height, 0, 0];

  const isSelected = selected.includes(id);

  const [{ fillRectColor }, set] = useControls(() => ({
    [id]: folder(
      {
        fillRectColor: {
          label: 'FillRectColor',
          value: props.fill ?? '#ffd6e7',
        },
        rotation: {
          label: 'Rotation',
          value: rotation,
        },
        ['类型']: {
          options: {
            设备: 'Device',
            链接点: 'Connector',
          },
        },
        ['链接点方向']: {
          options: {
            上: 'TOP',
            下: 'BOTTOM',
            左: 'LEFT',
            右: 'RIGHT',
          },
        },
        ToTop: button(() => {
          const parent = ref.current?.parent;
          parent?.moveToTop();
        }),
        Upload: button(() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.png,.jpe,.jpeg';
          input.multiple = false;

          input.addEventListener('change', (e) => {
            if (e.target instanceof HTMLInputElement) {
              const files = e.target.files;

              if (files && files[0]) {
                const url = URL.createObjectURL(files[0]);
                const image = document.createElement('img');
                image.src = url;

                image.onload = () => {
                  coverRef.current?.image(image);
                };
              }
            }
          });

          input.click();
        }),
      },
      { collapsed: true }
    ),
  }));

  function handleOnPointerEnter() {
    setHover(true);
  }

  function handleOnPointerLeave() {
    setHover(false);
  }

  function handleOnDragMove(e: KonvaEventObject<DragEvent, Node<NodeConfig>>) {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });

    const connectors = world.filter((item) => item.shape === Shapes.ARROW);

    for (const c of connectors) {
      if (c.fromNode?._id === ref.current?._id) {
        const points = c.node.points();
        points[0] = e.target.x();
        points[1] = e.target.y();

        c.node.points(points);
      }
      if (c.toNode?._id === ref.current?._id) {
        const points = c.node.points();
        points[2] = e.target.x();
        points[3] = e.target.y();

        c.node.points(points);
      }
    }
  }

  function handleOnDragEnd() {
    setSelected([id]);
  }

  function handleOnSelect(e: KonvaEventObject<PointerEvent>) {
    e.evt.stopPropagation();

    if (action.active === 'cursor') {
      setSelected([id]);
    }
  }

  function handleOnResize(size: GroupBaseSize) {
    setSize(size);
  }

  function handleOnUpdatePosition(position: GroupBasePosition) {
    if (ref.current) {
      ref.current.x(ref.current.x() + position.x);
      ref.current.y(ref.current.y() + position.y);

      setPosition({
        x: ref.current.x(),
        y: ref.current.y(),
      });
    }
  }

  function handleOnRotate(angle: number) {
    setRotation(angle);
    set({ rotation: angle });

    if (ref.current) {
      ref.current.rotation(angle);
    }
  }

  useEffect(() => {
    setSelected([id]);
  }, [setSelected, id]);

  return (
    <Group id={id}>
      <Group
        ref={ref}
        draggable={action.active === 'cursor'}
        x={position.x}
        y={position.y}
        width={size.width}
        height={size.height}
        offsetX={size.width / 2.0}
        offsetY={size.height / 2.0}
        onDragEnd={handleOnDragEnd}
        onDragMove={handleOnDragMove}
        onPointerEnter={handleOnPointerEnter}
        onPointerLeave={handleOnPointerLeave}
        onPointerClick={handleOnSelect}
      >
        <Outline size={size} strokeWidth={4 / scale} stroke={PRIMARY_COLOR} visible={isHover} />
        <Rect width={size.width} height={size.height} fill={fillRectColor} />
        <Image ref={coverRef} image={undefined} width={size.width} height={size.height} />
      </Group>
      <TransformerControls
        id={id}
        size={size}
        position={position}
        rotation={rotation}
        points={outlinePoints}
        visible={isSelected}
        onResize={handleOnResize}
        onRotate={handleOnRotate}
        onUpdatePosition={handleOnUpdatePosition}
      />
      <Indicator
        text={id}
        position={position}
        rotation={rotation}
        size={size}
        visible={isSelected}
        top={5}
      />
      <Indicator
        text={`${Math.round(size.width)} x ${Math.round(size.height)}`}
        position={position}
        rotation={rotation}
        size={size}
        visible={isSelected}
        top={30}
      />
    </Group>
  );
}
