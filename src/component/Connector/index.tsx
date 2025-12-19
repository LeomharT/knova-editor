import type { GroupConfig } from 'konva/lib/Group';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useId, useState } from 'react';
import { Arrow, Circle, Group } from 'react-konva';
import { useBearStore } from '../../hooks/useBearStore';
import type { ShapeArrow } from '../../types/world';
import Outline from '../Outline';

type ConnectorProps = GroupConfig & ShapeArrow;

const PRIMARY_COLOR = '#1677ff';

export default function Connector(props: ConnectorProps) {
  const id = useId();

  const { scale, selected, action, setSelected } = useBearStore();

  const [isHover, setHover] = useState(false);
  const [isDraging, setDraging] = useState(false);

  const [points, setPoints] = useState(props.points);

  const from = { x: points[0], y: points[1] };

  const to = { x: points[points.length - 2], y: points[points.length - 1] };

  const isSelected = selected.includes(id);

  function handleOnPointerEnter() {
    setHover(true);
  }

  function handleOnPointerLeave() {
    setHover(false);
  }

  function handleOnDragStart() {
    setDraging(true);
  }

  function handleOnDragEnd() {
    setDraging(false);
  }

  function handleOnSelect(e: KonvaEventObject<PointerEvent>) {
    e.evt.stopPropagation();

    console.log(e);

    if (action.active === 'cursor') {
      setSelected([id]);
    }
  }

  function handleOnDragMove(e: KonvaEventObject<DragEvent>, end: 'from' | 'to' | 'middle') {
    const coord = {
      x: e.target.x(),
      y: e.target.y(),
    };

    setPoints((prev) => {
      if (end === 'from') {
        prev[0] = coord.x;
        prev[1] = coord.y;
      }
      if (end === 'to') {
        prev[prev.length - 2] = coord.x;
        prev[prev.length - 1] = coord.y;
      }

      if (end === 'middle') {
        const points = [
          prev[0],
          prev[1],
          coord.x,
          coord.y,
          prev[prev.length - 2],
          prev[prev.length - 1],
        ];

        return points;
      }

      return prev;
    });
  }

  return (
    <Group
      id={id}
      onPointerEnter={handleOnPointerEnter}
      onPointerLeave={handleOnPointerLeave}
      onPointerClick={handleOnSelect}
    >
      <Arrow
        {...props}
        points={points}
        stroke={isHover && !isDraging ? PRIMARY_COLOR : props.stroke}
        listening={true}
        draggable={false}
        tension={0.25}
        hitStrokeWidth={40}
      />
      <Outline
        x={Math.min(from.x, to.x)}
        y={Math.min(from.y, to.y)}
        size={{ width: Math.abs(from.x - to.x), height: Math.abs(from.y - to.y) }}
        strokeWidth={2 / scale}
        stroke={PRIMARY_COLOR}
        visible={isSelected && !isDraging}
      />
      <Group name='Transfromer-Arrow'>
        <Circle
          draggable
          fill={'white'}
          stroke={PRIMARY_COLOR}
          strokeWidth={1 / scale}
          radius={8 / scale}
          x={from.x}
          y={from.y}
          onDragStart={handleOnDragStart}
          onDragEnd={handleOnDragEnd}
          onDragMove={(e) => handleOnDragMove(e, 'from')}
        />
        <Circle
          draggable
          fill={'white'}
          stroke={PRIMARY_COLOR}
          strokeWidth={1 / scale}
          radius={8 / scale}
          x={(from.x + to.x) / 2}
          y={(from.y + to.y) / 2}
          onDragStart={handleOnDragStart}
          onDragEnd={handleOnDragEnd}
          onDragMove={(e) => handleOnDragMove(e, 'middle')}
        />
        <Circle
          draggable
          fill={'white'}
          stroke={PRIMARY_COLOR}
          strokeWidth={1 / scale}
          radius={8 / scale}
          x={to.x}
          y={to.y}
          onDragStart={handleOnDragStart}
          onDragEnd={handleOnDragEnd}
          onDragMove={(e) => handleOnDragMove(e, 'to')}
        />
      </Group>
    </Group>
  );
}
