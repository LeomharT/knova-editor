import { create } from 'zustand';

export type BearStore = {
  /** Selected ids */
  selected: string[];
  setSelected: (value: string[]) => void;
  scale: number;
  setScale: (value: number) => void;
};

export const useBearStore = create<BearStore>((set) => {
  return {
    selected: [],
    setSelected: (selected) => set((state) => ({ ...state, selected })),
    scale: 1,
    setScale: (scale) => set((state) => ({ ...state, scale })),
  };
});
