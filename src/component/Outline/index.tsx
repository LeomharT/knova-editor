import type Konva from 'konva';
import type { LineConfig } from 'konva/lib/shapes/Line';
import { useRef } from 'react';
import { Line } from 'react-konva';
import type { GroupBaseSize } from '../GroupBase/tpye';

type OutlineProps = LineConfig & {
  size: GroupBaseSize;
};

export default function Outline(props: OutlineProps) {
  const ref = useRef<Konva.Line>(null);

  const points = [
    0,
    0,
    props.size.width,
    0,
    props.size.width,
    props.size.height,
    0,
    props.size.height,
    0,
    0,
  ];

  return <Line {...props} ref={ref} points={points} closed />;
}
