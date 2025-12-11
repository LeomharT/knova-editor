import { Group, Line } from 'react-konva';
import { PRIMARY_COLOR } from '../config';
import type { GroupBaseSize } from '../tpye';

type TransformerControls = {
  size: GroupBaseSize;
  points: number[];
  visible?: boolean;
};

export default function TransformerControls(props: TransformerControls) {
  return (
    <Group name='TransformerControls' visible={props.visible}>
      <Line closed dashEnabled points={props.points} stroke={PRIMARY_COLOR} strokeWidth={2} />
    </Group>
  );
}
