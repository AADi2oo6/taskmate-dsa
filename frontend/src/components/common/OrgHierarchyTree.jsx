import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RecursiveTeamNode from './RecursiveTeamNode'; // Import the new recursive component
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import hierarchyDefinition from '../../hierarchy_definition.json'; // Import the new hierarchy definition

const API_URL = 'http://localhost:8082/api/people';

const OrgHierarchyTree = ({ setTeamCount }) => { // This is now the main container component
    const [treeData, setTreeData] = useState([]);
    const [people, setPeople] = useState([]); // <-- Add state for people
    const [loading, setLoading] = useState(true);
    const [teamMetadataMap, setTeamMetadataMap] = useState(new Map());
    const [focusNodeId, setFocusNodeId] = useState(null); // New state for focus view

    // --- New state for Search & Focus ---
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedNodeId, setHighlightedNodeId] = useState(null);
    const [highlightedPath, setHighlightedPath] = useState([]);
    const transformComponentRef = useRef(null);

    useEffect(() => {
        fetchAndProcessData();
    }, []);

    const fetchAndProcessData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            const peopleData = response.data;
            setPeople(peopleData); // <-- Store people in state

            // --- Pre-processing Step ---
            const { processedTreeData, processedMetadataMap } = preProcessData(peopleData);

            setTreeData(processedTreeData);
            setTeamMetadataMap(processedMetadataMap);
            setTeamCount(processedTreeData.length);

            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch organization hierarchy.');
            console.error('Error fetching hierarchy:', error);
            setLoading(false);
        }
    };

    const preProcessData = (peopleData) => {
        const roleToNodeMap = new Map();

        // 1. Build the skeleton tree from the JSON definition
        const buildSkeleton = (roleDefinition) => {
            const node = {
                id: `role-${roleDefinition.role.replace(/\s+/g, '-')}`,
                name: roleDefinition.role,
                type: 'role',
                children: [],
            };
            roleToNodeMap.set(roleDefinition.role, node);

            if (roleDefinition.children) {
                node.children = roleDefinition.children.map(buildSkeleton);
            }
            return node;
        };

        const skeletonRoot = buildSkeleton(hierarchyDefinition);

        // 2. Populate the skeleton with actual people
        peopleData.forEach(person => {
            const parentNode = roleToNodeMap.get(person.role);
            if (parentNode) {
                parentNode.children.push({
                    ...person,
                    type: 'person',
                    children: [], // People are always leaf nodes in this model
                });
            }
        });

        // 3. Create a single virtual root to hold the entire structure
        const virtualRoot = {
            id: 'virtual-root',
            name: 'Organization',
            role: 'Company Structure',
            type: 'virtual',
            children: [skeletonRoot], // The skeleton is the only child of the root
        };

        // --- Build the HashMap for metadata ---
        const processedMetadataMap = new Map();
        const getTeamMetadata = (node) => {
            let teamSize = 1;
            const allRoles = new Set([node.role]);
            const allNames = [node.name.toLowerCase()];

            if (node.children?.length > 0) {
                for (const child of node.children) {
                    const childMetadata = getTeamMetadata(child);
                    teamSize += childMetadata.teamSize;
                    childMetadata.allRoles.forEach(role => allRoles.add(role));
                    allNames.push(...childMetadata.allNames);
                }
            }
            return { teamSize, allRoles, allNames };
        };

        const populateMetadataForAllNodes = (node) => {
            if (!node) return;
            processedMetadataMap.set(node.id, getTeamMetadata(node));
            if (node.children) {
                node.children.forEach(populateMetadataForAllNodes);
            }
        };

        populateMetadataForAllNodes(virtualRoot);
        // The entire tree data is now the single virtual root
        return { processedTreeData: [virtualRoot], processedMetadataMap };
    };

    const handleNodeClick = (nodeId) => {
        setFocusNodeId(nodeId);
    };

    const resetFocus = () => {
        setFocusNodeId(null);
    };

    // --- Search & Focus Logic ---
    const findNodeAndPath = (node, query, path = []) => {
        const currentPath = [...path, node.id];
        if (node.name.toLowerCase().includes(query.toLowerCase()) || (node.role && node.role.toLowerCase().includes(query.toLowerCase()))) {
            return currentPath;
        }

        if (node.children) {
            for (const child of node.children) {
                const foundPath = findNodeAndPath(child, query, currentPath);
                if (foundPath) return foundPath;
            }
        }
        return null;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setHighlightedNodeId(null);
            setHighlightedPath([]);
            return;
        }

        const path = findNodeAndPath(treeData[0], searchTerm);

        if (path) {
            const targetNodeId = path[path.length - 1];
            setHighlightedPath(path);
            setHighlightedNodeId(targetNodeId);
        } else {
            toast.info("No person or role found matching your query.");
            setHighlightedNodeId(null);
            setHighlightedPath([]);
        }
    };

    // This effect triggers the pan/zoom animation when a node is highlighted
    useEffect(() => {
        if (highlightedNodeId && transformComponentRef.current) {
            const { zoomToElement } = transformComponentRef.current;
            const elementId = `node-${highlightedNodeId}`;
            // The timeout gives React a moment to render the expanded nodes before we try to zoom
            setTimeout(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    zoomToElement(elementId, 1.2, 300); // Zoom to 120% scale over 300ms
                }
            }, 100);
        }
    }, [highlightedNodeId]);

    // useMemo ensures this complex filtering/sorting only re-runs when dependencies change
    const visibleTree = useMemo(() => {
        if (!treeData.length) return [];

        let baseNode = treeData[0]; // Start with the virtual root

        // If a focus node is set, find it in the tree
        if (focusNodeId) {
            const findNode = (node, id) => {
                if (node.id === id) return node;
                if (node.children) {
                    for (const child of node.children) {
                        const found = findNode(child, id);
                        if (found) return found;
                    }
                }
                return null;
            };
            baseNode = findNode(baseNode, focusNodeId) || baseNode;
        }

        // The tree no longer needs sorting or filtering, just return the base node.
        return baseNode;

    }, [treeData, teamMetadataMap, focusNodeId]);

    if (loading) return <p>Loading organization hierarchy...</p>;

    return (
        <>
            <div className="card" style={{ marginTop: '32px' }}>
                <div className="hierarchy-controls">
                    <form onSubmit={handleSearch} className="search-form" style={{ flexGrow: 1 }}>
                        <input
                            type="text"
                            placeholder="Find by name or role..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', maxWidth: '400px' }}
                        />
                        <button type="submit" className="action-btn sort-btn">Search</button>
                        {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); setHighlightedNodeId(null); setHighlightedPath([]); }} className="action-btn cancel-btn">Clear</button>}
                    </form>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {focusNodeId && <button onClick={resetFocus} className="action-btn sort-btn">Show Full Organization</button>}

                    </div>
                </div>
            </div>

            <div className="hierarchy-vertical-stack">
                {visibleTree && visibleTree.children && visibleTree.children.length > 0 ? (
                    <div className="org-chart-wrapper card">
                        <TransformWrapper minScale={0.2} initialScale={0.8} wheel={{ step: 0.1 }} ref={transformComponentRef}>
                            <TransformComponent wrapperClass="transform-wrapper-full">
                                <ul className="tree-root">
                                    {/* We map over the children of the root, as the root itself is just a container */}
                                    {visibleTree.children.map(childNode => (
                                        <RecursiveTeamNode
                                            key={childNode.id}
                                            node={childNode}
                                            teamMetadataMap={teamMetadataMap}
                                            onNodeClick={handleNodeClick}
                                            highlightedNodeId={highlightedNodeId}
                                            highlightedPath={highlightedPath}
                                        />
                                    ))}
                                </ul>
                            </TransformComponent>
                        </TransformWrapper>
                    </div>) : (
                    <p style={{ marginTop: '20px', textAlign: 'center' }}>No results match your filter criteria.</p>
                )}
            </div>
        </>
    );
};

export default OrgHierarchyTree;