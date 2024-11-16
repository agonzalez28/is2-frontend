// Modal.js
import React from 'react';
import './Modal.css'; // Estilos del modal

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children} {/* Mostrar el contenido del modal */}
      </div>
    </div>
  );
};

export default Modal;
