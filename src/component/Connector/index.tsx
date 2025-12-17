import type { GroupConfig } from 'konva/lib/Group';
import { useId } from 'react';
import { Arrow, Group } from 'react-konva';
import type { ShapeArrow } from '../../types/world';

type ConnectorProps = GroupConfig & ShapeArrow;

export default function Connector(props: ConnectorProps) {
  const id = useId();

  return (
    <Group id={id}>
      <Arrow {...props} />
    </Group>
  );
}
