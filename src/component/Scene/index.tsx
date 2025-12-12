import type Konva from 'konva';
import { useRef } from 'react';
import { Stage, type StageProps } from 'react-konva';

type SceneProps = StageProps;

export default function Scene(props: SceneProps) {
  const ref = useRef<Konva.Stage>(null);

  return <Stage {...props} ref={ref}></Stage>;
}
