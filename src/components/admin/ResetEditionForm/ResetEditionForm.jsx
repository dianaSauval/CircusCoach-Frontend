import { useEffect, useState } from "react";

function formatDateForInput(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function ResetEditionForm({ initialData, onSubmit, saving }) {
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    durationWeeks: 4,
    capacity: 10,
    occupiedSpots: 0,
    price: 250,
    visible: true,
    status: "open",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        startDate: formatDateForInput(initialData.startDate),
        durationWeeks: initialData.durationWeeks ?? 4,
        capacity: initialData.capacity ?? 10,
        occupiedSpots: initialData.occupiedSpots ?? 0,
        price: initialData.price ?? 250,
        visible: initialData.visible ?? true,
        status: initialData.status || "open",
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      startDate: formData.startDate,
    });
  };

  return (
    <form className="reset-edition-form" onSubmit={handleSubmit}>
      <h2 className="titulo-principal">
        {initialData?._id ? "Editar edición" : "Nueva edición"}
      </h2>

      <div className="reset-edition-form__grid">
        <label>
          Título
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Fecha de inicio
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Duración (semanas)
          <input
            type="number"
            name="durationWeeks"
            min="1"
            value={formData.durationWeeks}
            onChange={handleChange}
          />
        </label>

        <label>
          Capacidad
          <input
            type="number"
            name="capacity"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Cupos ocupados
          <input
            type="number"
            name="occupiedSpots"
            min="0"
            value={formData.occupiedSpots}
            onChange={handleChange}
          />
        </label>

        <label>
          Precio (€)
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Estado
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="open">Abierta</option>
            <option value="full">Completa</option>
            <option value="closed">Cerrada</option>
          </select>
        </label>

        <label className="reset-edition-form__checkbox">
          <input
            type="checkbox"
            name="visible"
            checked={formData.visible}
            onChange={handleChange}
          />
          Visible públicamente
        </label>
      </div>

      <label className="reset-edition-form__textarea">
        Notas
        <textarea
          name="notes"
          rows="5"
          value={formData.notes}
          onChange={handleChange}
        />
      </label>

      <button type="submit" className="boton-secundario" disabled={saving}>
        {saving ? "Guardando..." : "Guardar edición"}
      </button>
    </form>
  );
}

export default ResetEditionForm;