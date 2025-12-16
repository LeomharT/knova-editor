import type Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { PRIMARY_COLOR } from '../config';
import type { GroupBasePosition, GroupBaseSize } from '../tpye';

export type SizeTooltipProps = {
  position: GroupBasePosition;
  size: GroupBaseSize;
  rotation: number;
  visible?: boolean;
};

export default function SizeTooltip(props: SizeTooltipProps) {
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

      rectRef.current.width(textSize.width + 8);
      rectRef.current.height(textSize.height + 8);
      rectRef.current.x(textPosition.x);
    }
  }, [props.size, props.position]);

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
      <Group x={0} y={props.size.height + 5} visible={props.visible}>
        <Rect ref={rectRef} fill={PRIMARY_COLOR} cornerRadius={[4, 4, 4, 4]} />
        <Text
          ref={textRef}
          padding={4}
          height={14}
          fontSize={12}
          align='center'
          fill='#ffffff'
          text={`${Math.round(props.size.width)} x ${Math.round(props.size.height)}`}
        />
      </Group>
    </Group>
  );
}
