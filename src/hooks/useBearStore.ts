import { create } from 'zustand';
import type { World } from '../types/world';

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
  setWorld: (value: World[]) => void;
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
    world: [],
    setWorld: (world) => set((state) => ({ ...state, world })),
  };
});
