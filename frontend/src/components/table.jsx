import React from 'react';

const Table = ({ data = [], columns = [] }) => {
    // Auto-infer columns if not provided
    const displayColumns = columns.length > 0
        ? columns
        : (data.length > 0 ? Object.keys(data[0]).map(key => ({ header: key.charAt(0).toUpperCase() + key.slice(1), accessor: key })) : []);

    return (
        <div className="component-table-container">
            <table className="component-table">
                <thead>
                    <tr className="component-table-header">
                        {displayColumns.map((col, idx) => (
                            <th key={idx} className="component-table-cell">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIdx) => (
                            <tr key={rowIdx} className="component-table-row">
                                {displayColumns.map((col, colIdx) => (
                                    <td key={colIdx} className="component-table-cell">
                                        {row[col.accessor] !== undefined ? String(row[col.accessor]) : ''}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={displayColumns.length || 1} className="component-table-cell" style={{ textAlign: 'center', color: '#64748b' }}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
