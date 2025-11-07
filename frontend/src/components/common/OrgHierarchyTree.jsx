import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RecursiveTeamNode from './RecursiveTeamNode'; // Import the new recursive component

const API_URL = 'http://localhost:8082/api/people';

const OrgHierarchyTree = ({ setTeamCount }) => { // This is now the main container component
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamMetadataMap, setTeamMetadataMap] = useState(new Map());
    const [sortMethod, setSortMethod] = useState('name-asc');
    const [filterTerm, setFilterTerm] = useState('');

    useEffect(() => {
        fetchAndProcessData();
    }, []);

    const fetchAndProcessData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            const people = response.data;

            // --- Pre-processing Step ---
            const { processedTreeData, processedMetadataMap } = preProcessData(people);

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

    const preProcessData = (people) => {
        const peopleMap = new Map(people.map(p => [p.id, { ...p, children: [] }]));
        const rootNodes = [];

        // Build the tree structure
        for (const person of people) {
            if (person.managerId && peopleMap.has(person.managerId)) {
                const manager = peopleMap.get(person.managerId);
                manager.children.push(peopleMap.get(person.id));
            } else {
                rootNodes.push(peopleMap.get(person.id));
            }
        }

        // --- Build the HashMap for metadata ---
        const processedMetadataMap = new Map();
        const getTeamMetadata = (node) => {
            let teamSize = 1;
            const allRoles = new Set([node.role]);
            const allNames = [node.name.toLowerCase()];

            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    const childMetadata = getTeamMetadata(child);
                    teamSize += childMetadata.teamSize;
                    childMetadata.allRoles.forEach(role => allRoles.add(role));
                    allNames.push(...childMetadata.allNames);
                }
            }
            return { teamSize, allRoles, allNames };
        };

        rootNodes.forEach(rootNode => {
            const metadata = getTeamMetadata(rootNode);
            processedMetadataMap.set(rootNode.id, metadata);
        });

        return { processedTreeData: rootNodes, processedMetadataMap };
    };

    // useMemo ensures this complex filtering/sorting only re-runs when dependencies change
    const visibleTeams = useMemo(() => {
        if (!treeData.length) return [];

        // 1. Filtering (Instantaneous)
        const lowerFilterTerm = filterTerm.toLowerCase();
        const filtered = filterTerm
            ? treeData.filter(rootNode => {
                const metadata = teamMetadataMap.get(rootNode.id);
                if (!metadata) return false;
                // Check if any name or role in the entire branch matches
                return metadata.allNames.some(name => name.includes(lowerFilterTerm)) || 
                       Array.from(metadata.allRoles).some(role => role.toLowerCase().includes(lowerFilterTerm));
              })
            : treeData;

        // 2. Sorting (Instantaneous)
        return [...filtered].sort((a, b) => {
            switch (sortMethod) {
                case 'team-size-desc':
                    return teamMetadataMap.get(b.id).teamSize - teamMetadataMap.get(a.id).teamSize;
                case 'team-size-asc':
                    return teamMetadataMap.get(a.id).teamSize - teamMetadataMap.get(b.id).teamSize;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }, [treeData, teamMetadataMap, sortMethod, filterTerm]);

    if (loading) return <p>Loading organization hierarchy...</p>;

    return (
        <>
            <div className="card" style={{ marginTop: '32px' }}>
                <div className="hierarchy-controls">
                    <div className="search-form">
                        <input
                            type="text"
                            placeholder="Filter by name or role..."
                            value={filterTerm}
                            onChange={e => setFilterTerm(e.target.value)}
                        />
                    </div>
                    <select value={sortMethod} onChange={e => setSortMethod(e.target.value)}>
                        <option value="name-asc">Sort by Manager Name</option>
                        <option value="team-size-desc">Sort by Team Size (Desc)</option>
                        <option value="team-size-asc">Sort by Team Size (Asc)</option>
                    </select>
                </div>
            </div>

            <div className="hierarchy-vertical-stack">
                {visibleTeams.length > 0 ? (
                    visibleTeams.map(rootNode => (
                        <div key={rootNode.id} className="org-chart-wrapper card">
                            <ul className="tree-root">
                                <RecursiveTeamNode 
                                    node={{ data: rootNode, children: rootNode.children }} 
                                    teamSize={teamMetadataMap.get(rootNode.id)?.teamSize} 
                                />
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>No teams match your filter criteria.</p>
                )}
            </div>
        </>
    );
};

export default OrgHierarchyTree;