import { useQuery } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Leva } from 'leva';
import { useEffect, useRef } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { getBackgroundImage } from '../api/stage';
import GroupBase from '../component/GroupBase';
import Toolbar from '../component/Toolbar/idnex';
import ZoomControl from '../component/ZoomControl';
import { QUERIES } from '../constants/queries';
import { useBearStore } from '../hooks/useBearStore';

export default function App() {
  const stageRef = useRef<Konva.Stage>(null);

  const sceneRef = useRef<Konva.Layer>(null);

  const rectRef = useRef<Konva.Rect>(null);

  const setSelect = useBearStore((state) => state.setSelected);

  const { setScale } = useBearStore();

  const query = useQuery({
    queryKey: [QUERIES.BACKGROUND_IMAGE],
    queryFn: getBackgroundImage,
  });

  function handleOnWheel(e: KonvaEventObject<WheelEvent>) {
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

    let newScale = direction > 0 ? oldScale + 0.1 : oldScale - 0.1;
    newScale = Number(newScale.toFixed(1));

    if (newScale < 0.5 || newScale > 2.0) return;

    sceneRef.current.scale({ x: newScale, y: newScale });
    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    sceneRef.current.position(newPos);
  }

  useEffect(() => {
    window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', () => {
      stageRef.current?.width(window.innerWidth);
      stageRef.current?.height(window.innerHeight);

      rectRef.current?.width(window.innerWidth);
      rectRef.current?.height(window.innerHeight);
      rectRef.current?.fillPatternScale({ x: 1, y: 1 });
      rectRef.current?.getLayer()?.batchDraw();
    });
  }, []);

  return (
    <AntdApp>
      <Leva hidden={false} titleBar={{ title: 'Debug', drag: true }} />
      <Toolbar />
      <ZoomControl />
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleOnWheel}
      >
        <Layer>
          {!query.isFetching && (
            <Rect
              ref={rectRef}
              x={0}
              y={0}
              width={window.innerWidth}
              height={window.innerHeight}
              fillPatternImage={query.data}
              fillPatternRepeat='repeat'
              fillPatternScale={{ x: 1, y: 1 }}
              onPointerClick={() => setSelect([])}
            />
          )}
        </Layer>
        <Layer ref={sceneRef}>
          <GroupBase />
        </Layer>
        <Layer></Layer>
      </Stage>
    </AntdApp>
  );
}
