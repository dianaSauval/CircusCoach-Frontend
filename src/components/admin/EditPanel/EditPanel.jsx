import { useState, useEffect } from "react";
import api from "../../../services/api";
import "./EditPanel.css";
import LanguageTabs from "../LanguageTabs/LanguageTabs";
import ClassForm from "../Form/ClassForm";
import FormationForm from "../Form/FormationForm";
import ModuleForm from "../Form/ModuleForm";
import { getClassByIdAdmin } from "../../../services/formationService";
import { getVideoEmbedUrl } from "../../../utils/videoEmbed";
import { checkVimeoAvailability } from "../../../utils/vimeoStatus";
import VideoEmbedPreview from "../VideoEmbedPreview/VideoEmbedPreview";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import VideoPrivadoViewer from "../../common/VideoPrivadoViewer/VideoPrivadoViewer";

const EditPanel = ({
  selectedFormation,
  selectedModule,
  selectedClass,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("es");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [tempUploads, setTempUploads] = useState({
    pdfs: [],
    videos: [],
    videosAEliminar: [],
    imagenesAEliminar: [],
    pdfsAEliminar: [],
  });

  const modeLabels = {
    presencial: {
      es: "Presencial",
      en: "In-person",
      fr: "Présentiel",
    },
    online: {
      es: "Online",
      en: "Online",
      fr: "En ligne",
    },
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classData = await getClassByIdAdmin(selectedClass._id);
        setFormData({
          ...classData,
          pdfs: classData.pdfs || [],
          videos: classData.videos || [],
        });
        setIsEditing(false);
      } catch (error) {
        console.error(
          "❌ Error cargando clase:",
          error.response?.data || error
        );
      }
    };

    if (selectedClass) {
      fetchClassData();
    } else if (selectedModule && !selectedClass) {
      setFormData({ ...selectedModule });
      setIsEditing(false);
    } else if (selectedFormation && !selectedClass && !selectedModule) {
      setFormData({ ...selectedFormation });
      setIsEditing(false);
    } else {
      setFormData(null);
      setIsEditing(false);
    }
  }, [selectedClass, selectedModule, selectedFormation]);

  useEffect(() => {
    if (!formData?.videos?.length) return;

    const checkAllVideos = async () => {
      const newStatus = {};

      for (const video of formData.videos) {
        const rawUrl = video?.url?.[activeTab];
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
  }, [formData, activeTab]);
  const prepareFormationDataForSave = (data) => ({
    title: data.title,
    description: data.description,
    price: Number(data.price),
    image: data.image,
    visible: data.visible,
    video: data.video,
    // 👇 Esta es la parte importante: convertimos el objeto { url, title } a string
    pdf: {
      es:
        typeof data.pdf?.es === "object" ? data.pdf.es.url : data.pdf?.es || "",
      en:
        typeof data.pdf?.en === "object" ? data.pdf.en.url : data.pdf?.en || "",
      fr:
        typeof data.pdf?.fr === "object" ? data.pdf.fr.url : data.pdf?.fr || "",
    },
    pdf_public_id: data.pdf_public_id || { es: "", en: "", fr: "" },
  });

  const handleSave = async () => {
    const selectedItem = selectedClass || selectedModule || selectedFormation;
    if (!selectedItem) return;

    try {
      // 🔥 Eliminamos los videos marcados como "pendientes de eliminar"
      if (tempUploads.videosAEliminar?.length) {
        for (const vimeoUrl of tempUploads.videosAEliminar) {
          try {
            await eliminarVideoDeVimeo(vimeoUrl);
            console.log(`🗑️ Video eliminado tras guardar: ${vimeoUrl}`);
          } catch (err) {
            console.warn(
              `⚠️ No se pudo eliminar el video ${vimeoUrl}:`,
              err.message
            );
          }
        }
      }
      // 🗑️ Eliminar PDFs marcados
      if (tempUploads.pdfsAEliminar?.length) {
        for (const id of tempUploads.pdfsAEliminar) {
          try {
            await eliminarArchivoDesdeFrontend(id, "raw");
            console.log(`🗑️ PDF eliminado tras guardar: ${id}`);
          } catch (err) {
            console.warn(`⚠️ No se pudo eliminar el PDF ${id}:`, err.message);
          }
        }
      }

      // 🗑️ Eliminar imágenes marcadas
      if (tempUploads.imagenesAEliminar?.length) {
        for (const id of tempUploads.imagenesAEliminar) {
          try {
            await eliminarArchivoDesdeFrontend(id, "image");
            console.log(`🗑️ Imagen eliminada tras guardar: ${id}`);
          } catch (err) {
            console.warn(
              `⚠️ No se pudo eliminar la imagen ${id}:`,
              err.message
            );
          }
        }
      }

      if (selectedClass) {
        const { updateClass } = await import(
          "../../../services/formationService"
        );
        await updateClass(selectedClass._id, formData);
      } else if (selectedModule) {
        const { updateModule } = await import(
          "../../../services/formationService"
        );
        await updateModule(selectedModule._id, formData);
      } else if (selectedFormation) {
        const { updateFormation } = await import(
          "../../../services/formationService"
        );
        const cleanedData = prepareFormationDataForSave(formData);
        await updateFormation(selectedFormation._id, cleanedData);
      }

      if (onUpdate) onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error(
        "❌ Error al guardar cambios:",
        error.response?.data || error
      );
    }
  };

  const toggleVisibility = async () => {
    let endpoint = null;
    let requestBody = {};

    if (selectedClass) {
      endpoint = `/classes/${selectedClass._id}/visibility/${activeTab}`;
    } else if (selectedModule) {
      endpoint = `/modules/${selectedModule._id}/visibility/${activeTab}`;
    } else if (selectedFormation) {
      endpoint = `/formations/${selectedFormation._id}/visibility/language`;
      requestBody = { language: activeTab };
    }

    if (!endpoint) return;

    try {
      await api.patch(endpoint, requestBody, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setFormData((prev) => ({
        ...prev,
        visible: { ...prev.visible, [activeTab]: !prev.visible[activeTab] },
      }));

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(
        "\u274C Error al cambiar visibilidad:",
        error.response?.data || error
      );
    }
  };

  if (!formData) {
    return (
      <p className="placeholder">
        Selecciona una formación, módulo o clase para ver detalles.
      </p>
    );
  }

  const visibilityText = formData.visible?.[activeTab]
    ? "Ocultar en este idioma"
    : "Hacer visible en este idioma";

  const handleCancel = async () => {

    // 🗑️ Eliminamos los videos temporales
    // 🚫 Ya no eliminamos videos temporales al cancelar
    console.log("🟡 Cancelando edición: NO se eliminan videos de Vimeo");

    // ♻️ Restaurar datos según lo que se estaba editando
    if (selectedClass) {
      try {
        const classData = await getClassByIdAdmin(selectedClass._id);
        setFormData({
          ...classData,
          pdfs: classData.pdfs || [],
          videos: classData.videos || [],
        });
      } catch (error) {
        console.error(
          "❌ Error al recargar clase tras cancelar:",
          error.message
        );
      }
    } else if (selectedFormation) {
      setFormData({ ...selectedFormation });
    } else if (selectedModule) {
      setFormData({ ...selectedModule });
    }

    // 🚪 Salimos del modo edición
    setIsEditing(false);

    // 🔁 Resetamos archivos temporales por si vuelven a editar
    setTempUploads({
      pdfs: [],
      videos: [],
      videosAEliminar: [],
      imagenesAEliminar: [],
      pdfsAEliminar: [],
    });
  };

  return (
    <div className={isEditing ? "edit-panel is-editing" : "edit-panel"}>
      <LanguageTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Visualización */}
      {!isEditing && (
        <div className="view-mode">
          <div className="information">
            <h2 className="titulo-principal">
              {selectedClass
                ? "\ud83d\udcd6 Clase"
                : selectedModule
                ? "\ud83d\udcdc Módulo"
                : "\ud83d\udccc Formación"}
            </h2>

            <h3 className="titulo-principal">
              {formData.title?.[activeTab] || "Sin título"}
            </h3>

            {selectedModule && !selectedClass && (
              <p className="texto">
                {formData.description?.[activeTab] ||
                  "No hay descripción disponible"}
              </p>
            )}

            {selectedFormation && !selectedClass && (
              <>
                <p className="texto">
                  {formData.description?.[activeTab] ||
                    "No hay descripción disponible"}
                </p>
                <p className="texto">
                  <strong>Precio:</strong> ${" "}
                  {formData.price || "No especificado"}
                </p>

                <div className="section-card">
                  <h4 className="subtitulo">
                    <strong>Imagen de presentación:</strong>
                  </h4>
                  {formData.image?.[activeTab] ? (
                    <div className="div-image">
                      <img
                        src={formData.image[activeTab]}
                        alt="Imagen de la formación"
                        className="formation-image"
                      />
                    </div>
                  ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>
                      Imagen aún no cargada
                    </p>
                  )}
                </div>

                <div className="section-card">
                  <h4 className="subtitulo">
                    <strong>📄 PDF de presentación:</strong>
                  </h4>
                  {(() => {
                    const raw = formData.pdf?.[activeTab];
                    const url = typeof raw === "string" ? raw : raw?.url;

                    if (!url) {
                      return (
                        <p style={{ color: "#777", fontStyle: "italic" }}>
                          PDF aún no cargado
                        </p>
                      );
                    }

                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-pdf-button"
                      >
                        🔗 Ver PDF
                      </a>
                    );
                  })()}
                </div>

                <div className="section-card">
                  <h4 className="subtitulo">
                    <strong>🎥 Video de presentación:</strong>
                  </h4>
                  {formData.video?.[activeTab] ? (
                    (() => {
                      const rawVideo = formData.video?.[activeTab];
                      const rawUrl =
                        typeof rawVideo === "string" ? rawVideo : rawVideo?.url;
                      const embedUrl = getVideoEmbedUrl(rawUrl);
                      const isVimeo =
                        typeof embedUrl === "string" &&
                        embedUrl.includes("vimeo.com");

                      if (!embedUrl || !embedUrl.startsWith("https://")) {
                        return (
                          <p style={{ color: "#777", fontStyle: "italic" }}>
                            ❌ El enlace no es válido o no se puede mostrar como
                            video embebido.
                          </p>
                        );
                      }

                      if (isVimeo && videoStatus === "processing") {
                        return (
                          <p style={{ color: "#777", fontStyle: "italic" }}>
                            ⏳ El video está siendo procesado por Vimeo. Pronto
                            estará disponible.
                          </p>
                        );
                      }

                      if (isVimeo && videoStatus === "error") {
                        return (
                          <p style={{ color: "#777", fontStyle: "italic" }}>
                            ❌ Hubo un error al cargar el video desde Vimeo.
                            Intentalo más tarde.
                          </p>
                        );
                      }

                      return (
                        <div className="video-container">
                          <iframe
                            width="100%"
                            height="250"
                            src={embedUrl}
                            title="Video de presentación"
                            frameBorder="0"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    })()
                  ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>
                      📭 Video aún no cargado
                    </p>
                  )}
                </div>
              </>
            )}

            {selectedClass && (
              <>
                <p className="texto">
                  {formData.content?.[activeTab] || "No disponible"}
                </p>
                <h4 className="subtitulo">
                  {formData.subtitle?.[activeTab] || "No especificado"}
                </h4>
                <p className="texto">
                  {formData.secondaryContent?.[activeTab] || "No disponible"}
                </p>

                <div className="pdf-preview-container">
                  <h3>📄 PDFs cargados</h3>
                  {(() => {
                    const visibles = Array.isArray(formData?.pdfs)
                      ? formData.pdfs.filter((pdf) => pdf?.url?.[activeTab])
                      : [];

                    if (visibles.length === 0) {
                      return (
                        <p className="no-material">
                          📭{" "}
                          {activeTab === "es"
                            ? "Aún no se ha cargado ningún documento en este idioma."
                            : activeTab === "en"
                            ? "No PDF uploaded in this language yet."
                            : "Aucun PDF disponible dans cette langue."}
                        </p>
                      );
                    }

                    return visibles.map((pdf, i) => (
                      <div key={i} className="pdf-preview-item">
                        <p>
                          <strong>📌 Título:</strong>{" "}
                          {pdf.title?.[activeTab] || "(sin título)"}
                        </p>
                        {pdf.description?.[activeTab] && (
                          <p>
                            <strong>📝 Descripción:</strong>{" "}
                            {pdf.description[activeTab]}
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
                    ));
                  })()}
                </div>

                <div className="video-preview-container">
                  <h3>🎥 Videos cargados</h3>
                  {(() => {
                    const videos = formData?.videos || [];

                    const videosEnIdioma = videos
                      .map((video, i) => ({ video, i })) // ⬅️ guardamos el índice real
                      .filter(({ video }) => {
                        const url = video?.url?.[activeTab]?.trim();
                        return url && url.startsWith("http");
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

                    return videosEnIdioma.map(({ video, i }) => (
                      <div key={i} className="video-preview-item">
                        {video.title?.[activeTab] && (
                          <p>
                            <strong>📌 Título:</strong> {video.title[activeTab]}
                          </p>
                        )}
                        {video.description?.[activeTab] && (
                          <p>
                            <strong>📝 Descripción:</strong>{" "}
                            {video.description[activeTab]}
                          </p>
                        )}
                        <VideoPrivadoViewer
                          classId={selectedClass._id}
                          index={i} // ✅ índice real en el array original
                          language={activeTab}
                        />
                      </div>
                    ));
                  })()}
                </div>
              </>
            )}
          </div>

          <div className="button-group">
            <button
              className="boton-secundario edit"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Editar
            </button>
            <button
              className={`boton-eliminar toggle-visibility ${
                formData.visible?.[activeTab] ? "visible" : "hidden"
              }`}
              onClick={toggleVisibility}
            >
              {visibilityText}
            </button>
          </div>
        </div>
      )}

      {/* Edición */}
      {isEditing && (
        <div className="edit-mode">
          <h2>
            ✏️ Editando{" "}
            {selectedClass ? "Clase" : selectedModule ? "Módulo" : "Formación"}
          </h2>

          {selectedFormation && !selectedClass && !selectedModule && (
            <FormationForm
              formData={formData}
              setFormData={setFormData}
              activeTab={activeTab}
              modeLabels={modeLabels}
              setTempUploads={setTempUploads}
            />
          )}

          {selectedModule && !selectedClass && (
            <ModuleForm
              formData={formData}
              setFormData={setFormData}
              activeTab={activeTab}
            />
          )}

          {selectedClass && (
            <ClassForm
              formData={formData}
              setFormData={setFormData}
              activeTab={activeTab}
              setTempUploads={setTempUploads}
            />
          )}

          <div className="button-group">
            <button className="boton-agregar" onClick={handleSave}>
              💾 Guardar
            </button>
            <button className="boton-eliminar" onClick={handleCancel}>
              ❌ Cancelar
            </button>
            <button className="toggle-visibility" onClick={toggleVisibility}>
              {visibilityText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPanel;
