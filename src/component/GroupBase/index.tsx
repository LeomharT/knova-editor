import type { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { useEffect, useId, useRef, useState } from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { useBearStore } from '../../hooks/useBearStore';
import TransformerControls from './components/TransformerControls';
import { PRIMARY_COLOR } from './config';

const GROUPS = {
  TRANSFORMED_GROUP: 'TRANSFORMED_GROUP',
  SIZE_TOOLTIP: 'SIZE_TOOLTIP',
};

export default function GroupBase() {
  const id = useId();

  const textRef = useRef(null);
  const textRect = useRef(null);

  const { selected, setSelected } = useBearStore((state) => state);

  const [isHover, setHover] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 20 });

  const [size] = useState({ width: 200, height: 200 });

  const outlinePoints = [0, 0, size.width, 0, size.width, size.height, 0, size.height, 0, 0];

  const isSelected = selected.includes(id);

  function handleOnPointerEnter() {
    setHover(true);
  }

  function handleOnPointerLeave() {
    setHover(false);
  }

  function handleOnDragMove() {}

  function handleOnDragEnd(e: KonvaEventObject<DragEvent, Node<NodeConfig>>) {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });

    setSelected([id]);
  }

  function handleOnSelect(e: KonvaEventObject<PointerEvent>) {
    e.evt.stopPropagation();

    const id = e.target.parent?.id() ?? '1';
    setSelected([id]);
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
    <Group
      draggable
      x={position.x}
      y={position.y}
      onDragEnd={handleOnDragEnd}
      onDragMove={handleOnDragMove}
    >
      <Group
        id={id}
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
        <TransformerControls size={size} points={outlinePoints} visible={isSelected} />
        <Rect width={size.width} height={size.height} fill='#ffd6e7' />
      </Group>
      <Group name={GROUPS.SIZE_TOOLTIP} y={size.height + 5} visible={isSelected}>
        <Rect ref={textRect} fill={PRIMARY_COLOR} cornerRadius={[4, 4, 4, 4]} />
        <Text
          ref={textRef}
          padding={4}
          height={14}
          fontSize={12}
          align='center'
          fill='#ffffff'
          text={`${size.width.toString()} x ${size.height.toString()}`}
        />
      </Group>
    </Group>
  );
}
