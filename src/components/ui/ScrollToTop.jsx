import { useScrollViewStore } from "../../store/scroll-view-store";
import { IoChevronUpCircleSharp } from "react-icons/io5";

export const ScrollToTopButton = () => {
  const scrollToTop = useScrollViewStore((state) => state.scrollToTop);
  const scrollY = useScrollViewStore((state) => state.scrollY);
  const vh = useScrollViewStore((state) => state.vh);

  // Calcular directamente en el componente para asegurar reactividad
  const isScrolledPastViewport = scrollY > vh;

  // Solo mostrar el botón si se ha scrolleado más de la altura del contenedor
  if (!isScrolledPastViewport) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="sticky bottom-5 left-full text-4xl text-blue-600 opacity-40 hover:opacity-100 hover:text-blue-800 z-30 transition-all duration-300 hover:scale-110"
      aria-label="Scroll to top"
    >
      <div>
        <IoChevronUpCircleSharp size={45}/>
      </div>
    </button>
  );
};
