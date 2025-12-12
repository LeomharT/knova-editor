import type Konva from 'konva';
import type { LineConfig } from 'konva/lib/shapes/Line';
import { useEffect, useRef } from 'react';
import { Line } from 'react-konva';

type RectBorderProps = LineConfig;

export default function RectBorder(props: RectBorderProps) {
  const ref = useRef<Konva.Line>(null);

  useEffect(() => {
    if (ref.current) {
      console.log(ref.current.parent);
    }
  }, []);

  return <Line {...props} ref={ref} closed />;
}
