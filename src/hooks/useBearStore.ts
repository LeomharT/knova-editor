import { create } from 'zustand';

export type BearStore = {
  /** Selected ids */
  selected: string[];
  setSelected: (value: string[]) => void;
};

export const useBearStore = create<BearStore>((set) => {
  return {
    selected: [],
    setSelected: (selected: string[]) => set((state) => ({ ...state, selected })),
  };
});
