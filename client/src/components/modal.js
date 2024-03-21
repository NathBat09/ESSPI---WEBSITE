import React from 'react';
import './modal.css';

const Modal = ({ isOpen, setIsOpen, children }) => {
    return (
        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                {children}
                <button className="close" onClick={() => setIsOpen(false)}>Close</button>
            </div>
        </div>
    );
};

export default Modal;
