import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/pages/MyFormationDetail.css";
import {
  getFormationVisibleContent,
  getClassById,
} from "../services/formationService";
import {
  marcarClaseFormacion,
  desmarcarClaseFormacion,
  getUserProfile,
} from "../services/userService";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import EmptyState from "../components/EmptyState/EmptyState";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function MyFormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations.myFormationDetail[language];

  const [formacion, setFormacion] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState(0);
  const [claseSeleccionada, setClaseSeleccionada] = useState(0);
  const [clasesCompletadas, setClasesCompletadas] = useState([]);
  const [claseCompleta, setClaseCompleta] = useState(null);
  const [userId, setUserId] = useState(null);
  const [formacionNoDisponible, setFormacionNoDisponible] = useState(false);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const visible = location.state?.visible;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        setFormacionNoDisponible(false);
        const user = await getUserProfile();
        setUserId(user._id);

        const progreso = user.progresoFormaciones?.find(
          (p) => p.formationId === id
        );
        if (progreso) {
          setClasesCompletadas(progreso.clasesCompletadas);
        }

        const data = await getFormationVisibleContent(id, language);
        setFormacion(data.formation);
        setModules(data.modules);
      } catch (err) {
        if (err.response?.status === 403) {
          setFormacionNoDisponible(true);
        } else {
          console.error("Error al obtener datos visibles o perfil:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, language]);

  useEffect(() => {
    const fetchClaseCompleta = async () => {
      const claseId =
        modules?.[moduloSeleccionado]?.classes?.[claseSeleccionada]?._id;
      if (claseId) {
        try {
          const data = await getClassById(claseId, language);
          setClaseCompleta(data);
        } catch (error) {
          console.error("Error al cargar clase:", error);
          setClaseCompleta(null);
        }
      }
    };

    fetchClaseCompleta();
  }, [moduloSeleccionado, claseSeleccionada, modules, language]);

  const handleMarcarClase = async () => {
    try {
      await marcarClaseFormacion(userId, id, claseCompleta._id);
      setClasesCompletadas((prev) => [...prev, claseCompleta._id]);
    } catch (err) {
      console.error("Error al marcar como hecha:", err);
    }
  };

  const handleDesmarcarClase = async () => {
    try {
      await desmarcarClaseFormacion(userId, id, claseCompleta._id);
      setClasesCompletadas((prev) =>
        prev.filter((cid) => cid !== claseCompleta._id)
      );
    } catch (err) {
      console.error("Error al desmarcar clase:", err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner texto={t.loading} />;
  }

  if (visible === false || formacionNoDisponible) {
    return (
      <EmptyState
        title={t.notAvailableTitle}
        subtitle={t.notAvailableSubtitle}
      />
    );
  }

  if (!formacion || modules.length === 0)
    return <LoadingSpinner texto={t.loading} />;

  const totalClases = modules.reduce((acc, mod) => acc + mod.classes.length, 0);
  const clasesHechas = clasesCompletadas.length;
  const porcentaje = Math.round((clasesHechas / totalClases) * 100);

  const totalModulos = modules.length;
  const modulosCompletados = modules.filter((mod) =>
    mod.classes.every((c) => clasesCompletadas.includes(c._id))
  ).length;
  const progresoModulos = Math.round((modulosCompletados / totalModulos) * 100);

  const getLocalizedText = (field) => {
    if (typeof field === "string") return field;
    return field?.[language] || field?.es || "";
  };

  return (
    <div className="my-course-detail">
      <button className="volver-button" onClick={() => navigate("/mis-cursos")}>
        {t.back}
      </button>
      <h1 className="formation-title">{getLocalizedText(formacion.title)}</h1>
      <p className="formation-description">
        {getLocalizedText(formacion.description)}
      </p>

      <h2 className="progress-title">{t.yourProgress}</h2>
      <div className="progress-section">
        <div className="progress-item">
          <div
            className="progress-icon progress-contenido"
            style={{
              background: `conic-gradient(var(--color-petroleo) ${porcentaje}%, #e0e0e0 ${porcentaje}%)`,
            }}
          >
            📘
          </div>
          <p>
            {porcentaje}%<br />
            {t.content}
          </p>
        </div>

        <div className="progress-item">
          <div
            className="progress-icon progress-modulos"
            style={{
              background: `conic-gradient(var(--color-menta) ${progresoModulos}%, #e0e0e0 ${progresoModulos}%)`,
            }}
          >
            📚
          </div>
          <p>
            {modulosCompletados}/{totalModulos}
            <br />
            {t.modules}
          </p>
        </div>
      </div>

      <div className="module-selector">
        {modules.map((mod, i) => (
          <button
            key={mod._id}
            className={`module-pill ${
              i === moduloSeleccionado ? "active" : ""
            }`}
            onClick={() => {
              setModuloSeleccionado(i);
              setClaseSeleccionada(0);
            }}
          >
            M{i + 1}
          </button>
        ))}
      </div>

      <div className="class-selector">
        {modules[moduloSeleccionado].classes?.map((cl, j) => (
          <button
            key={cl._id}
            className={`class-pill ${j === claseSeleccionada ? "active" : ""}`}
            onClick={() => setClaseSeleccionada(j)}
          >
            {t.class} {j + 1}
          </button>
        ))}
      </div>

      <div className="class-content">
        {claseCompleta ? (
          <>
            <h2>{getLocalizedText(claseCompleta.title)}</h2>
            {claseCompleta.subtitle && (
              <h3>{getLocalizedText(claseCompleta.subtitle)}</h3>
            )}
            {claseCompleta.content && (
              <p>{getLocalizedText(claseCompleta.content)}</p>
            )}
            {claseCompleta.secondaryContent && (
              <p className="secondary-content">
                {getLocalizedText(claseCompleta.secondaryContent)}
              </p>
            )}

            {claseCompleta.pdfs?.length > 0 && (
              <div className="pdf-list">
                <h4>{t.pdfsTitle}</h4>
                <ul>
                  {claseCompleta.pdfs.map((pdf, index) => (
                    <li key={index}>
                      <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getLocalizedText(pdf.title) || `PDF ${index + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {claseCompleta.videos?.length > 0 && (
              <div className="video-list">
                <h4>{t.videosTitle}</h4>
                <ul>
                  {claseCompleta.videos.map((video, index) => (
                    <li key={index}>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getLocalizedText(video.title) || `Video ${index + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {clasesCompletadas.includes(claseCompleta._id) ? (
              <button
                className="mark-done-button unmark"
                onClick={handleDesmarcarClase}
              >
                {t.unmark}
              </button>
            ) : (
              <button className="mark-done-button" onClick={handleMarcarClase}>
                {t.markAsDone}
              </button>
            )}
          </>
        ) : (
          <p>{t.noContent}</p>
        )}
      </div>
    </div>
  );
}

export default MyFormationDetail;
