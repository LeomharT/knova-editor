import { useQuery } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Leva, useControls } from 'leva';
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

  const { action, world, setScale, setWorld, setAction } = useBearStore();

  const prevCoord = useRef({ x: 0, y: 0 });

  const newRect = useRef<Konva.Rect | null>(null);

  const enableAction = useRef(false);

  const { fillRectColor } = useControls('Stage', {
    fillRectColor: '#ffffff',
  });

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

  function resetZoom() {
    sceneRef.current?.scale({ x: 1, y: 1 });
    sceneRef.current?.position({ x: 0, y: 0 });
    setScale(1.0);
  }

  function onPointerDown(e: KonvaEventObject<PointerEvent>) {
    e.target.setPointerCapture(e.evt.pointerId);

    const pointerPosition = e.target.getStage()!.getPointerPosition()!;

    prevCoord.current = pointerPosition;
    enableAction.current = true;

    if (action.active === 'rect') {
      newRect.current = new Konva.Rect({
        width: 0,
        height: 0,
        x: pointerPosition.x,
        y: pointerPosition.y,
        fill: fillRectColor,
      });
      sceneRef.current?.add(newRect.current);
    }
  }

  function onPointerUp() {
    if (action.active === 'rect') {
      if (newRect.current) {
        newRect.current?.remove();

        world.pop();

        setWorld([
          ...world,
          {
            key: (Date.now() * Math.random()).toString(),
            x: newRect.current.x(),
            y: newRect.current.y(),
            width: newRect.current.width(),
            height: newRect.current.height(),
            fill: fillRectColor,
          },
        ]);

        newRect.current = null;
      }
    }

    enableAction.current = false;
    setAction({ ...action, active: 'cursor' });
  }

  function onPointerMove(e: KonvaEventObject<PointerEvent>) {
    if (!enableAction.current) return;

    if (action.active === 'rect') {
      createRect(e);
    }
  }

  function createRect(e: KonvaEventObject<PointerEvent>) {
    const stage = e.target.getStage();
    if (!stage) return;

    const coord = stage.getPointerPosition()!;

    const size = {
      width: prevCoord.current.x - coord.x,
      height: prevCoord.current.y - coord.y,
    };

    if (e.evt.shiftKey) {
      size.height = size.width;
    }

    if (newRect.current) {
      newRect.current.width(Math.abs(size.width));
      newRect.current.height(Math.abs(size.height));

      if (size.width > 0) {
        newRect.current.x(prevCoord.current.x - size.width);
      }
      if (size.height > 0) {
        newRect.current.y(prevCoord.current.y - size.height);
      }
    }
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
      <ZoomControl onReset={resetZoom} />
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleOnWheel}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
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
          {world.map((value) => (
            <GroupBase {...value} key={value.key} />
          ))}
        </Layer>
        <Layer></Layer>
      </Stage>
    </AntdApp>
  );
}
