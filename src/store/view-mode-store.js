import { create } from "zustand";

export const useViewModeStore = create((set) => ({
  mode: "edicion", // "edicion", "estudio", "predicacion"
  setMode: (newMode) => set(() => ({ mode: newMode })),
}));
