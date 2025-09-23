import { create } from "zustand";

export const useViewModeStore = create((set) => ({
  mode: "edicion", // "edicion", "estudio", "predicacion"
  // Optional scroll target to navigate to when switching back to editor
  scrollTarget: null,
  setMode: (newMode) => set(() => ({ mode: newMode })),
  setScrollTarget: (target) => set(() => ({ scrollTarget: target })),
  clearScrollTarget: () => set(() => ({ scrollTarget: null })),
}));
