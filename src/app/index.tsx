import { App as AntdApp } from 'antd';
import { Leva } from 'leva';
import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage, Text } from 'react-konva';
import GroupBase from '../component/GroupBase';
import { useBearStore } from '../hooks/useBearStore';

export default function App() {
  const ref = useRef<HTMLImageElement>(document.createElement('img'));

  const setSelect = useBearStore((state) => state.setSelected);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ref.current.src = '/download.svg';
    ref.current.onload = () => setLoading(false);
  }, []);
  return (
    <AntdApp>
      <Leva hidden={false} titleBar={{ title: 'Debug', drag: false }} />
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {!loading && (
            <Rect
              x={0}
              y={0}
              width={window.innerWidth}
              height={window.innerHeight}
              // eslint-disable-next-line react-hooks/refs
              fillPatternImage={ref.current}
              fillPatternRepeat='repeat'
              fillPatternScale={{ x: 1, y: 1 }}
              onPointerClick={() => {
                setSelect([]);
              }}
            />
          )}
        </Layer>
        <Layer>
          <Text text='Try to drag shapes' fontSize={15} />
          <GroupBase />
        </Layer>
      </Stage>
    </AntdApp>
  );
}
