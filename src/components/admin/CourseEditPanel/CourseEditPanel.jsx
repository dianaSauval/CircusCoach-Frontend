import { useState, useEffect } from "react";
import LanguageTabs from "../LanguageTabs/LanguageTabs";
import "./CourseEditPanel.css";
import CourseForm from "../Form/CourseForm";
import {
  toggleCourseVisibility,
  updateCourse,
  updateCourseClass,
  toggleCourseClassVisibility,
} from "../../../services/courseService";
import { getVideoEmbedUrl } from "../../../utils/videoEmbed";
import { checkVimeoAvailability } from "../../../utils/vimeoStatus";
import { FaDollarSign } from "react-icons/fa";
import VideoPrivadoViewer from "../../common/VideoPrivadoViewer/VideoPrivadoViewer";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";

const CourseEditPanel = ({ course, selectedClass, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("es");
  const [isEditing, setIsEditing] = useState(false);
  const [videoStatus, setVideoStatus] = useState({}); // { [videoId]: "ready" | "processing" }

  const data = selectedClass || course;
  const isClass = Boolean(selectedClass);

  useEffect(() => {
    if (!data) return;

    const checkAllVideos = async () => {
      const videos = isClass ? data.videos || [] : [data.video];
      const newStatus = {};

      for (const video of videos) {
        const rawUrl = isClass ? video?.url?.[activeTab] : video?.[activeTab];
        const embedUrl = getVideoEmbedUrl(rawUrl);

        if (embedUrl?.includes("vimeo.com")) {
          const videoId = embedUrl.split("/").pop();
          const status = await checkVimeoAvailability(videoId);
          newStatus[videoId] = status;
        }
      }

      setVideoStatus(newStatus);
    };

    checkAllVideos();
    const interval = setInterval(checkAllVideos, 15000);
    return () => clearInterval(interval);
  }, [data, activeTab, isClass]);

  const renderPDFs = () => {
    if (isClass) {
      // ✅ CLASE: PDFs por idioma
      const visibles = (data?.pdfs || []).filter(
        (pdf) => pdf?.url?.[activeTab]
      );

      if (visibles.length === 0) {
        return (
          <p className="texto no-material">
            📭{" "}
            {activeTab === "es"
              ? "Aún no se ha cargado ningún documento en este idioma."
              : activeTab === "en"
              ? "No PDF uploaded in this language yet."
              : "Aucun PDF disponible dans cette langue."}
          </p>
        );
      }

      return (
        <>
          <h3>{labelByLang[activeTab].pdfs}</h3>
          {visibles.map((pdf, i) => (
            <div key={i} className="pdf-preview-item">
              <p>
                <strong>📌 Título:</strong>{" "}
                {pdf.title?.[activeTab] || "(sin título)"}
              </p>
              {pdf.description?.[activeTab] && (
                <p>
                  <strong>📝 Descripción:</strong> {pdf.description[activeTab]}
                </p>
              )}
              <a
                href={pdf.url[activeTab]}
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 Ver PDF
              </a>
            </div>
          ))}
        </>
      );
    } else {
      // 📄 CURSO: un solo PDF (público)
      const url = data.pdf?.[activeTab];

      if (!url) {
        return (
          <>
            {" "}
            <h3>{labelByLang[activeTab].pdf}</h3>
            <p className="texto no-material">
              📭{" "}
              {activeTab === "es"
                ? "Aún no se ha cargado ningún PDF en este idioma."
                : activeTab === "en"
                ? "No PDF uploaded in this language yet."
                : "Aucun PDF disponible dans cette langue."}
            </p>
          </>
        );
      }

      return (
        <>
          <h3>{labelByLang[activeTab].pdf}</h3>
          <div className="pdf-preview-item">
            <a href={url} target="_blank" rel="noopener noreferrer">
              🔗 Ver PDF
            </a>
          </div>
        </>
      );
    }
  };

  const renderVideos = () => {
    if (isClass) {
      const videos = data.videos || [];

      const videosEnIdioma = videos.filter((video) => {
        const url = video?.url?.[activeTab]?.trim();
        return url && (url.startsWith("http") || url.startsWith("www"));
      });

      if (videosEnIdioma.length === 0) {
        return (
          <p className="no-material">
            📭{" "}
            {activeTab === "es"
              ? "Aún no se ha cargado un video en este idioma."
              : activeTab === "en"
              ? "No video has been uploaded in this language yet."
              : "Aucune vidéo n’a été ajoutée dans cette langue."}
          </p>
        );
      }

      return videosEnIdioma.map((video, i) => {
        const rawUrl = video.url?.[activeTab];
        const embedUrl = getVideoEmbedUrl(rawUrl);
        const title = video.title?.[activeTab];
        const description = video.description?.[activeTab];

        const videoId = embedUrl?.split("/").pop();
        const isVimeo = embedUrl?.includes("vimeo.com");
        const status = isVimeo ? videoStatus[videoId] : "ready";

        if (!embedUrl || !embedUrl.startsWith("https://")) {
          return (
            <p key={i} className="texto no-material">
              ❌{" "}
              {activeTab === "es"
                ? "El enlace no es válido o no se puede mostrar como video embebido."
                : activeTab === "en"
                ? "The link is invalid or cannot be embedded."
                : "Le lien est invalide ou ne peut pas être intégré."}
            </p>
          );
        }

        if (isVimeo && (!status || status === "processing")) {
          return (
            <p key={i} className="no-material">
              ⏳{" "}
              {activeTab === "es"
                ? "El video está siendo procesado por Vimeo. Pronto estará disponible."
                : activeTab === "en"
                ? "The video is still being processed by Vimeo."
                : "La vidéo est encore en cours de traitement par Vimeo."}
            </p>
          );
        }

        if (status === "error") {
          return (
            <p key={i} className="texto no-material">
              ❌{" "}
              {activeTab === "es"
                ? "Hubo un error al cargar el video desde Vimeo. Intentalo más tarde."
                : activeTab === "en"
                ? "There was an error loading the video from Vimeo. Please try again later."
                : "Une erreur s’est produite lors du chargement de la vidéo depuis Vimeo."}
            </p>
          );
        }

        return (
          <div key={i} className="video-preview-item">
            {title && (
              <p>
                <strong>📌 Título:</strong> {title}
              </p>
            )}
            {description && (
              <p>
                <strong>📝 Descripción:</strong> {description}
              </p>
            )}
            <VideoPrivadoViewer
              classId={data._id}
              index={i}
              language={activeTab}
            />
          </div>
        );
      });
    } else {
      // 👇 CURSO: video promocional
      const rawUrl = data.video?.[activeTab]?.trim();

      if (!rawUrl) {
        return (
          <p className="texto no-material">
            📭{" "}
            {activeTab === "es"
              ? "Aún no se ha cargado un video en este idioma."
              : activeTab === "en"
              ? "No video has been uploaded in this language yet."
              : "Aucune vidéo n’a été ajoutée dans cette langue."}
          </p>
        );
      }

      const embedUrl = getVideoEmbedUrl(rawUrl);
      const videoId = embedUrl?.split("/").pop();
      const isVimeo = embedUrl.includes("vimeo.com");
      const status = isVimeo ? videoStatus[videoId] : "ready";

      if (!embedUrl || !videoId) {
        return (
          <p className="no-material">
            ❌{" "}
            {activeTab === "es"
              ? "El enlace no es válido o no se puede mostrar como video embebido."
              : activeTab === "en"
              ? "The link is invalid or cannot be embedded."
              : "Le lien est invalide ou ne peut pas être intégré."}
          </p>
        );
      }

      if (status === "processing") {
        return (
          <p className="no-material">
            ⏳{" "}
            {activeTab === "es"
              ? "El video aún se está procesando en Vimeo."
              : activeTab === "en"
              ? "The video is still being processed on Vimeo."
              : "La vidéo est encore en traitement sur Vimeo."}
          </p>
        );
      }

      if (status === "error") {
        return (
          <p className="no-material">
            ❌{" "}
            {activeTab === "es"
              ? "No se pudo cargar el video desde Vimeo. Intentalo más tarde."
              : activeTab === "en"
              ? "Unable to load the video from Vimeo. Please try again later."
              : "Impossible de charger la vidéo depuis Vimeo. Réessayez plus tard."}
          </p>
        );
      }

      return (
        <div className="video-preview-item">
          <iframe
            src={embedUrl}
            width="100%"
            height="360"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="video-promo"
          />
        </div>
      );
    }
  };

  const handleSave = async (updatedDataConUploads) => {
    const { tempUploads: uploads, ...updatedData } = updatedDataConUploads;
    console.log("📦 Datos al guardar:", updatedDataConUploads);
    console.log("🧹 Imagen a eliminar:", uploads?.imagenAEliminar);
    // Refuerzo: si hay PDFs marcados para borrar, me aseguro de vaciar por idioma
    if (uploads?.pdfsAEliminar?.length) {
      for (const item of uploads.pdfsAEliminar) {
        const lang = item.lang;
        if (lang && updatedData.pdf) updatedData.pdf[lang] = "";
        if (lang && updatedData.public_id_pdf)
          updatedData.public_id_pdf[lang] = "";
      }
    }

    
    try {
      if (selectedClass) {
        await updateCourseClass(selectedClass._id, updatedData);
      } else {
        await updateCourse(course._id, updatedData);
      }

      
      // ✅ Dentro de handleSave, después de eliminar videos:
      if (uploads?.pdfsAEliminar?.length > 0) {
        // Evitar duplicados por si el mismo id se marca dos veces
        const idsUnicos = Array.from(
          new Set(
            uploads.pdfsAEliminar
              .map((item) =>
                typeof item === "string" ? item : item?.public_id
              )
              .filter(Boolean)
          )
        );
        for (const id of idsUnicos) {
          try {
            await eliminarArchivoDesdeFrontend(id, "raw"); // PDFs = resource_type "raw"
            console.log("🗑️ PDF eliminado tras guardar (panel):", id);
          } catch (err) {
            console.error(
              "❌ Error al eliminar PDF tras guardar (panel):",
              err
            );
          }
        }
      }

      Object.assign(data, updatedData);
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      if (isClass) {
        await toggleCourseClassVisibility(data._id, activeTab);
      } else {
        await toggleCourseVisibility(data._id, activeTab);
      }

      data.visible[activeTab] = !data.visible?.[activeTab];
      onUpdate?.();
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);
    }
  };

  const labelByLang = {
    es: {
      course: "🎓 Curso",
      class: "📖 Clase",
      image: "📷 Imagen de presentación",
      pdf: "📄 PDF de presentación",
      pdfs: "📄 PDFs Cargados",
      video: "🎥 Video de presentación",
      videos: "🎥 Videos Cargados",
    },
    en: {
      course: "🎓 Course",
      class: "📖 Class",
      image: "📷 Presentation image",
      pdf: "📄 Presentation PDF",
      pdfs: "📄 Uploaded PDFs",
      video: "🎥 Presentation video",
      videos: "🎥 Uploaded Videos",
    },
    fr: {
      course: "🎓 Cours",
      class: "📖 Leçon",
      image: "📷 Image de présentation",
      pdf: "📄 PDF de présentation",
      pdfs: "📄 PDFs ajoutés",
      video: "🎥 Vidéo de présentation",
      videos: "🎥 Vidéos ajoutées",
    },
  };

  if (!course && !selectedClass) {
    return (
      <p className="placeholder">
        Seleccioná un curso o clase para ver sus detalles.
      </p>
    );
  }

  return (
    <div className="course-edit-panel">
      <LanguageTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {!isEditing ? (
        <div className="informationCourse">
          <h2 className="titulo-principal">
            {isClass
              ? labelByLang[activeTab].class
              : labelByLang[activeTab].course}
          </h2>
          <h3 className="titulo-principal">
            {data.title?.[activeTab] || "Sin título"}
          </h3>

          {!isClass && (
            <>
              <p className="texto">
                {data.description?.[activeTab] ||
                  "No hay descripción disponible."}
              </p>
              <p className="texto">
                <strong>Precio:</strong> $ {data.price || "No especificado"}
              </p>
              <div>
                <h4 className="subtitulo">
                  <strong>Imagen de presentación:</strong>
                </h4>
                {data.image?.[activeTab] ? (
                  <div className="div-image">
                    <img
                      src={data.image[activeTab]}
                      alt="Imagen del curso"
                      className="course-image"
                    />
                  </div>
                ) : (
                  <p className="texto no-image">Imagen aún no cargada</p>
                )}
              </div>
            </>
          )}

          {isClass && (
            <>
              <p className="texto">
                {data.content?.[activeTab] || "No hay contenido disponible."}
              </p>
              <h4 className="subtitulo">
                {data.subtitle?.[activeTab] || "Sin subtítulo"}
              </h4>
              <p className="texto">
                {data.secondaryContent?.[activeTab] ||
                  "No hay contenido secundario."}
              </p>
            </>
          )}

          <div className="pdf-preview-container">{renderPDFs()}</div>

          <div className="video-preview-container">
            <h3>🎥 Videos Cargados</h3>
            {renderVideos()}
          </div>

          <div className="button-group">
            <button
              className="boton-secundario edit"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Editar
            </button>
            <button
              className={`boton-secundario toggle-visibility ${
                data.visible?.[activeTab] ? "visible" : "hidden"
              }`}
              onClick={handleToggleVisibility}
            >
              {data.visible?.[activeTab]
                ? "Ocultar en este idioma"
                : "Hacer visible en este idioma"}
            </button>
          </div>
        </div>
      ) : (
        <CourseForm
          initialData={data}
          isClass={isClass}
          activeTab={activeTab}
          setIsEditing={setIsEditing}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default CourseEditPanel;
