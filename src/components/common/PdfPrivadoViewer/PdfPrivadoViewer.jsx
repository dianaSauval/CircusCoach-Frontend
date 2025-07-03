import { useEffect, useState } from "react";
import { obtenerUrlPdfPrivado } from "../../../services/uploadCloudinary";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner"; // si querés usarlo
import "./PdfPrivadoViewer.css";

const PdfPrivadoViewer = ({ classId, index, language }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl;

    const cargarUrl = async () => {
      try {
        const url = await obtenerUrlPdfPrivado(classId, index, language);
        setPdfUrl(url);
        objectUrl = url;
      } catch (err) {
        console.error("❌ Error al obtener PDF privado:", err);
        setError("No se pudo cargar el PDF");
      }
    };

    cargarUrl();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [classId, index, language]);

  if (error) return <p className="pdf-error">{error}</p>;
  if (!pdfUrl) return <LoadingSpinner texto="Cargando PDF..." />;

  return (
    <div className="pdf-embed-wrapper">
      <embed src={pdfUrl} type="application/pdf" />
    </div>
  );
};

export default PdfPrivadoViewer;
