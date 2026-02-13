import React from 'react';

const Modal = ({ isOpen = true, title, children, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="component-modal-overlay">
            <div className="component-modal-content">
                <div className="component-modal-header">
                    <h3 className="component-modal-title">{title}</h3>
                    <button className="component-modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="component-modal-body">
                    {children}
                </div>
                <div className="component-modal-footer">
                    <button className="component-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
