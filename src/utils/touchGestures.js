import { useEffect } from 'react';

/**
 * Custom hook para prevenir gestos táctiles que puedan interferir con el modo fullscreen
 * Previene pull-to-refresh, zoom con dos dedos, y overscroll behaviors
 * 
 * @param {React.RefObject} elementRef - Referencia al elemento contenedor
 * @param {boolean} isActive - Si el hook debe estar activo (por defecto true)
 */
export const usePreventTouchGestures = (elementRef, isActive = true) => {
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;

    const preventTouchBehaviors = (e) => {
      // Prevenir pull-to-refresh y otros gestos del navegador
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevenir zoom con dos dedos
      }
    };

    const preventOverscroll = (e) => {
      const target = e.target;
      const scrollContainer = target.closest('.overflow-y-auto');
      
      // Si no hay contenedor de scroll o es el contenedor principal
      if (!scrollContainer) {
        e.preventDefault();
        return;
      }
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      
      // Prevenir overscroll en los extremos
      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    const handleTouchStart = (e) => {
      // Guardar posición inicial del touch
      element._touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!element._touchStartY) return;
      
      const touchY = e.touches[0].clientY;
      const deltaY = touchY - element._touchStartY;
      const scrollContainer = e.target.closest('.overflow-y-auto');
      
      // Si no hay contenedor de scroll definido, prevenir el movimiento
      if (!scrollContainer) {
        e.preventDefault();
        return;
      }
      
      const { scrollTop } = scrollContainer;
      
      // Prevenir pull-to-refresh cuando se está en la parte superior
      if (scrollTop === 0 && deltaY > 0) {
        e.preventDefault();
      }
    };

    // Agregar event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchmove', preventTouchBehaviors, { passive: false });
    element.addEventListener('wheel', preventOverscroll, { passive: false });
    
    // Aplicar estilos CSS para prevenir comportamientos táctiles
    const originalTouchAction = element.style.touchAction;
    const originalOverscrollBehavior = element.style.overscrollBehavior;
    
    element.style.touchAction = 'pan-y';
    element.style.overscrollBehavior = 'contain';
    
    // Cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchmove', preventTouchBehaviors);
      element.removeEventListener('wheel', preventOverscroll);
      
      // Restaurar estilos originales
      element.style.touchAction = originalTouchAction;
      element.style.overscrollBehavior = originalOverscrollBehavior;
      
      // Limpiar propiedades temporales
      delete element._touchStartY;
    };
  }, [elementRef, isActive]);
};

/**
 * Utilidad para aplicar estilos CSS de prevención de gestos táctiles
 * Usar como objeto de estilos inline
 */
export const touchPreventionStyles = {
  touchAction: 'pan-y',
  overscrollBehavior: 'contain',
  WebkitOverflowScrolling: 'touch'
};