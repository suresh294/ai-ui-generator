import React from 'react';

const Sidebar = ({ items = [] }) => {
    return (
        <div className="component-sidebar">
            <ul className="component-sidebar-list">
                {items.map((item, idx) => (
                    <li key={idx} className="component-sidebar-item">
                        <a href={item.link || '#'} className="component-sidebar-link">
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;