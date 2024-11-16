import React from 'react';
import './SubModal.css'; // Asegúrate de crear o ajustar el archivo CSS para el estilo

const SubtareaModal = ({ show, subtarea, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal-button" onClick={onClose}>X</button>
        <h2>Detalles de la Subtarea</h2>
        <p><strong>Texto:</strong> {subtarea.text}</p>
        <p><strong>Estado:</strong> {subtarea.estado}</p>
        {/* Agrega más detalles aquí según las propiedades que quieras mostrar */}
      </div>
    </div>
  );
};

export default SubtareaModal;
