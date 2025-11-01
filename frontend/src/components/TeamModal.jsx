import React, { useState, useEffect, useReducer } from 'react';
import { FaSearch, FaTimes, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const memberReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_MEMBER':
            if (!state.teamMembers.find(m => m.id === action.payload.id)) {
                const newAvailable = state.availablePeople.filter(p => p.id !== action.payload.id);
                const newTeam = [...state.teamMembers, action.payload];
                return { ...state, availablePeople: newAvailable, teamMembers: newTeam };
            }
            return state;
        case 'REMOVE_MEMBER':
            const personToRemove = state.teamMembers.find(m => m.id === action.payload.id);
            if (personToRemove) {
                const newTeam = state.teamMembers.filter(p => p.id !== action.payload.id);
                // Add the person back to available, and sort it for consistent display
                const newAvailable = [...state.availablePeople, personToRemove].sort((a, b) => a.name.localeCompare(b.name));
                return { ...state, availablePeople: newAvailable, teamMembers: newTeam };
            }
            return state;
        case 'SET_PEOPLE':
            // If editing, separate the initial members from the available list
            const teamMemberIds = new Set(action.teamMembers.map(m => m.id));
            const available = action.allPeople.filter(p => !teamMemberIds.has(p.id));
            return { ...state, availablePeople: available, teamMembers: action.teamMembers };
        default:
            return state;
    }
};

const TeamModal = ({ team, onClose, onTeamCreated }) => {
    const [activeTab, setActiveTab] = useState('members');
    const [teamName, setTeamName] = useState(team ? team.name : '');
    const [leadId, setLeadId] = useState(team ? team.leadId : null);
    const [searchTerm, setSearchTerm] = useState('');

    const [state, dispatch] = useReducer(memberReducer, {
        availablePeople: [],
        teamMembers: [],
    });

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/people');
                dispatch({ 
                    type: 'SET_PEOPLE', 
                    allPeople: response.data, 
                    teamMembers: team ? team.members : [] 
                });
            } catch (error) {
                toast.error("Failed to fetch people.");
            }
        };
        fetchPeople();
    }, [team]); // Rerun if the team prop changes

    const handleSaveTeam = async () => {
        if (!teamName.trim()) {
            toast.error("Team name cannot be empty.");
            return;
        }
        const memberIds = state.teamMembers.map(m => m.id);
        const requestData = { teamName, memberIds, leadId };

        try {
            if (team) {
                // It's an update
                await axios.put(`http://localhost:8081/api/teams/${team.id}`, requestData);
                toast.success(`Team "${teamName}" updated successfully!`);
            } else {
                // It's a creation
                await axios.post('http://localhost:8081/api/teams', requestData);
                toast.success(`Team "${teamName}" created successfully!`);
            }
            
            onTeamCreated(); // Notify parent to refresh
            onClose(); // Close modal
        } catch (error) {
            const action = team ? 'update' : 'create';
            toast.error(`Failed to ${action} team.`);
            console.error(`Error ${action}ing team:`, error);
        }
    };

    const handleSetLead = (id) => {
        setLeadId(id);
    };

    const handleRemoveMember = (person) => {
        if (person.id === leadId) setLeadId(null); // Unset lead if they are removed
        dispatch({ type: 'REMOVE_MEMBER', payload: person });
    };

    const filteredAvailablePeople = state.availablePeople.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{team ? `Manage: ${team.name}` : 'Create New Team'}</h2>
                    <div className="modal-tabs">
                        <button className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>Members</button>
                        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')} disabled>Assigned Tasks</button>
                        <button className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')} disabled>Assigned Resources</button>
                        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
                    </div>
                </div>

                <div className="modal-body">
                    {activeTab === 'members' && (
                        <div className="member-management">
                            <div className="panel">
                                <h3>Available People</h3>
                                <div className="search-box">
                                    <FaSearch />
                                    <input
                                        type="text"
                                        placeholder="Search people..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <ul className="member-list">
                                    {filteredAvailablePeople.map(p => (
                                        <li key={p.id} onClick={() => dispatch({ type: 'ADD_MEMBER', payload: p })}>
                                            {p.name} <span>({p.role})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="panel">
                                <h3>Team Members ({state.teamMembers.length})</h3>
                                <ul className="member-list">
                                    {state.teamMembers.map(p => (
                                        <li key={p.id} className={p.id === leadId ? 'lead' : ''}>
                                            <div>{p.name} <span>({p.role})</span></div>
                                            <div className="member-actions">
                                                <button onClick={() => handleSetLead(p.id)} className="icon-btn" title="Make Team Lead">
                                                    <FaCrown />
                                                </button>
                                                <button onClick={() => handleRemoveMember(p)} className="icon-btn remove-member-btn" title="Remove Member">
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="panel">
                            <p>Assigned Tasks content...</p>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="panel">
                            <h3>Assigned Resources</h3>
                            <p>Assigned Resources content...</p>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="panel">
                            <h3>Team Settings</h3>
                            <div className="form-group">
                                <label htmlFor="teamName">Team Name</label>
                                <input
                                    id="teamName"
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="e.g., Frontend Developers"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="action-btn cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="action-btn sort-btn" onClick={handleSaveTeam}>{team ? 'Update Team' : 'Create Team'}</button>
                </div>
            </div>
        </div>
    );
};

export default TeamModal;