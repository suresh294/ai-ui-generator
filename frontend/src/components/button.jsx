import React from 'react';

const Button = ({ label, onClick }) => {
    return (
        <button className="component-button" onClick={onClick}>
            {label}
        </button>
    );
};

export default Button;
