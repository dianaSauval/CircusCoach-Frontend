import { useState } from "react";
import { uploadFile } from "../../services/uploadFile";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../services/courseService";

function CreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [language, setLanguage] = useState("es");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !price || !language) {
      setError("Todos los campos obligatorios deben completarse.");
      return;
    }

    try {
      let pdfUrl = "";
      let videoUrl = "";

      if (pdfFile) {
        pdfUrl = await uploadFile(pdfFile, "pdfs"); // 📂 Ahora se sube a "circuscoach/pdfs"
      }
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "videos"); // 📂 Ahora se sube a "circuscoach/videos"
      }

      await createCourse({ title, description, price, pdfUrl, videoUrl, language });
      navigate("/admin"); // Redirige al panel de administración
    } catch (err) {
      console.error("Error al crear curso:", err);
      setError("Hubo un error al crear el curso.");
    }
  };

  return (
    <div>
      <h1>Crear Nuevo Curso</h1>
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
        <label>Subir PDF:</label>
        <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
        <br />
        <label>Subir Video:</label>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        <br />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="fr">Francés</option>
        </select>
        <br />
        <button type="submit">Crear Curso</button>
      </form>
    </div>
  );
}

export default CreateCourse;

