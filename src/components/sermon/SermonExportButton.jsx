import { generateHtmlContent } from "../../utils/generateHtmlContentToExport";

const SermonExportButton = ({ sermon }) => {
  const handleExport = () => {
    if (!sermon || !sermon.title) {
      alert(
        "El sermón no tiene título. Por favor, añade un título antes de exportar."
      );
      return;
    }

    const htmlContent = generateHtmlContent(sermon);
    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${sermon.title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="custom-btn bg-green-600 hover:bg-green-700"
    >
      Descargar
    </button>
  );
};

export default SermonExportButton;
