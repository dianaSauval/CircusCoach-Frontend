// components/EmptyState/EmptyState.jsx
import React from "react";
import "./EmptyState.css";

const EmptyState = ({ title, subtitle, children }) => {
  return (
    <div className="empty-wrapper">
      <div className="empty-state-container">
        <h2 className="titulo-principal">{title}</h2>
        <p>{subtitle}</p>

        {children && <div className="empty-state-actions">{children}</div>}
      </div>
    </div>
  );
};

export default EmptyState;
