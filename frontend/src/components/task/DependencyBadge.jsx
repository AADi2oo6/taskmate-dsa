import React from 'react';

const DependencyBadge = ({ count }) => {
    if (count === 0) {
        return null;
    }
    
    return (
        <span style={{
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '12px',
            marginLeft: '5px'
        }}>
            {count}
        </span>
    );
};

export default DependencyBadge;