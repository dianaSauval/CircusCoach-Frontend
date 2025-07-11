import { useState, useEffect } from "react";
import "./CourseForm.css"; // reutilizás el mismo estilo que el resto
import { getAllCourses } from "../../../services/courseService";
import { getAllFormations } from "../../../services/formationService";

const DiscountForm = ({ initialData = {}, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    percentage: initialData.percentage || 0,
    amount: initialData.amount || 0,
    startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : "",
    endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : "",
    active: initialData.active ?? true,
    type: initialData.type || "course", // "course", "formation" o "both"
    targetItems: initialData.targetItems || [],
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [formations, setFormations] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (formData.type === "course" || formData.type === "both") {
          const resCourses = await getAllCourses(); // solo visibles para admin
          setCourses(resCourses);
        } else {
          setCourses([]); // Limpia si no se aplica
        }

        if (formData.type === "formation" || formData.type === "both") {
          const resFormations = await getAllFormations();
          setFormations(resFormations);
        } else {
          setFormations([]);
        }
      } catch (error) {
        console.error("Error al cargar cursos/formaciones:", error);
      }
    };

    fetchItems();
  }, [formData.type]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.startDate)
      newErrors.startDate = "Fecha de inicio obligatoria";
    if (!formData.endDate) newErrors.endDate = "Fecha de fin obligatoria";
    if (formData.percentage <= 0 && formData.amount <= 0)
      newErrors.discount = "Debe ingresar un % o un monto";

    if (formData.percentage < 0 || formData.amount < 0)
      newErrors.discount = "El descuento no puede ser negativo";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    onSave({
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="presential-form">
      <label className="label-formulario">🎁 Nombre del bono:</label>
      <input
        type="text"
        placeholder="Ej: Promo Invierno"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      {errors.name && <div className="field-error">{errors.name}</div>}

      <label className="label-formulario">📝 Descripción (opcional):</label>
      <textarea
        placeholder="Detalle interno o público de la campaña"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />
      <label className="label-formulario">📊 Descuento (%):</label>
      <input
        type="number"
        min="1"
        max="100"
        placeholder="Ej: 20"
        value={formData.percentage}
        onChange={(e) => handleChange("percentage", parseFloat(e.target.value))}
      />
      {errors.discount && <div className="field-error">{errors.discount}</div>}

      <label className="label-formulario">📅 Fecha de inicio:</label>
      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => handleChange("startDate", e.target.value)}
      />
      {errors.startDate && (
        <div className="field-error">{errors.startDate}</div>
      )}

      <label className="label-formulario">📅 Fecha de fin:</label>
      <input
        type="date"
        value={formData.endDate}
        onChange={(e) => handleChange("endDate", e.target.value)}
      />
      {errors.endDate && <div className="field-error">{errors.endDate}</div>}

      <label className="label-formulario">🎯 Aplica a:</label>
      <select
        value={formData.type}
        onChange={(e) => handleChange("type", e.target.value)}
      >
        <option value="course">Cursos</option>
        <option value="formation">Formaciones</option>
        <option value="both">Ambos</option>
      </select>
      {(formData.type === "course" || formData.type === "both") && (
        <>
          <label className="label-formulario">📚 Cursos:</label>
          <div className="checkbox-list">
            {courses.map((course) => (
              <label key={course._id}>
                {course.title?.es || "Curso sin título"}
                <input
                  type="checkbox"
                  checked={formData.targetItems.some(
                    (item) => item._id === course._id
                  )}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData((prev) => {
                      const already = prev.targetItems.find(
                        (item) => item._id === course._id
                      );
                      if (isChecked && !already) {
                        return {
                          ...prev,
                          targetItems: [
                            ...prev.targetItems,
                            { _id: course._id, title: course.title?.es },
                          ],
                        };
                      } else if (!isChecked && already) {
                        return {
                          ...prev,
                          targetItems: prev.targetItems.filter(
                            (item) => item._id !== course._id
                          ),
                        };
                      }
                      return prev;
                    });
                  }}
                />
              </label>
            ))}
          </div>
        </>
      )}

      {(formData.type === "formation" || formData.type === "both") && (
        <>
          <label className="label-formulario">🎓 Formaciones:</label>
          <div className="checkbox-list">
            {formations.map((formation) => (
              <label key={formation._id}>
                {formation.title?.es || "Formación sin título"}
                <input
                  type="checkbox"
                  checked={formData.targetItems.some(
                    (item) => item._id === formation._id
                  )}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData((prev) => {
                      const already = prev.targetItems.find(
                        (item) => item._id === formation._id
                      );
                      if (isChecked && !already) {
                        return {
                          ...prev,
                          targetItems: [
                            ...prev.targetItems,
                            { _id: formation._id, title: formation.title?.es },
                          ],
                        };
                      } else if (!isChecked && already) {
                        return {
                          ...prev,
                          targetItems: prev.targetItems.filter(
                            (item) => item._id !== formation._id
                          ),
                        };
                      }
                      return prev;
                    });
                  }}
                />
              </label>
            ))}
          </div>
        </>
      )}

      <label className="label-formulario">✔️ Estado:</label>
      <select
        value={formData.active ? "true" : "false"}
        onChange={(e) => handleChange("active", e.target.value === "true")}
      >
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>

      <div className="button-group">
        <button className="boton-agregar" type="submit">
          ✅ Guardar
        </button>
        <button className="boton-eliminar" type="button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default DiscountForm;
