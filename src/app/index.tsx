import { App as AntdApp } from 'antd';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Leva } from 'leva';
import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import GroupBase from '../component/GroupBase';
import Toolbar from '../component/Toolbar/idnex';
import ZoomControl from '../component/ZoomControl';
import { useBearStore } from '../hooks/useBearStore';

const scaleBy = 1.1;

export default function App() {
  const stageRef = useRef<Konva.Stage>(null);

  const sceneRef = useRef<Konva.Layer>(null);

  const bgRef = useRef<HTMLImageElement>(document.createElement('img'));

  const setSelect = useBearStore((state) => state.setSelected);

  const [loading, setLoading] = useState(true);

  const { setScale } = useBearStore();

  function onWheel(e: KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    if (!sceneRef.current || !stageRef.current) return;
    if (!e.evt.ctrlKey) return;

    const oldScale = sceneRef.current.scaleX();
    const pointer = stageRef.current.getPointerPosition()!;

    const mousePointTo = {
      x: (pointer.x - sceneRef.current.x()) / oldScale,
      y: (pointer.y - sceneRef.current.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    sceneRef.current.scale({ x: newScale, y: newScale });
    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    sceneRef.current.position(newPos);
  }

  useEffect(() => {
    bgRef.current.src = '/download.svg';
    bgRef.current.onload = () => setLoading(false);
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  }, []);

  return (
    <AntdApp>
      <Leva hidden={false} titleBar={{ title: 'Debug', drag: true }} />
      <Toolbar />
      <ZoomControl />
      <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight} onWheel={onWheel}>
        <Layer>
          {!loading && (
            <Rect
              x={0}
              y={0}
              width={window.innerWidth}
              height={window.innerHeight}
              // eslint-disable-next-line react-hooks/refs
              fillPatternImage={bgRef.current}
              fillPatternRepeat='repeat'
              fillPatternScale={{ x: 1, y: 1 }}
              onPointerClick={() => {
                setSelect([]);
              }}
            />
          )}
        </Layer>
        <Layer ref={sceneRef}>
          <GroupBase />
        </Layer>
      </Stage>
    </AntdApp>
  );
}
