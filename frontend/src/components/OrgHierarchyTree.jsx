import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RecursiveTeamNode from './RecursiveTeamNode'; // Import the new recursive component
import { useMemo } from 'react';

const API_URL = 'http://localhost:8081/api/people';

const OrgHierarchyTree = ({ setTeamCount }) => { // This is now the main container component
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamMetadataMap, setTeamMetadataMap] = useState(new Map());
    const [sortMethod, setSortMethod] = useState('name-asc');

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
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    const childMetadata = getTeamMetadata(child);
                    teamSize += childMetadata.teamSize;
                }
            }
            return { teamSize };
        };

        rootNodes.forEach(rootNode => {
            const metadata = getTeamMetadata(rootNode);
            processedMetadataMap.set(rootNode.id, metadata);
        });

        return { processedTreeData: rootNodes, processedMetadataMap };
    };

    // useMemo ensures this sorting only re-runs when dependencies change
    const sortedTeams = useMemo(() => {
        if (!treeData.length) return [];

        return [...treeData].sort((a, b) => {
            switch (sortMethod) {
                case 'team-size-desc':
                    return (teamMetadataMap.get(b.id)?.teamSize || 0) - (teamMetadataMap.get(a.id)?.teamSize || 0);
                case 'team-size-asc':
                    return (teamMetadataMap.get(a.id)?.teamSize || 0) - (teamMetadataMap.get(b.id)?.teamSize || 0);
                case 'name-asc':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [treeData, teamMetadataMap, sortMethod]);

    if (loading) return <p>Loading organization hierarchy...</p>;
    if (treeData.length === 0) return <p>No organizational hierarchy found. Add people and assign managers!</p>;

    return (
        <>
            <div className="card" style={{ marginTop: '32px' }}>
                <div className="hierarchy-controls">
                    <h3 style={{margin: 0}}>Teams</h3>
                    <select value={sortMethod} onChange={e => setSortMethod(e.target.value)}>
                        <option value="name-asc">Sort by Manager Name</option>
                        <option value="team-size-desc">Sort by Team Size (High to Low)</option>
                        <option value="team-size-asc">Sort by Team Size (Low to High)</option>
                    </select>
                </div>
            </div>
            <div className="hierarchy-vertical-stack">
                {sortedTeams.map(rootNode => (
                    <div key={rootNode.id} className="org-chart-wrapper card">
                        <ul className="tree-root">
                            <RecursiveTeamNode 
                                node={{ data: rootNode, children: rootNode.children }} 
                                teamSize={teamMetadataMap.get(rootNode.id)?.teamSize} 
                            />
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
};

export default OrgHierarchyTree;