import { create } from 'zustand';

export const useScrollViewStore = create((set, get) => ({
  // Estados básicos - solo esto necesitamos para reactividad
  vh: typeof window !== 'undefined' ? window.innerHeight : 0,
  scrollY: 0,
  
  // Elemento de scroll actual
  scrollElement: null,
  
  // Inicializar solo el tracking del viewport height
  init: () => {
    if (typeof window === 'undefined') return;
    
    // Actualizar vh inicial
    set({ vh: window.innerHeight });
    
    // Solo event listener para resize (viewport height)
    const handleResize = () => {
      set({ vh: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },
  
  // Configurar elemento específico para scroll
  setScrollElement: (element) => {
    const currentElement = get().scrollElement;
    
    // Remover listener del elemento anterior si existe
    if (currentElement && currentElement.removeEventListener) {
      const oldHandler = currentElement._scrollHandler;
      if (oldHandler) {
        currentElement.removeEventListener('scroll', oldHandler);
      }
    }
    
    set({ scrollElement: element });
    
    if (element) {
      // Crear handler inline y guardarlo en el elemento para cleanup
      const handleScroll = (event) => {
        const scrollY = event.target.scrollTop || 0;
        const elementHeight = event.target.clientHeight || 0;
        set({ scrollY, vh: elementHeight });
      };
      
      // Guardar referencia para cleanup
      element._scrollHandler = handleScroll;
      element.addEventListener('scroll', handleScroll, { passive: true });
    }
  },
  
  // Método para scroll to top
  scrollToTop: () => {
    const { scrollElement } = get();
    
    if (scrollElement && scrollElement.scrollTo) {
      scrollElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
}));