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
import PdfPrivadoViewer from "../components/common/PdfPrivadoViewer/PdfPrivadoViewer";
import VideoPrivadoViewer from "../components/common/VideoPrivadoViewer/VideoPrivadoViewer";
import { Helmet } from "react-helmet";

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

  const fechaExpiracion = location.state?.fechaExpiracion
    ? new Date(location.state.fechaExpiracion)
    : null;

  const ahora = new Date();
  const diasRestantes =
    fechaExpiracion && fechaExpiracion > ahora
      ? Math.ceil((fechaExpiracion - ahora) / (1000 * 60 * 60 * 24))
      : null;

  const getTiempoRestanteTexto = () => {
    if (diasRestantes === null) return null;
    if (diasRestantes > 30) return null;

    if (diasRestantes >= 28) return t.timeLeft_long_oneMonth;
    if (diasRestantes >= 21) return t.timeLeft_long_threeWeeks;
    if (diasRestantes >= 14) return t.timeLeft_long_twoWeeks;
    if (diasRestantes >= 7) return t.timeLeft_long_oneWeek;
    if (diasRestantes > 1)
      return t.timeLeft_long_days.replace("{{days}}", diasRestantes);
    if (diasRestantes === 1) return t.timeLeft_long_lastDay;
    return null;
  };

  const tiempoRestanteTexto = getTiempoRestanteTexto();

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
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="my-course-detail">
        <button
          className="volver-button"
          onClick={() => navigate("/mis-cursos")}
        >
          {t.back}
        </button>
        <h1 className="formation-title">{getLocalizedText(formacion.title)}</h1>
        {tiempoRestanteTexto && (
          <div className="aviso-tiempo-restante">{tiempoRestanteTexto}</div>
        )}

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
              className={`class-pill ${
                j === claseSeleccionada ? "active" : ""
              }`}
              onClick={() => setClaseSeleccionada(j)}
            >
              {t.class} {j + 1}
            </button>
          ))}
        </div>
        <div className="module-content">
          {modules[moduloSeleccionado] ? (
            <>
              <h2>{getLocalizedText(modules[moduloSeleccionado].title)}</h2>
              {modules[moduloSeleccionado].description && (
                <p>
                  {getLocalizedText(modules[moduloSeleccionado].description)}
                </p>
              )}
            </>
          ) : (
            <p>{t.noContent}</p>
          )}
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

              {claseCompleta.pdfs?.some((pdf) => pdf.url?.[language]) && (
                <div className="pdf-list">
                  <h4>{t.pdfsTitle}</h4>
                  {claseCompleta.pdfs
                    .map((pdf, index) => ({ pdf, index }))
                    .filter(({ pdf }) => pdf.url?.[language])
                    .map(({ pdf, index }) => (
                      <div className="resource-card" key={index}>
                        <h4>{pdf.title?.[language] || `PDF ${index + 1}`}</h4>
                        <p className="texto">
                          {pdf.description?.[language] || ""}
                        </p>
                        <PdfPrivadoViewer
                          classId={claseCompleta._id}
                          index={index}
                          language={language}
                        />
                      </div>
                    ))}
                </div>
              )}

              {claseCompleta.videos?.length > 0 && (
                <div className="video-list">
                  <h4>{t.videosTitle}</h4>
                  {claseCompleta.videos
                    .map((video, index) => ({ video, index }))
                    .filter(({ video }) => video.url?.[language])
                    .map(({ video, index }) => (
                      <div className="resource-card" key={index}>
                        <h4>
                          {video.title?.[language] || `Video ${index + 1}`}
                        </h4>
                        <p className="texto">
                          {video.description?.[language] || ""}
                        </p>
                        <VideoPrivadoViewer
                          classId={claseCompleta._id}
                          index={index}
                          language={language}
                        />
                      </div>
                    ))}
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
                <button
                  className="mark-done-button"
                  onClick={handleMarcarClase}
                >
                  {t.markAsDone}
                </button>
              )}
            </>
          ) : (
            <p>{t.noContent}</p>
          )}
        </div>
      </div>
    </>
  );
}

export default MyFormationDetail;
