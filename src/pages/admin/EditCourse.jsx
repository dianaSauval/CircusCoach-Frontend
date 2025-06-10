import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, updateCourse } from "../../services/courseService";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

function EditCourse() {
  const { id } = useParams(); // Obtenemos el ID del curso desde la URL
console.log("ID del curso:", id);

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [language, setLanguage] = useState("es");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(id);
        console.log("Datos del curso:", data); // 👈 Verifica si los datos llegan correctamente
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setPdfUrl(data.pdfUrl || "");
        setVideoUrl(data.videoUrl || "");
        setLanguage(data.language);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener el curso:", err);
        setError("No se pudo cargar el curso.");
        setLoading(false);
      }
    };
  
    fetchCourse();
  }, [id]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !price || !language) {
      setError("Todos los campos obligatorios deben completarse.");
      return;
    }

    try {
      await updateCourse(id, { title, description, price, pdfUrl, videoUrl, language });
      navigate("/admin"); // Redirige al panel de administración después de editar el curso
    } catch (err) {
      console.error("Error al actualizar el curso:", err);
      setError("Hubo un error al actualizar el curso.");
    }
  };

  if (loading) return <LoadingSpinner />    ;

  return (
    <div>
      <h1>Editar Curso</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título del curso"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br />
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <br />
        <input
          type="text"
          placeholder="URL del PDF (temporalmente)"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="URL del Video (temporalmente)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <br />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="fr">Francés</option>
        </select>
        <br />
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
}

export default EditCourse;
