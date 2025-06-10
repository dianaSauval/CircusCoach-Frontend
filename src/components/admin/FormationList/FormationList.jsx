import { useState } from "react";
import ModuleList from "../ModuleList/ModuleList";

const FormationList = ({ formations, setSelectedFormation, setSelectedModule, setSelectedClass }) => {
  const [expandedFormations, setExpandedFormations] = useState({});

  const toggleFormation = (formation) => {
    setExpandedFormations((prev) => ({
      ...prev,
      [formation._id]: !prev[formation._id],
    }));
    setSelectedFormation(formation);
    setSelectedModule(null);
    setSelectedClass(null);
  };

  return (
    <div className="menu-list">
      <button className="add-button">➕ Nueva Formación</button>
      {formations.map((formation) => (
        <div key={formation._id} className="menu-item">
          <div className="menu-header" onClick={() => toggleFormation(formation)}>
            <h3>{formation.title}</h3>
            <span>{expandedFormations[formation._id] ? "🔽" : "▶️"}</span>
          </div>
          {expandedFormations[formation._id] && (
            <ModuleList
              formation={formation}
              setSelectedModule={setSelectedModule}
              setSelectedClass={setSelectedClass}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FormationList;
