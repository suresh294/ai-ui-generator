import React from 'react';

const Navbar = ({ brand, links = [] }) => {
    return (
        <nav className="component-navbar">
            <div className="component-navbar-brand">{brand}</div>
            <ul className="component-navbar-links">
                {links.map((link, idx) => (
                    <li key={idx} className="component-navbar-item">
                        <a href={link.href} className="component-navbar-link">{link.label}</a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
