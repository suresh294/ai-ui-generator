import React from 'react';

const Card = ({ title, children, content }) => {
    return (
        <div className="component-card">
            {title && <div className="component-card-title">{title}</div>}
            <div className="component-card-content">
                {children || content}
            </div>
        </div>
    );
};

export default Card;
