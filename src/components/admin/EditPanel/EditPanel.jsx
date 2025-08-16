import { useState, useEffect, useRef } from "react";
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
    imagenNueva: null,
  });

  const originalRef = useRef(null);

  // 🆕 estado vacío reutilizable para no arrastrar IDs de otra edición
  const EMPTY_UPLOADS = {
    pdfs: [],
    videos: [],
    videosAEliminar: [],
    imagenesAEliminar: [],
    pdfsAEliminar: [],
    imagenNueva: null,
  };

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
        setTempUploads(EMPTY_UPLOADS); // 🆕 reset por cambio de selección
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
      setTempUploads(EMPTY_UPLOADS); // 🆕
    } else if (selectedFormation && !selectedClass && !selectedModule) {
      setFormData({ ...selectedFormation });
      setIsEditing(false);
      setTempUploads(EMPTY_UPLOADS); // 🆕
    } else {
      setFormData(null);
      setIsEditing(false);
      setTempUploads(EMPTY_UPLOADS); // 🆕
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

  useEffect(() => {
    if (selectedFormation && !selectedClass && !selectedModule) {
      // snapshot profundo del seleccionado al entrar o cambiar selección
      originalRef.current = JSON.parse(JSON.stringify(selectedFormation));
    } else {
      originalRef.current = null;
    }
  }, [selectedFormation, selectedClass, selectedModule]);

  const prepareFormationDataForSave = (data) => {
    // Normaliza cualquier forma: string | {url,title} | null/undefined
    const normPdf = (v) => {
      if (v == null) return ""; // ← si es null/undefined, guardamos vacío
      if (typeof v === "string") return v.trim();
      if (typeof v === "object") return (v.url || "").trim();
      return "";
    };
    const ensureLangs = (obj = {}) => ({
      es: obj.es || "",
      en: obj.en || "",
      fr: obj.fr || "",
    });
    return {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      image: data.image,
      visible: data.visible,
      video: data.video,

      // 👇 ya no revienta si algún idioma quedó en null
      pdf: {
        es: normPdf(data.pdf?.es),
        en: normPdf(data.pdf?.en),
        fr: normPdf(data.pdf?.fr),
      },

      // dejamos el public_id tal cual esté en el estado
      // (si tocaste el tacho, el componente ya lo dejó en "" para ese idioma)
      pdf_public_id: ensureLangs(data.pdf_public_id),
    };
  };
  const handleSave = async () => {
    const selectedItem = selectedClass || selectedModule || selectedFormation;
    if (!selectedItem) return;

    try {
      if (selectedClass) {
        const { updateClass } = await import(
          "../../../services/formationService"
        );
        await updateClass(selectedClass._id, formData); // 👈 el payload ya viene con url/lang vacíos para los que quitaste

        // 🎥 Videos persistentes marcados para borrar (Vimeo)
        if (
          Array.isArray(tempUploads.videosAEliminar) &&
          tempUploads.videosAEliminar.length
        ) {
          const urlsUnicas = Array.from(
            new Set(tempUploads.videosAEliminar.filter(Boolean))
          );
          for (const url of urlsUnicas) {
            try {
              await eliminarVideoDeVimeo(url);
            } catch (err) {
              console.warn(
                "⚠️ No se pudo eliminar el video:",
                url,
                err?.message
              );
            }
          }
        }

        // 📄 PDFs persistentes marcados para borrar (Cloudinary raw)
        if (
          Array.isArray(tempUploads.pdfsAEliminar) &&
          tempUploads.pdfsAEliminar.length
        ) {
          const idsUnicos = Array.from(
            new Set(tempUploads.pdfsAEliminar.filter(Boolean))
          );
          for (const id of idsUnicos) {
            try {
              await eliminarArchivoDesdeFrontend(id, "raw");
            } catch (err) {
              console.warn("⚠️ No se pudo eliminar el PDF:", id, err?.message);
            }
          }
        }
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

        // 🧽 Limpiar por idioma los PDFs marcados para borrar (acepta string u objeto)
        if (
          Array.isArray(tempUploads.pdfsAEliminar) &&
          tempUploads.pdfsAEliminar.length
        ) {
          for (const item of tempUploads.pdfsAEliminar) {
            const id = typeof item === "string" ? item : item?.public_id;
            const langHint = typeof item === "object" ? item?.lang : null;
            const langs = langHint ? [langHint] : ["es", "en", "fr"];

            for (const lang of langs) {
              const currentId = formData?.pdf_public_id?.[lang];
              const originalId = originalRef.current?.pdf_public_id?.[lang];
              if (id && (id === currentId || id === originalId)) {
                cleanedData.pdf[lang] = "";
                cleanedData.pdf_public_id[lang] = "";
              }
            }
          }
        }

        await updateFormation(selectedFormation._id, cleanedData);
      }

      // ——— Si llegamos acá, el update fue OK. Recién ahora borramos en origen ———

      // 🎥 Videos (Vimeo)
      if (
        Array.isArray(tempUploads.videosAEliminar) &&
        tempUploads.videosAEliminar.length
      ) {
        for (const vimeoUrl of tempUploads.videosAEliminar) {
          try {
            await eliminarVideoDeVimeo(vimeoUrl);
            console.log("🗑️ Video eliminado tras guardar:", vimeoUrl);
          } catch (err) {
            console.warn(
              "⚠️ No se pudo eliminar el video:",
              vimeoUrl,
              err?.message
            );
          }
        }
      }

      // 📄 PDFs (Cloudinary raw) — dedupe por si se marcó dos veces
      if (
        Array.isArray(tempUploads.pdfsAEliminar) &&
        tempUploads.pdfsAEliminar.length
      ) {
        const idsUnicos = Array.from(
          new Set(
            tempUploads.pdfsAEliminar
              .map((x) => (typeof x === "string" ? x : x?.public_id))
              .filter(Boolean)
          )
        );
        for (const id of idsUnicos) {
          try {
            await eliminarArchivoDesdeFrontend(id, "raw");
            console.log("🗑️ PDF eliminado tras guardar:", id);
          } catch (err) {
            console.warn("⚠️ No se pudo eliminar el PDF:", id, err?.message);
          }
        }
      }

      // 🖼️ Imágenes (Cloudinary image) — dedupe
      if (
        Array.isArray(tempUploads.imagenesAEliminar) &&
        tempUploads.imagenesAEliminar.length
      ) {
        const idsUnicosImg = Array.from(
          new Set(tempUploads.imagenesAEliminar.filter(Boolean))
        );
        for (const id of idsUnicosImg) {
          try {
            await eliminarArchivoDesdeFrontend(id, "image");
            console.log("🗑️ Imagen eliminada tras guardar:", id);
          } catch (err) {
            console.warn("⚠️ No se pudo eliminar la imagen:", id, err?.message);
          }
        }
      }

      // ——— Fin: refresco y salida de edición ———
      onUpdate?.();
      setTempUploads(EMPTY_UPLOADS);
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
        "❌ Error al cambiar visibilidad:",
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

  const handleCancel = async (e) => {
    e?.preventDefault?.();

    // 1) Borrar SOLO los PDFs NUEVOS subidos en esta edición (para no dejar huérfanos)
    if (Array.isArray(tempUploads.pdfs) && tempUploads.pdfs.length) {
      for (const id of tempUploads.pdfs) {
        try {
          await eliminarArchivoDesdeFrontend(id, "raw");
        } catch (err) {
          console.warn(
            "⚠️ No se pudo borrar PDF temporal al cancelar:",
            id,
            err?.message
          );
        }
      }
    }
    // 1b) Videos temp (Vimeo)
    if (Array.isArray(tempUploads.videos) && tempUploads.videos.length) {
      for (const url of tempUploads.videos) {
        try {
          await eliminarVideoDeVimeo(url);
        } catch (err) {
          console.warn(
            "⚠️ No se pudo borrar video temp al cancelar:",
            url,
            err?.message
          );
        }
      }
    }

    // 1c) Imagen temp (Cloudinary)
    if (tempUploads.imagenNueva) {
      try {
        await eliminarArchivoDesdeFrontend(tempUploads.imagenNueva, "image");
      } catch (err) {
        console.warn(
          "⚠️ No se pudo borrar imagen temp al cancelar:",
          err?.message
        );
      }
    }
    // 2) Rehidratar desde snapshot (cuando editás una FORMACIÓN)
    if (selectedFormation && !selectedClass && !selectedModule) {
      const snap = originalRef.current;
      if (snap) {
        setFormData((prev) => ({
          ...prev,
          pdf: {
            es:
              typeof snap?.pdf?.es === "object"
                ? snap?.pdf?.es?.url || ""
                : snap?.pdf?.es || "",
            en:
              typeof snap?.pdf?.en === "object"
                ? snap?.pdf?.en?.url || ""
                : snap?.pdf?.en || "",
            fr:
              typeof snap?.pdf?.fr === "object"
                ? snap?.pdf?.fr?.url || ""
                : snap?.pdf?.fr || "",
          },
          pdf_public_id: {
            es: snap?.pdf_public_id?.es || "",
            en: snap?.pdf_public_id?.en || "",
            fr: snap?.pdf_public_id?.fr || "",
          },
          image: {
            es: snap?.image?.es || "",
            en: snap?.image?.en || "",
            fr: snap?.image?.fr || "",
          },
          image_public_id: {
            es: snap?.image_public_id?.es || "",
            en: snap?.image_public_id?.en || "",
            fr: snap?.image_public_id?.fr || "",
          },
          video: {
            es: snap?.video?.es || "",
            en: snap?.video?.en || "",
            fr: snap?.video?.fr || "",
          },
        }));
      }
    } else if (selectedClass) {
      // 3) Si estabas editando CLASE: recargo desde backend para dejarla como estaba
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
          error?.message
        );
      }
      // Si es MÓDULO, no hay PDF público por idioma → no tocamos nada
    }

    // 4) Limpiar buffers de esta edición y salir de modo edición
    setTempUploads(EMPTY_UPLOADS);
    setIsEditing(false);
  };

  // —— helpers para el field de PDF ——
  const isTempPublicId = (id) => (tempUploads.pdfs || []).includes(id);

  const isOriginalPublicId = (lang, id) => {
    const orig = originalRef.current?.pdf_public_id?.[lang];
    return !!id && !!orig && id === orig;
  };

  // ❗ Solo borramos si REALMENTE está en la lista de nuevos
  const deleteTempNow = async (id) => {
    if (!isTempPublicId(id)) {
      console.warn("⚠️ Ignorado deleteTempNow de un id NO temporal:", id);
      return;
    }
    try {
      await eliminarArchivoDesdeFrontend(id, "raw");
      setTempUploads((prev) => ({
        ...prev,
        pdfs: (prev.pdfs || []).filter((x) => x !== id),
      }));
    } catch (err) {
      console.warn("⚠️ No se pudo eliminar PDF temporal:", err?.message);
    }
  };

  // —— helpers VIDEO (Formación promo video) ——
  const isTempVideoUrl = (url) =>
    Array.isArray(tempUploads.videos) && tempUploads.videos.includes(url);

  const deleteTempVideoNow = async (url) => {
    if (!isTempVideoUrl(url)) return;
    try {
      await eliminarVideoDeVimeo(url);
      setTempUploads((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v !== url),
      }));
    } catch (e) {
      console.warn("⚠️ No se pudo eliminar video temporal:", e?.message);
    }
  };

  // —— helpers IMAGEN (Formación imagen pública) ——
  const isTempImagePublicId = (id) => !!id && id === tempUploads.imagenNueva;

  const deleteTempImageNow = async (id) => {
    if (!isTempImagePublicId(id)) return;
    try {
      await eliminarArchivoDesdeFrontend(id, "image");
      setTempUploads((prev) => ({ ...prev, imagenNueva: null }));
    } catch (e) {
      console.warn("⚠️ No se pudo eliminar imagen temporal:", e?.message);
    }
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
                ? "📖 Clase"
                : selectedModule
                ? "📜 Módulo"
                : "📌 Formación"}
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
                      .map((video, i) => ({ video, i })) // índice real
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
                          index={i}
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
              onClick={() => {
                // snapshot profundo del estado actual al entrar en edición
                originalRef.current = JSON.parse(
                  JSON.stringify(formData || selectedFormation)
                );
                setIsEditing(true);
              }}
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
              // PDFs
              isTempPublicId={isTempPublicId}
              onDeleteTempNow={deleteTempNow}
              originalPublicIdMap={originalRef.current?.pdf_public_id || {}}
              // VIDEO promo
              isTempVideoUrl={isTempVideoUrl}
              onDeleteTempVideoNow={deleteTempVideoNow}
              onMarkVideoForDeletion={(url) =>
                setTempUploads((prev) => ({
                  ...prev,
                  videosAEliminar: [...(prev.videosAEliminar || []), url],
                }))
              }
              // IMAGEN pública
              isTempImagePublicId={isTempImagePublicId}
              onDeleteTempImageNow={deleteTempImageNow}
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
              tempUploads={tempUploads} // 👈 NUEVO
              setTempUploads={setTempUploads}
            />
          )}

          <div className="button-group">
            <button
              type="button"
              className="boton-agregar"
              onClick={handleSave}
            >
              💾 Guardar
            </button>
            <button
              type="button"
              className="boton-eliminar"
              onClick={handleCancel}
            >
              ❌ Cancelar
            </button>
            <button
              type="button"
              className="toggle-visibility"
              onClick={toggleVisibility}
            >
              {visibilityText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPanel;
