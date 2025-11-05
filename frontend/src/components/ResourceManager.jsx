import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select'; 
import { format, parseISO } from 'date-fns';
import { Timeline } from 'vis-timeline/esnext'; // For the Gantt chart
import { Network } from 'vis-network/esnext/esm/vis-network.js'; // For the new relationship graph
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import 'vis-network/styles/vis-network.css'; // CSS for the new graph

// Mock API URLs - you will need to create these endpoints in your backend
const RESOURCES_API_URL = 'http://localhost:8081/api/resources';
const ALLOCATIONS_API_URL = 'http://localhost:8081/api/allocations';
const TEAMS_API_URL = 'http://localhost:8081/api/teams';
const PEOPLE_API_URL = 'http://localhost:8081/api/people';
const TASKS_API_URL = 'http://localhost:8081/api/tasks'; // New API endpoint for tasks

const ResourceManager = () => {
    const [allocations, setAllocations] = useState([]);
    const [resources, setResources] = useState([]);
    const [teams, setTeams] = useState([]);
    const [people, setPeople] = useState([]);
    const [tasks, setTasks] = useState([]); // New state for tasks

    // Form state
    const [resourceIds, setResourceIds] = useState([]); // Changed for multi-select
    const [teamIds, setTeamIds] = useState([]);
    const [responsiblePersonId, setResponsiblePersonId] = useState('');
    const [sprintName, setSprintName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [taskIds, setTaskIds] = useState([]); // New state for selected task IDs

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // In a real app, you would probably want to handle loading and error states
        try {
            // These are mock requests. You'll need to implement the backend APIs.
            const [allocationsRes, resourcesRes, teamsRes, peopleRes, tasksRes] = await Promise.all([
                axios.get(ALLOCATIONS_API_URL).catch(() => ({ data: [] })), // Mock empty data on error
                axios.get(RESOURCES_API_URL).catch(() => ({ data: [] })),
                axios.get(TEAMS_API_URL).catch(() => ({ data: [] })),
                axios.get(PEOPLE_API_URL).catch(() => ({ data: [] })),
                axios.get(TASKS_API_URL).catch(() => ({ data: [] })), // Fetch tasks
            ]);
            setAllocations(allocationsRes.data);
            setResources(resourcesRes.data);
            setTeams(teamsRes.data);
            setPeople(peopleRes.data);
            setTasks(tasksRes.data); // Set tasks state
        } catch (error) {
            toast.error("Failed to fetch initial resource data.");
            console.error("Data fetching error:",error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (resourceIds.length === 0 || teamIds.length === 0 || taskIds.length === 0 || !responsiblePersonId || !startTime || !endTime || !sprintName) {
            toast.error('Please fill out all fields for the allocation.');
            return;
        }

        // Create an allocation for each selected resource
        const allocationPromises = resourceIds.map(resource => {
            const allocationData = {
                resourceId: Number(resource.value),
                responsiblePersonId: Number(responsiblePersonId),
                teamIds: teamIds.map(team => Number(team.value)),
                taskIds: taskIds.map(task => Number(task.value)), // Add task IDs
                sprintName,
                startTime,
                endTime,
            };
            return axios.post(ALLOCATIONS_API_URL, allocationData);
        });

        try {
            const responses = await Promise.all(allocationPromises);
            const newAllocations = responses.map(res => res.data);
            setAllocations(prev => [...prev, ...newAllocations]);
            toast.success(`${resourceIds.length} resource(s) allocated successfully!`);
            // Reset form
            setResourceIds([]);
            setTeamIds([]);
            setTaskIds([]);
            setResponsiblePersonId('');
            setSprintName('');
            setStartTime('');
            setEndTime('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to allocate resource.');
            console.error('Error allocating resource:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${ALLOCATIONS_API_URL}/${id}`);
            setAllocations(allocations.filter(alloc => alloc.id !== id));
            toast.success('Allocation removed successfully!');
        } catch (error) {
            toast.error('Failed to remove allocation.');
            console.error('Error deleting allocation:', error);
        }
    };

    const teamOptions = teams.map(team => ({
        value: team.id,
        label: team.name,
    }));

    const resourceOptions = resources.map(resource => ({
        value: resource.id,
        label: resource.name,
    }));

    const taskOptions = tasks.map(task => ({
        value: task.id,
        label: task.description,
    }));

    const handleTeamSelectChange = (selectedOptions) => {
        setTeamIds(selectedOptions || []);
    };

    const handleResourceSelectChange = (selectedOptions) => {
        setResourceIds(selectedOptions || []);
    };

    const handleTaskSelectChange = (selectedOptions) => {
        setTaskIds(selectedOptions || []);
    };

    // Ref for the timeline element
    const timelineRef = React.useRef(null);
    const networkRef = React.useRef(null); // Ref for the new network graph

    useEffect(() => {
        if (timelineRef.current && allocations.length > 0) {
            // The items are the bars on the timeline
            const items = allocations.map(alloc => ({
                id: alloc.id,
                content: `${alloc.teams?.map(t => t.name).join(', ')} (${alloc.sprintName})`,
                start: parseISO(alloc.startTime),
                end: parseISO(alloc.endTime),
                group: alloc.resourceId, // Group by resource
            }));

            // The groups are the lanes on the timeline (our resources)
            const groups = resources.map(r => ({
                id: r.id,
                content: r.name,
            }));

            const options = {
                stack: false,
                zoomMin: 1000 * 60 * 60 * 24, // One day in milliseconds
                zoomMax: 1000 * 60 * 60 * 24 * 30 * 6, // Approx 6 months
            };

            const timeline = new Timeline(timelineRef.current, items, groups, options);

            return () => timeline.destroy();
        }
    }, [allocations, resources]);

    // --- useEffect for the new Team-Resource Network Graph ---
    useEffect(() => {
        if (networkRef.current && allocations.length > 0 && teams.length > 0 && resources.length > 0) {
            // Create nodes for teams and resources
            const teamGraphNodes = teams.map(team => ({
                id: `team_${team.id}`,
                label: `Team: ${team.name}`,
                group: 'teams',
                shape: 'box',
                color: '#f7a9a8', // Light red for teams
            }));

            const resourceGraphNodes = resources.map(resource => ({
                id: `resource_${resource.id}`,
                label: `Resource: ${resource.name}`,
                group: 'resources',
                shape: 'ellipse',
                color: '#aedff7', // Light blue for resources
            }));

            const graphNodes = [...teamGraphNodes, ...resourceGraphNodes];

            // Create edges from allocations
            const graphEdges = [];
            const edgeSet = new Set(); // To prevent duplicate edges for the same team-resource pair

            allocations.forEach(alloc => {
                const resourceNodeId = `resource_${alloc.resourceId}`;
                alloc.teams?.forEach(team => {
                    alloc.tasks?.forEach(task => {
                        const teamNodeId = `team_${team.id}`;
                        const edgeId = `${teamNodeId}_${resourceNodeId}_${task.id}`;

                        if (!edgeSet.has(edgeId)) {
                            graphEdges.push({
                                from: teamNodeId,
                                to: resourceNodeId,
                                label: `${alloc.sprintName}\nTask: ${task.description}`, // Show sprint and task
                                id: edgeId,
                                arrows: 'to',
                                font: { multi: true, size: 12 }, // Enable multiline labels
                            });
                            edgeSet.add(edgeId);
                        }
                    });
                });
            });

            const data = { nodes: graphNodes, edges: graphEdges };
            const options = {
                nodes: { borderWidth: 2 },
                edges: { color: '#666' },
                physics: { solver: 'barnesHut', barnesHut: { gravitationalConstant: -5000 } },
            };

            new Network(networkRef.current, data, options);
        }
    }, [allocations, teams, resources]);

    // --- New state and handler for adding a resource ---
    const [newResourceName, setNewResourceName] = useState('');

    const handleAddResource = async (e) => {
        e.preventDefault();
        if (!newResourceName.trim()) {
            toast.error("Resource name cannot be empty.");
            return;
        }
        try {
            const newResource = { name: newResourceName };
            const response = await axios.post(RESOURCES_API_URL, newResource);
            setResources(prev => [...prev, response.data]);
            toast.success(`Resource "${newResourceName}" added!`);
            setNewResourceName('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add resource.");
            console.error("Error adding resource:", error);
        }
    };

    return (
        <div className="main-panel">
            <div className="panel-header">
                <h3>Resource Management</h3>
                <p>Allocate resources like rooms and servers to teams for specific sprints.</p>
            </div>

            <div className="card" style={{ marginTop: '32px' }}>
                <h2>Add a New Resource</h2>
                <form onSubmit={handleAddResource} className="resource-add-form">
                    <input type="text" value={newResourceName} onChange={e => setNewResourceName(e.target.value)} placeholder="E.g., Conference Room B" required />
                    <button type="submit" className="primary-button">Add Resource</button>
                </form>
            </div>

            <div className="card" style={{ marginTop: '32px' }}>
                <h2>Allocate a Resource</h2>
                <form onSubmit={handleSubmit} className="resource-allocation-form">
                    <Select
                        isMulti
                        options={resourceOptions}
                        value={resourceIds}
                        onChange={handleResourceSelectChange}
                        placeholder="Select Resources..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    <Select
                        isMulti
                        options={teamOptions}
                        value={teamIds}
                        onChange={handleTeamSelectChange}
                        placeholder="Select Teams..."
                        className="react-select-container" // This class is for the wrapper
                        classNamePrefix="react-select" // This is for internal elements
                    />
                    <Select
                        isMulti
                        options={taskOptions}
                        value={taskIds}
                        onChange={handleTaskSelectChange}
                        placeholder="Select Tasks for this Sprint..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    <select value={responsiblePersonId} onChange={e => setResponsiblePersonId(e.target.value)} required>
                        <option value="" disabled>Responsible Person</option>
                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="text" value={sprintName} onChange={e => setSprintName(e.target.value)} placeholder="Sprint Name (e.g., Sprint 24.07)" required />
                    <div className="form-field-wrapper">
                        <label>Start Time</label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    </div>
                    <div className="form-field-wrapper">
                        <label>End Time</label>
                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                    </div>
                    <button type="submit" className="primary-button">Allocate</button>
                </form>
            </div>

            <div className="table-header" style={{ marginTop: '32px' }}>
                <h2 style={{ margin: 0 }}>Current Allocations</h2>
            </div>
            <table className="people-table">
                <thead>
                    <tr>
                        <th>Resource</th>
                        <th>Teams</th>
                        <th>Responsible Person</th>
                        <th>Tasks</th>
                        <th>Sprint</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {allocations.length > 0 ? (
                        allocations.map(alloc => (
                            <tr key={alloc.id}>
                                <td>{alloc.resource?.name || 'N/A'}</td>
                                <td>{alloc.teams?.map(t => t.name).join(', ') || 'N/A'}</td>
                                <td>{alloc.responsiblePerson?.name || 'N/A'}</td>                    
                                <td>{alloc.tasks?.map(t => t.description).join(', ') || 'N/A'}</td>
                                <td>{alloc.sprintName}</td>
                                <td>{format(parseISO(alloc.startTime), 'MM/dd/yy h:mm a')}</td>
                                <td>{format(parseISO(alloc.endTime), 'MM/dd/yy h:mm a')}</td>
                                <td>
                                    <button onClick={() => handleDelete(alloc.id)} className="action-btn delete-btn">Remove</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>No resource allocations found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="card" style={{ marginTop: '32px' }}>
                <h2>Resource Allocation Timeline (Graph)</h2>
                {allocations.length > 0 ? (
                    <div ref={timelineRef} />
                ) : (
                    <p>No allocations to display in the timeline. Add an allocation to see it here.</p>
                )}
            </div>

            <div className="card" style={{ marginTop: '32px' }}>
                <h2>Team and Resource Relationship Graph</h2>
                {allocations.length > 0 ? (
                    <div ref={networkRef} style={{ height: '400px', border: '1px solid #ddd' }} />
                ) : (
                    <p>No allocations to display in the graph. Add an allocation to see the relationships here.</p>
                )}
            </div>
        </div>
    );
};

export default ResourceManager;
