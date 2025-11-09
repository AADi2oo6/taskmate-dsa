import React, { useState, useEffect } from 'react';
import { FaChevronRight, FaChevronDown, FaUsers, FaUser, FaFolder } from 'react-icons/fa';

const RecursiveTeamNode = ({ node, teamMetadataMap, onNodeClick, highlightedNodeId, highlightedPath }) => {
    // Expand role groups by default, but not managers initially for a cleaner view.
    const isNodeInPath = highlightedPath.includes(node.id);
    const [isExpanded, setIsExpanded] = useState(isNodeInPath);

    useEffect(() => { setIsExpanded(isNodeInPath); }, [isNodeInPath]);
    const person = node; // The node itself is the data object
    const hasChildren = person.children?.length > 0;
    const metadata = teamMetadataMap.get(person.id);
    const teamSize = metadata ? metadata.teamSize : 0;

    const handleToggleExpand = (e) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the focus handler
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    const handleFocusClick = () => {
        // If the node has children, clicking it should expand/collapse it.
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    // Determine card class and avatar based on node type
    const isHighlighted = person.id === highlightedNodeId;
    const cardClass = `node-card ${person.type === 'role' ? 'role-node-card' : 'person-node-card'} ${isHighlighted ? 'highlighted' : ''}`;
    const avatarIcon = person.type === 'role' ? <FaFolder /> : (person.name ? person.name.charAt(0).toUpperCase() : '?');
    const title = hasChildren ? 'Click to expand/collapse' : person.name;

    return (
        <li className="hierarchy-node" id={`node-${person.id}`}>
            <div className={cardClass} onClick={handleFocusClick} title={title}>
                <div className="node-avatar">
                    {person.type === 'person'
                        ? avatarIcon
                        : <FaFolder />}
                </div>
                <div className="node-info">
                    <p className="node-name">{person.name}</p>
                    <p className="node-role">{person.role}</p>
                </div>
                {teamSize > 1 && person.type !== 'role' && (
                    <div className="node-team-size-badge">
                        <FaUsers /> {teamSize}
                    </div>
                )}
                {hasChildren && (
                    <span className="toggle-icon" onClick={handleToggleExpand}>
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                )}
            </div>
            {hasChildren && isExpanded && (
                <ul className="node-children">{person.children?.map(childNode => 
                    <RecursiveTeamNode 
                        key={childNode.id} 
                        node={childNode} 
                        teamMetadataMap={teamMetadataMap}
                        onNodeClick={onNodeClick}
                        highlightedNodeId={highlightedNodeId}
                        highlightedPath={highlightedPath}
                    />)}
                </ul>
            )}
        </li>
    );
};

export default RecursiveTeamNode;