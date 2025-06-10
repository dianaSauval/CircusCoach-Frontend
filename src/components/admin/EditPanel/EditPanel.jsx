import { useState, useEffect } from "react";
import api from "../../../services/api";
import "./EditPanel.css";
import LanguageTabs from "../LanguageTabs/LanguageTabs";
import ClassForm from "../Form/ClassForm";
import FormationForm from "../Form/FormationForm";
import ModuleForm from "../Form/ModuleForm";
import { getYoutubeEmbedUrl } from "../../../utils/youtube";
import { getClassByIdAdmin } from "../../../services/formationService";

const EditPanel = ({
  selectedFormation,
  selectedModule,
  selectedClass,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("es");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

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

  const handleSave = async () => {
    const selectedItem = selectedClass || selectedModule || selectedFormation;
    if (!selectedItem) return;

    try {
      if (selectedClass) {
        const { updateClass } = await import(
          "../../../services/formationService"
        );
        await updateClass(selectedClass._id, formData);
      } else if (selectedModule) {
        const { updateModule } = await import(
          "../../../services/formationService"
        ); // o moduleService si lo tenés separado
        await updateModule(selectedModule._id, formData);
      } else if (selectedFormation) {
        const { updateFormation } = await import(
          "../../../services/formationService"
        );
        await updateFormation(selectedFormation._id, formData);
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

  return (
    <div className={isEditing ? "edit-panel is-editing" : "edit-panel"}>
      <LanguageTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Visualización */}
      {!isEditing && (
        <div className="view-mode">
          <div className="information">
            <h2>
              {selectedClass
                ? "\ud83d\udcd6 Clase"
                : selectedModule
                ? "\ud83d\udcdc Módulo"
                : "\ud83d\udccc Formación"}
            </h2>

            <h3>{formData.title?.[activeTab] || "Sin título"}</h3>

            {selectedModule && !selectedClass && (
              <p>
                {formData.description?.[activeTab] ||
                  "No hay descripción disponible"}
              </p>
            )}

            {selectedFormation && !selectedClass && (
              <>
                <p>
                  {formData.description?.[activeTab] ||
                    "No hay descripción disponible"}
                </p>
                <p>
                  <strong>Precio:</strong> {formData.price || "No especificado"}
                </p>

                <div>
                  <p>
                    <strong>Imagen de presentación:</strong>
                  </p>
                  {formData.image?.[activeTab] ? (
                    <img
                      src={formData.image[activeTab]}
                      alt="Imagen de la formación"
                      className="formation-image"
                    />
                  ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>
                      Imagen aún no cargada
                    </p>
                  )}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <p>
                    <strong>📄 PDF de presentación:</strong>
                  </p>
                  {formData.pdf?.[activeTab] ? (
                    <a
                      href={formData.pdf[activeTab]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-pdf-button"
                    >
                      🔗 Ver PDF
                    </a>
                  ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>
                      PDF aún no cargado
                    </p>
                  )}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <p>
                    <strong>🎥 Video de presentación:</strong>
                  </p>
                  {formData.video?.[activeTab] ? (
                    <div className="video-container">
                      <iframe
                        width="100%"
                        height="250"
                        src={getYoutubeEmbedUrl(formData.video[activeTab])}
                        title="Video de presentación"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>
                      Video aún no cargado
                    </p>
                  )}
                </div>
              </>
            )}

            {selectedClass && (
              <>
                <p>{formData.content?.[activeTab] || "No disponible"}</p>
                <h4>{formData.subtitle?.[activeTab] || "No especificado"}</h4>
                <p>
                  {formData.secondaryContent?.[activeTab] || "No disponible"}
                </p>

                <div className="pdf-preview-container">
                  <h3>📄 Documentos cargados</h3>
                  {formData?.pdfs?.length > 0 ? (
                    formData.pdfs.map((pdf, i) => (
                      <div key={i} className="pdf-preview">
                        <p>
                          <strong>📌 Título:</strong>{" "}
                          {pdf.title?.[activeTab] || "Sin título"}
                        </p>
                        <p>
                          <strong>📝 Descripción:</strong>{" "}
                          {pdf.description?.[activeTab] || "Sin descripción"}
                        </p>
                        {pdf.url?.[activeTab] ? (
                          <a
                            href={pdf.url[activeTab]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🔗 Ver PDF
                          </a>
                        ) : (
                          <p style={{ color: "#777", fontStyle: "italic" }}>
                            PDF aún no cargado
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="no-material">
                      📭 Aún no se ha cargado ningún PDF.
                    </p>
                  )}
                </div>

                <div className="video-preview-container">
                  <h3>🎥 Videos cargados</h3>
                  {formData?.videos?.length > 0 ? (
                    formData.videos.map((video, i) => {
                      const embedUrl = getYoutubeEmbedUrl(
                        video.url?.[activeTab]
                      );
                      return (
                        <div key={i} className="video-preview">
                          <p>
                            <strong>📌 Título:</strong>{" "}
                            {video.title?.[activeTab] || "Sin título"}
                          </p>
                          <p>
                            <strong>📝 Descripción:</strong>{" "}
                            {video.description?.[activeTab] ||
                              "Sin descripción"}
                          </p>
                          {video.url?.[activeTab] ? (
                            <div className="video-container">
                              <iframe
                                width="100%"
                                height="200"
                                src={embedUrl}
                                frameBorder="0"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                title={`Video ${i + 1}`}
                                onError={(e) => {
                                  e.target.style.display = "none"; // oculta el iframe
                                  const msg = document.createElement("p");
                                  msg.innerText =
                                    "🎥 El video se está procesando. Espera unos minutos y vuelve a intentarlo.";
                                  msg.className = "processing-message";
                                  e.target.parentNode.appendChild(msg);
                                }}
                              ></iframe>
                            </div>
                          ) : (
                            <p style={{ color: "#777", fontStyle: "italic" }}>
                              🎥 Video aún no cargado
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-material">
                      📭 Aún no se ha cargado ningún video.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="button-group">
            <button className="edit" onClick={() => setIsEditing(true)}>
              ✏️ Editar
            </button>
            <button
              className={`toggle-visibility ${
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
            />
          )}

          <div className="button-group">
            <button className="save" onClick={handleSave}>
              💾 Guardar Cambios
            </button>
            <button className="cancel" onClick={() => setIsEditing(false)}>
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
