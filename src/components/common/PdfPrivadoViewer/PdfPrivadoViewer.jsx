import { useEffect, useState } from "react";
import { obtenerUrlPdfPrivado } from "../../../services/uploadCloudinary";

const PdfPrivadoViewer = ({ classId, index, language }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

 useEffect(() => {
  let objectUrl;
  console.log("🌀 Cargando PDF:", { classId, index, language });

  const cargarUrl = async () => {
    try {
      const url = await obtenerUrlPdfPrivado(classId, index, language);
      console.log("✅ URL obtenida para PDF:", url);
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
      console.log("🧹 Limpiando object URL del PDF:", objectUrl);
    }
  };
}, [classId, index, language]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!pdfUrl) return <p>Cargando PDF...</p>;

  return (
    <embed
      src={pdfUrl}
      type="application/pdf"
      width="100%"
      height="500px"
    />
  );
};

export default PdfPrivadoViewer;
