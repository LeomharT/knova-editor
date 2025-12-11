import type { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { useControls } from 'leva';
import { useEffect, useId, useRef, useState } from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { useBearStore } from '../../hooks/useBearStore';
import TransformerControls from './components/TransformerControls';
import { PRIMARY_COLOR } from './config';
import type { GroupBasePosition, GroupBaseSize } from './tpye';

export default function GroupBase() {
  const id = useId();

  const textRef = useRef(null);
  const textRect = useRef(null);

  const { selected, setSelected } = useBearStore((state) => state);

  const [isHover, setHover] = useState(false);

  const [position, setPosition] = useState({ x: 50, y: 50 });

  const [size, setSize] = useState({ width: 200, height: 200 });

  const outlinePoints = [0, 0, size.width, 0, size.width, size.height, 0, size.height, 0, 0];

  const isSelected = selected.includes(id);

  const { fillRectColor } = useControls({
    fillRectColor: '#ffd6e7',
  });

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
  }

  function handleOnDragEnd() {
    setSelected([id]);
  }

  function handleOnSelect(e: KonvaEventObject<PointerEvent>) {
    e.evt.stopPropagation();

    setSelected([id]);
  }

  function handleOnResize(size: GroupBaseSize) {
    setSize(size);

    setupTooltip();
  }

  function handleOnUpdatePosition(position: GroupBasePosition) {
    setPosition(position);

    setupTooltip();
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
    <Group id={id}>
      <Group
        draggable
        x={position.x}
        y={position.y}
        onDragEnd={handleOnDragEnd}
        onDragMove={handleOnDragMove}
        onPointerEnter={handleOnPointerEnter}
        onPointerLeave={handleOnPointerLeave}
        onPointerClick={handleOnSelect}
      >
        <Line
          closed
          dashEnabled
          points={outlinePoints}
          stroke={PRIMARY_COLOR}
          visible={isHover}
          strokeWidth={4}
        />
        <Rect width={size.width} height={size.height} fill={fillRectColor} />
      </Group>
      <TransformerControls
        size={size}
        position={position}
        points={outlinePoints}
        visible={isSelected}
        onResize={handleOnResize}
        onUpdatePosition={handleOnUpdatePosition}
      />
      <Group
        name={'SIZE_TOOLTIP'}
        x={position.x}
        y={position.y + size.height + 5}
        visible={isSelected}
      >
        <Rect ref={textRect} fill={PRIMARY_COLOR} cornerRadius={[4, 4, 4, 4]} />
        <Text
          ref={textRef}
          padding={4}
          height={14}
          fontSize={12}
          align='center'
          fill='#ffffff'
          text={`${Math.round(size.width)} x ${Math.round(size.height)}`}
        />
      </Group>
    </Group>
  );
}
