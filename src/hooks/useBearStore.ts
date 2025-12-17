import { create } from 'zustand';
import { Shapes, type World } from '../types/world';

type SetStoreState<S> = (value: S | ((prevState: S) => S)) => void;

export type BearStore = {
  /** Selected ids */
  selected: string[];
  setSelected: (value: string[]) => void;
  scale: number;
  setScale: (value: number) => void;
  action: {
    locked: boolean;
    active: string;
  };
  setAction: (value: { locked: boolean; active: string }) => void;
  world: World[];
  setWorld: SetStoreState<World[]>;
};

export const useBearStore = create<BearStore>((set) => {
  return {
    selected: [],
    setSelected: (selected) => set((state) => ({ ...state, selected })),
    scale: 1,
    setScale: (scale) => set((state) => ({ ...state, scale })),
    action: {
      locked: false,
      active: 'cursor',
    },
    setAction: (action) => set((state) => ({ ...state, action })),
    world: [
      {
        key: '1',
        x: window.innerWidth / 2.0,
        y: window.innerHeight / 2.0,
        width: 200,
        height: 200,
        shape: Shapes.RECT,
      },
    ],
    setWorld: (world: World[] | ((prev: World[]) => World[])) => {
      if (typeof world === 'function') {
        set((state) => ({ ...state, world: world(state.world) }));
      }
      if (typeof world === 'object') {
        set((state) => ({ ...state, world: world as World[] }));
      }
    },
  };
});
