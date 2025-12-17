import type Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useBearStore } from '../../../hooks/useBearStore';
import { PRIMARY_COLOR } from '../config';
import type { GroupBasePosition, GroupBaseSize } from '../tpye';

export type SizeTooltipProps = {
  text: string;
  position: GroupBasePosition;
  size: GroupBaseSize;
  rotation: number;
  visible?: boolean;
  top?: number;
};

export default function SizeTooltip(props: SizeTooltipProps) {
  const { scale } = useBearStore();

  const ref = useRef<Konva.Group>(null);

  const rectRef = useRef<Konva.Rect>(null);

  const textRef = useRef<Konva.Text>(null);

  useEffect(() => {
    if (textRef.current && rectRef.current) {
      const textSize = {
        width: textRef.current.textWidth,
        height: textRef.current.textHeight,
      };
      const textPosition = {
        x: props.size.width / 2.0 - textSize.width / 2.0,
      };

      textRef.current.x(textPosition.x);

      rectRef.current.width(textSize.width + 8 / scale);
      rectRef.current.height(textSize.height + 8 / scale);
      rectRef.current.x(textPosition.x);
    }
  }, [props.size, props.position, scale]);

  useEffect(() => {
    if (ref.current) {
      ref.current.offsetX(props.size.width / 2.0);
      ref.current.offsetY(props.size.height / 2.0);

      ref.current.rotation(props.rotation);

      ref.current.x(props.position.x);
      ref.current.y(props.position.y);
    }
  }, [props.rotation, props.position, props.size]);

  return (
    <Group ref={ref}>
      <Group x={0} y={props.size.height + (props.top ?? 0) / scale} visible={props.visible}>
        <Rect
          ref={rectRef}
          fill={PRIMARY_COLOR}
          cornerRadius={[4 / scale, 4 / scale, 4 / scale, 4 / scale]}
        />
        <Text
          ref={textRef}
          padding={4 / scale}
          height={14 / scale}
          fontSize={12 / scale}
          align='center'
          fill='#ffffff'
          text={props.text}
        />
      </Group>
    </Group>
  );
}
