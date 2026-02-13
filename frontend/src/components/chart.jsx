import React from 'react';

const Chart = ({ title, type, data = [] }) => {
    return (
        <div className="component-chart-container">
            <div className="component-chart-header">
                <h4 className="component-chart-title">{title}</h4>
                <span className="component-chart-type">{type}</span>
            </div>
            <div className="component-chart-content">
                <div className="component-chart-placeholder">
                    {/* Mock chart visualization */}
                    <div className="component-chart-bars">
                        {data.map((val, idx) => (
                            <div
                                key={idx}
                                className="component-chart-bar"
                                style={{ height: `${val}%` }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chart;
