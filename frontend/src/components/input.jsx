import React from 'react';

const Input = ({ label, placeholder, value, onChange, ...props }) => {
    return (
        <div className="component-input-container">
            {label && <label className="component-input-label">{label}</label>}
            <input
                className="component-input-field"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    );
};

export default Input;
