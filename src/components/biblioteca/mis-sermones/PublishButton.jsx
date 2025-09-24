import {
  publicarSermon,
  despublicarSermon,
  encontrarSermonPublicoPorOriginal,
} from "@/services/database/firestoreService";
import { TbWorldCheck, TbWorldX } from "react-icons/tb";

export const PublishButton = ({ sermon, sermonesPublicados, setSermonesPublicados, closeMenu }) => {
  const handlePublicarSermon = async (sermon) => {
    if (
      window.confirm(
        `¿Deseas publicar el sermón "${sermon.title}" para que todos los usuarios puedan verlo?`
      )
    ) {
      try {
        await publicarSermon(sermon);

        // Solo actualizar el estado de sermones publicados, NO recargar la lista
        setSermonesPublicados((prev) => new Set(prev).add(sermon.id));

        // Disparar evento personalizado para actualizar SermonDelDia
        const event = new CustomEvent("sermonPublicado", {
          detail: {
            sermonId: sermon.id,
            action: "published",
            timestamp: Date.now(),
          },
        });

        window.dispatchEvent(event);

        // Agregar un pequeño delay y luego disparar otro evento como backup
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("sermonPublicado", {
              detail: {
                sermonId: sermon.id,
                action: "published",
                timestamp: Date.now(),
                isBackup: true,
              },
            })
          );
        }, 2000);

        alert(
          "¡Sermón publicado exitosamente! Ahora aparecerá en 'Sermones Públicos' para todos los usuarios."
        );
      } catch (error) {
        console.error("❌ Error publishing sermon:", error);
        alert("Hubo un error al publicar el sermón.");
      }
    }
  };

  const handleDespublicarSermon = async (sermonId) => {
    if (
      window.confirm(
        "¿Deseas despublicar este sermón? Ya no será visible para otros usuarios."
      )
    ) {
      try {
        // Encontrar el ID del sermón público usando el ID original
        const sermonPublicoId = await encontrarSermonPublicoPorOriginal(
          sermonId
        );
        if (sermonPublicoId) {
          await despublicarSermon(sermonPublicoId);
          // Solo actualizar el estado de sermones publicados, NO recargar la lista
          setSermonesPublicados((prev) => {
            const newSet = new Set(prev);
            newSet.delete(sermonId);
            return newSet;
          });

          // Disparar evento personalizado para actualizar SermonDelDia
          window.dispatchEvent(
            new CustomEvent("sermonPublicado", {
              detail: { sermonId: sermonId, action: "unpublished" },
            })
          );

          alert(
            "Sermón despublicado exitosamente. Ya no aparecerá en 'Sermones Públicos'."
          );
        } else {
          alert("No se pudo encontrar el sermón público para despublicar.");
        }
      } catch (error) {
        console.error("Error unpublishing sermon:", error);
        alert("Hubo un error al despublicar el sermón.");
      }
    }
  };

  return (
    <>
      <hr className="my-1 border-gray-200" />
      {sermonesPublicados.has(sermon.id) ? (
        <button
          onClick={() => {
            handleDespublicarSermon(sermon.id);
            closeMenu();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
        >
          <TbWorldX size={20} /> Despublicar
        </button>
      ) : (
        <button
          onClick={() => {
            handlePublicarSermon(sermon);
            closeMenu();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
        >
          <TbWorldCheck size={20} /> Hacer Público
        </button>
      )}
    </>
  );
};
