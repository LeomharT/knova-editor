import { App as AntdApp } from 'antd';
import { Layer, Rect, Stage, Text } from 'react-konva';
import GroupBase from '../component/GroupBase';
import { useBearStore } from '../hooks/useBearStore';

export default function App() {
  const setSelect = useBearStore((state) => state.setSelected);

  return (
    <AntdApp>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={window.innerWidth}
            height={window.innerHeight}
            fill={'transparent'}
            onPointerClick={() => {
              setSelect([]);
            }}
          />
        </Layer>
        <Layer>
          <Text text='Try to drag shapes' fontSize={15} />
          <GroupBase />
        </Layer>
      </Stage>
    </AntdApp>
  );
}
