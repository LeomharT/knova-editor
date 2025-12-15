import Konva from 'konva';
import type { GroupConfig } from 'konva/lib/Group';
import type { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { button, folder, useControls } from 'leva';
import { useEffect, useId, useRef, useState } from 'react';
import { Group, Image, Rect, Text } from 'react-konva';
import { useBearStore } from '../../hooks/useBearStore';
import Outline from '../Outline';
import SizeTooltip from './components/SizeTooltip';
import TransformerControls from './components/TransformerControls';
import { PRIMARY_COLOR } from './config';
import type { GroupBasePosition, GroupBaseSize } from './tpye';

type GroupBaseProps = GroupConfig;

export default function GroupBase(props: GroupBaseProps) {
  const id = useId();

  const ref = useRef<Konva.Group>(null);

  const coverRef = useRef<Konva.Image>(null);

  const textRef = useRef(null);
  const textRect = useRef(null);

  const { selected, setSelected, action } = useBearStore();

  const [isHover, setHover] = useState(false);

  const [position, setPosition] = useState({ x: 50, y: 50 });

  const [size, setSize] = useState({ width: 200, height: 200 });

  const [rotation, setRotation] = useState(0);

  const [displacement, setDisplacement] = useState(position);

  const outlinePoints = [0, 0, size.width, 0, size.width, size.height, 0, size.height, 0, 0];

  const isSelected = selected.includes(id);

  const [{ fillRectColor }, set] = useControls(() => ({
    GroupBase: folder({
      fillRectColor: {
        label: 'FillRectColor',
        value: '#ffd6e7',
      },
      rotation: {
        label: 'Rotation',
        value: rotation,
      },
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
    }),
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
    setDisplacement({
      x: e.target.x() - e.target.offsetX(),
      y: e.target.y() - e.target.offsetY(),
    });
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

    setupTooltip();
  }

  function handleOnUpdatePosition(position: GroupBasePosition) {
    setPosition(position);

    if (ref.current) {
      setDisplacement({
        x: position.x - ref.current.offsetX(),
        y: position.y - ref.current.offsetY(),
      });
    }

    setupTooltip();
  }

  function handleOnRotate(angle: number) {
    setRotation(angle);
    set({
      rotation: angle,
    });

    if (ref.current) {
      const center = {
        x: displacement.x + size.width / 2.0,
        y: displacement.y + size.height / 2.0,
      };

      ref.current.offsetX(size.width / 2.0);
      ref.current.offsetY(size.height / 2.0);

      ref.current.rotation(angle);

      ref.current.x(center.x);
      ref.current.y(center.y);
    }
  }

  function setupTooltip() {
    if (textRef.current && textRect.current) {
      const textSize = {
        width: (textRef.current as any).textWidth,
        height: (textRef.current as any).textHeight,
      };
      const textPosition = {
        x: size.width / 2.0 - textSize.width / 2.0,
      };

      (textRef.current as any).setX(textPosition.x);

      (textRect.current as any).setWidth(textSize.width + 8);
      (textRect.current as any).setHeight(textSize.height + 8);
      (textRect.current as any).setX(textPosition.x);
    }
  }

  useEffect(() => {
    setupTooltip();
  }, []);

  return (
    <Group id={id} {...props}>
      <Group
        ref={ref}
        draggable={action.active === 'cursor'}
        x={position.x}
        y={position.y}
        width={size.width}
        height={size.height}
        onDragEnd={handleOnDragEnd}
        onDragMove={handleOnDragMove}
        onPointerEnter={handleOnPointerEnter}
        onPointerLeave={handleOnPointerLeave}
        onPointerClick={handleOnSelect}
      >
        <Outline size={size} strokeWidth={4} stroke={PRIMARY_COLOR} visible={isHover} />
        <Rect width={size.width} height={size.height} fill={fillRectColor} />
        <Image ref={coverRef} image={undefined} width={size.width} height={size.height} />
        <Text text='Hello'></Text>
      </Group>
      <TransformerControls
        size={size}
        position={displacement}
        rotation={rotation}
        points={outlinePoints}
        visible={isSelected}
        onResize={handleOnResize}
        onRotate={handleOnRotate}
        onUpdatePosition={handleOnUpdatePosition}
      />
      <SizeTooltip position={displacement} rotation={rotation} size={size} visible={isSelected} />
    </Group>
  );
}
