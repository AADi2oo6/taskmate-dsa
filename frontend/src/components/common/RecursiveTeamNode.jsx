import React, { useState } from 'react';
import { FaChevronRight, FaChevronDown, FaUsers } from 'react-icons/fa';

const RecursiveTeamNode = ({ node, teamSize }) => {
    const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for a better initial view

    const person = node.data; // The actual person object is inside the 'data' property
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = (e) => {
        e.stopPropagation(); // Prevent card click from firing
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <li className="hierarchy-node">
            <div className="node-content" onClick={handleToggle}>
                <div className="node-card">
                    <div className="node-avatar">{person.name ? person.name.charAt(0).toUpperCase() : '?'}</div>
                    <div className="node-info">
                        <p className="node-name">{person.name}</p>
                        <p className="node-role">{person.role}</p>
                    </div>
                    {teamSize > 1 && (
                        <div className="node-team-size-badge">
                            <FaUsers /> {teamSize}
                        </div>
                    )}
                    {hasChildren && (
                        <span className="toggle-icon" onClick={handleToggle}>
                            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                    )}
                </div>
            </div>
            {hasChildren && isExpanded && (
                <ul className="node-children">{node.children.map(childNode => 
                    <RecursiveTeamNode key={childNode.id} node={{ data: childNode, children: childNode.children }} teamSize={0} />)}
                </ul>
            )}
        </li>
    );
};

export default RecursiveTeamNode;