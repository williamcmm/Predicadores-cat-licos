import { initSermon } from "@/utils/initialize-sermon";
import { create } from "zustand";

export const useSermonStore = create((set) => ({
  sermon: null,
  initSermon: (currentUser) => set(() => ({ sermon: initSermon(currentUser) })),
  setSermon: (newSermon) => set(() => ({ sermon: newSermon })),
  clearSermon: () => set(() => ({ sermon: null })),
  openSermon: (sermonToOpen, currentUser) =>
    set(() => ({
      sermon:
        sermonToOpen.esPublico || sermonToOpen.autorOriginal
          ? {
              ...sermonToOpen,
              // Remover identificadores del sermón original para crear una copia nueva
              id: undefined,
              userId: currentUser?.uid,
              createdAt: new Date(),
              // Mantener referencia al original para fines informativos
              basadoEnSermonPublico: sermonToOpen.id,
              autorOriginalNombre:
                sermonToOpen.nombreAutor || sermonToOpen.autor,
              // Marcar como copia en el título si no está ya marcado
              title: sermonToOpen.title.includes("[Copia]")
                ? sermonToOpen.title
                : `[Copia] ${sermonToOpen.title}`,
            }
          : sermonToOpen,
    })),
}));
