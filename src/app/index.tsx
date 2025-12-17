import { useQuery } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { folder, Leva, useControls } from 'leva';
import { useEffect, useRef } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { getBackgroundImage } from '../api/stage';
import Connector from '../component/Connector';
import GroupBase from '../component/GroupBase';
import Toolbar from '../component/Toolbar';
import ZoomControl from '../component/ZoomControl';
import { QUERIES } from '../constants/queries';
import { useBearStore } from '../hooks/useBearStore';
import { Shapes, type ShapeArrow, type ShapeRect } from '../types/world';

export default function App() {
  const stageRef = useRef<Konva.Stage>(null);

  const sceneRef = useRef<Konva.Layer>(null);

  const rectRef = useRef<Konva.Rect>(null);

  const setSelect = useBearStore((state) => state.setSelected);

  const { action, world, scale, setScale, setWorld, setAction } = useBearStore();

  const prevCoord = useRef({ x: 0, y: 0 });

  const newRect = useRef<Konva.Rect>(null);

  const newArrow = useRef<Konva.Arrow>(null);

  const enableAction = useRef(false);

  const { fillRectColor, lineFill, lineStroke, lineType, lineArrow } = useControls('Stage', {
    Rect: folder({
      fillRectColor: '#ffffff',
    }),
    Arrow: folder(
      {
        lineFill: '#000000',
        lineStroke: '#000000',
        lineType: {
          options: {
            Solid: 'Solid',
            Dashed: 'Dashed',
          },
        },
        lineArrow: {
          options: {
            Enabled: 'Enabled',
            Disabled: 'Disabled',
          },
        },
      },
      { collapsed: true }
    ),
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
    if (action.active === 'rect') e.target.setPointerCapture(e.evt.pointerId);

    const stage = e.target.getStage()!;

    const pointerPosition = stage.getPointerPosition()!;

    prevCoord.current = pointerPosition;
    prevCoord.current.x -= sceneRef.current?.x() ?? 0;
    prevCoord.current.y -= sceneRef.current?.y() ?? 0;
    prevCoord.current.x /= scale;
    prevCoord.current.y /= scale;

    enableAction.current = true;

    if (action.active === 'rect') {
      newRect.current = new Konva.Rect({
        width: 0,
        height: 0,
        x: prevCoord.current.x,
        y: prevCoord.current.y,
        fill: fillRectColor,
      });
      sceneRef.current?.add(newRect.current);
    }

    if (action.active === 'arrow') {
      const fromNode = sceneRef?.current?.getIntersection(prevCoord.current);

      newArrow.current = new Konva.Arrow({
        points: [
          prevCoord.current.x,
          prevCoord.current.y,
          prevCoord.current.x,
          prevCoord.current.y,
        ],
        stroke: lineStroke,
        fill: lineFill,
        dashEnabled: lineType === 'Dashed',
        dash: [5, 5],
        dashOffset: 0,
        draggable: true,
        pointerLength: 10,
        pointerWidth: 10,
        pointerAtEnding: lineArrow === 'Enabled',
        pointerAtBeginning: false,
        listening: false,
      });
      newArrow.current.setAttr('fromNode', fromNode?.parent);

      sceneRef.current?.add(newArrow.current);
    }
  }

  function onPointerUp(e: KonvaEventObject<PointerEvent>) {
    const stage = e.target.getStage()!;

    if (action.active === 'rect' && newRect.current) {
      newRect.current.remove();

      setWorld([
        ...world,
        {
          key: (Date.now() * Math.random()).toString(),
          shape: Shapes.RECT,
          x: newRect.current.x(),
          y: newRect.current.y(),
          width: newRect.current.width(),
          height: newRect.current.height(),
          fill: fillRectColor,
        } as ShapeRect,
      ]);

      newRect.current = null;
    }

    if (action.active === 'arrow') {
      newArrow.current?.remove();

      const points = newArrow.current?.points();
      const fromNode = newArrow.current?.getAttr('fromNode');
      const toNode = sceneRef.current?.getIntersection(stage.getPointerPosition()!);

      setWorld((prev) => [
        ...prev,
        {
          key: (Date.now() * Math.random()).toString(),
          shape: Shapes.ARROW,
          points,
          node: newArrow.current,
          fromNode,
          toNode: toNode?.parent,
          fill: newArrow.current?.fill(),
          stroke: newArrow.current?.stroke(),
          dashEnabled: newArrow.current?.dashEnabled(),
          dash: newArrow.current?.dash(),
          dashOffset: newArrow.current?.dashOffset(),
          draggable: newArrow.current?.draggable(),
          pointerLength: newArrow.current?.pointerLength(),
          pointerWidth: newArrow.current?.pointerWidth(),
          pointerAtEnding: newArrow.current?.pointerAtEnding(),
          pointerAtBeginning: newArrow.current?.pointerAtBeginning(),
          listening: newArrow.current?.listening(),
        } as ShapeArrow,
      ]);

      newArrow.current = null;
    }

    enableAction.current = false;

    if (!action.locked) {
      setAction({ ...action, active: 'cursor' });
    }
  }

  function onPointerMove(e: KonvaEventObject<PointerEvent>) {
    if (!enableAction.current) return;

    if (action.active === 'rect') {
      createRect(e);
    }
    if (action.active === 'arrow') {
      createArrow(e);
    }
  }

  function createRect(e: KonvaEventObject<PointerEvent>) {
    const stage = e.target.getStage();
    if (!stage) return;

    const coord = stage.getPointerPosition()!;
    coord.x -= sceneRef.current?.x() ?? 0;
    coord.y -= sceneRef.current?.y() ?? 0;
    coord.x /= scale;
    coord.y /= scale;

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

  function createArrow(e: KonvaEventObject<PointerEvent>) {
    const stage = e.target.getStage()!;

    const coord = stage.getPointerPosition()!;
    coord.x -= sceneRef.current?.x() ?? 0;
    coord.y -= sceneRef.current?.y() ?? 0;
    coord.x /= scale;
    coord.y /= scale;

    if (newArrow.current) {
      const points = newArrow.current.points();

      points[points.length - 2] = coord.x;
      points[points.length - 1] = coord.y;

      newArrow.current.points(points);
    }
  }

  function handleOnKeyDown(e: KeyboardEvent) {
    if (e.key === 'Delete') {
      setWorld((prev) => {
        prev.pop();
        return prev;
      });
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

  useEffect(() => {
    window.addEventListener('keydown', handleOnKeyDown);
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
          {world.map((value) => {
            if (value.shape === Shapes.RECT) return <GroupBase {...value} key={value.key} />;
            if (value.shape === Shapes.ARROW) return <Connector {...value} key={value.key} />;
          })}
        </Layer>
        <Layer></Layer>
      </Stage>
    </AntdApp>
  );
}
