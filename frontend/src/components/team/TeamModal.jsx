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

const TeamModal = ({ team, onClose, onTeamCreated, people }) => {
    const [teamName, setTeamName] = useState(team ? team.name : '');
    const [leadId, setLeadId] = useState(team ? team.leadId : null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState(''); // New state for role filter

    const [state, dispatch] = useReducer(memberReducer, {
        availablePeople: [],
        teamMembers: [],
    });

    useEffect(() => {
        // Initialize state based on the people prop from TeamsPage
        dispatch({
            type: 'SET_PEOPLE',
            allPeople: people,
            teamMembers: team ? team.members : []
        });
    }, [team, people]); // Rerun if the team or people props change

    const handleSaveTeam = async () => {
        if (!teamName.trim()) {
            toast.error("Team name cannot be empty.");
            return;
        }
        // Format the member IDs into a single delimited string as requested.
        const memberIds = state.teamMembers.map(m => m.id).join(';');
        const requestData = { teamName, memberIds, leadId };

        try {
            if (team) {
                // It's an update
                await axios.put(`http://localhost:8082/api/teams/${team.id}`, requestData);
                toast.success(`Team "${teamName}" updated successfully!`);
            } else {
                // It's a creation
                await axios.post('http://localhost:8082/api/teams', requestData);
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

    // --- New Feature Logic ---
    // Get a unique, sorted list of roles for the filter dropdown
    const availableRoles = [...new Set(people.map(p => p.role))].sort();

    // Calculate total work hours for the current team members
    const totalTeamHours = state.teamMembers.reduce((sum, member) => sum + (member.totalWorkHour || 0), 0);

    const filteredAvailablePeople = state.availablePeople.filter(p =>
        // Filter by search term
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        // AND filter by selected role (if any)
        (roleFilter ? p.role === roleFilter : true)
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{team ? `Manage Team` : 'Create New Team'}</h2>
                </div>

                <div className="modal-body">
                    <div className="panel">
                        <h3>Team Details</h3>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label htmlFor="teamName">Team Name</label>
                            <input
                                id="teamName"
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g., Frontend Developers"
                            />
                        </div>
                        <div className="member-management">
                            <div className="panel" style={{padding: 0}}>
                                <h3>Available People</h3>
                                <div className="member-filters">
                                    <input
                                        type="text"
                                        placeholder="Search people..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                                        <option value="">All Roles</option>
                                        {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <ul className="member-list">
                                    {filteredAvailablePeople.map(p => (
                                        <li key={p.id} onClick={() => dispatch({ type: 'ADD_MEMBER', payload: p })}>
                                            {p.name} <span>({p.role})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="panel" style={{padding: 0}}>
                                <div className="team-members-header">
                                    <h3>Team Members ({state.teamMembers.length})</h3>
                                    <div className="team-stats">
                                        Total Hours: <strong>{totalTeamHours} / week</strong>
                                    </div>
                                </div>
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
                    </div>
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