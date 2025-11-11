import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FaTrash } from 'react-icons/fa';

const TEAMS_API_URL = 'http://localhost:8082/api/teams';

// A simple utility to generate a placeholder avatar
const Avatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className="avatar">{initial}</div>
    );
};

// --- Data Structure: Queue ---
// A fixed-size queue to manage the activity log.
class ActivityQueue {
    constructor(maxSize = 5) {
        this.items = [];
        this.maxSize = maxSize;
    }

    // Adds an item to the front of the queue (most recent)
    enqueue(item) {
        // If the queue is full, remove the oldest item from the end
        if (this.items.length >= this.maxSize) {
            this.items.pop();
        }
        this.items.unshift(item);
    }

    // Returns all items in the queue
    getLog() {
        return this.items;
    }

    // Creates a new ActivityQueue instance with the same items.
    clone() {
        const newQueue = new ActivityQueue(this.maxSize);
        newQueue.items = [...this.items];
        return newQueue;
    }
}

const TeamModal = ({ team, onClose, people, tasks, onTeamCreated }) => {
    const [teamName, setTeamName] = useState(team ? team.name : '');
    const [description, setDescription] = useState(team ? team.description || '' : '');
    const [leadId, setLeadId] = useState(team ? team.leadId || '' : '');
    const [memberIds, setMemberIds] = useState(team ? team.members.map(m => m.id) : []);
    const [activityLogQueue, setActivityLogQueue] = useState(new ActivityQueue(5));
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (team) {
            setTeamName(team.name);
            setDescription(team.description || '');
            setLeadId(team.leadId || '');
            const currentMemberIds = team.members.map(m => m.id);
            setMemberIds(currentMemberIds);
            // Ensure lead is always a member
            if (team.leadId && !currentMemberIds.includes(team.leadId)) {
                setMemberIds([...currentMemberIds, team.leadId]);
            }
            // Find tasks assigned to this team
            const teamTasks = tasks.filter(t => t.teamId === team.id);
            setSelectedTaskIds(teamTasks.map(t => t.id));
            setActivityLogQueue(new ActivityQueue(5)); // Reset queue for new team
        } else {
            setTeamName('');
            setDescription('');
            setLeadId('');
            setMemberIds([]);
            setSelectedTaskIds([]);
        }
        setActiveTab('details'); // Reset to the main tab whenever the modal is opened/re-opened
    }, [team, tasks]);

    // --- Data Structure Usage: Enqueue Activity ---
    const logActivity = useCallback((message, personName) => {
        setActivityLogQueue(prevQueue => {
            const newQueue = new ActivityQueue(5); // Create a new instance for immutability
            newQueue.items = [...prevQueue.getLog()]; // Copy existing items
            newQueue.enqueue({ message: `${message}: ${personName}`, timestamp: new Date() });
            return newQueue;
        });
    }, []); // No dependency on `people` needed
    
    const memberDetails = memberIds.map(id => people.find(p => p.id === id)).filter(Boolean);

    const addMemberOptions = people
        .filter(p => !memberIds.includes(p.id))
        .map(p => ({ value: p.id, label: p.name, role: p.role }));
    
    const taskOptions = tasks
        .filter(t => t.status === 'Pending') // Show all pending tasks
        .map(t => ({ value: t.id, label: t.description }));

    // Custom format for the member selection dropdown to include avatars and roles
    const formatOptionLabel = ({ value, label }) => {
        const person = people.find(p => p.id === value);
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar name={label} />
                <div style={{ marginLeft: '10px' }}>
                    <div>{label}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{person?.role}</div>
                </div>
            </div>
        );
    };

    const handleAddMember = (selectedOption) => {
        if (selectedOption && !memberIds.includes(selectedOption.value)) {            
            const person = people.find(p => p.id === selectedOption.value);
            setMemberIds([...memberIds, selectedOption.value]);
            if (person) logActivity('Added member', person.name);
        }
    };

    const handleTaskChange = (selectedOptions) => {
        setSelectedTaskIds(selectedOptions ? selectedOptions.map(o => o.value) : []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!teamName) {
            toast.error('Team name is required.');
            return;
        }

        const teamData = {
            teamName,
            description,
            leadId: leadId ? Number(leadId) : null, // The lead is now managed via the member list
            memberIds: memberIds.join(';'),
        };

        try {
            let savedTeam;
            if (team) {
                // Update existing team
                const response = await axios.put(`${TEAMS_API_URL}/${team.id}`, teamData);
                savedTeam = response.data;
                toast.success('Team updated successfully!');
            } else {
                // Create new team
                const response = await axios.post(TEAMS_API_URL, teamData);
                savedTeam = response.data;
                toast.success('Team created successfully!');
            }

            // Assign tasks to the team if it's an existing team
            if (savedTeam && savedTeam.id && team) {
                await axios.post(`${TEAMS_API_URL}/${savedTeam.id}/assign-tasks`, selectedTaskIds);
                toast.success('Tasks assigned to team successfully!');
            }

            onTeamCreated(); // This will refetch all data
            onClose();
        } catch (error) {
            toast.error(`Failed to ${team ? 'update' : 'create'} team.`);
            console.error('Error saving team:', error.response?.data || error.message);
        }
    };

    const handleRoleChange = (memberId, newRole) => {
        const member = people.find(p => p.id === memberId);
        if (newRole === 'Team Lead') {
            if (leadId !== memberId && member) {
                logActivity('Promoted to Team Lead', member.name);
            }
            setLeadId(memberId);
        } else if (leadId === memberId) {
            // If demoting the current lead, clear the leadId
            if (member) {
                logActivity('Is no longer Team Lead', member.name);
            }
            setLeadId('');
        }
    };

    const handleRemoveMember = (memberIdToRemove) => {
        const person = people.find(p => p.id === memberIdToRemove);
        setMemberIds(memberIds.filter(id => id !== memberIdToRemove));
        if (person) {
            logActivity('Removed member', person.name);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>{team ? 'Manage Team' : 'Create New Team'}</h2>
                    <button onClick={onClose} className="close-btn" title="Close">
                        &times;
                    </button>
                </div>
                <div className="modal-tabs">
                    <button type="button" className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>
                        Details
                    </button>
                    <button type="button" className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')} disabled={!team}>
                        Assign Tasks
                    </button>
                    <button type="button" className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')} disabled={!team}>
                        Activity
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {activeTab === 'details' && (
                        <>
                            <div className="form-field">
                                <label>Team Name</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Enter team name"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Team Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is this team's purpose?"
                                    rows="3"
                                />
                            </div>
                            <div className="form-section">
                                <label className="form-section-label">Add Members</label>
                                <Select
                                    options={addMemberOptions}
                                    onChange={handleAddMember}
                                    formatOptionLabel={formatOptionLabel}
                                    placeholder="Search and add team members..."
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    value={null} // Reset after selection
                                />
                            </div>
                            <div className="member-list">
                                {memberDetails.length > 0 ? memberDetails.map(member => (
                                    <div key={member.id} className={`member-item ${leadId === member.id ? 'lead' : ''}`}>
                                        <Avatar name={member.name} />
                                        <div className="member-info">
                                            <span className="member-name">{member.name}</span>
                                            <span className="member-role">{member.role}</span>
                                        </div>
                                        <div className="member-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                                            <select
                                                value={leadId === member.id ? 'Team Lead' : 'Member'}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                className="role-select"
                                            >
                                                <option>Member</option>
                                                <option>Team Lead</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="action-btn-icon danger"
                                                title="Remove Member"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                )) : <p className="empty-list-placeholder">No members yet. Add people using the search bar above.</p>}
                            </div>
                        </>
                    )}

                    {activeTab === 'tasks' && team && (
                        <div className="form-section">
                            <label className="form-section-label">Assign Tasks to Team</label>
                            <Select
                                isMulti
                                options={tasks.filter(t => t.status === 'Pending').map(t => ({ value: t.id, label: t.description }))}
                                value={tasks.filter(t => selectedTaskIds.includes(t.id)).map(t => ({ value: t.id, label: t.description }))}
                                onChange={handleTaskChange}
                                placeholder="Select tasks to assign..."
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                    )}

                    {activeTab === 'activity' && team && (
                        <div className="form-section">
                            <label className="form-section-label">Recent Activity (Queue)</label>
                            <ul className="activity-log">
                                {activityLogQueue.getLog().length > 0 ? activityLogQueue.getLog().map((entry, index) => (
                                    <li key={index}><span className="activity-message">{entry.message}</span><span className="activity-timestamp">{entry.timestamp.toLocaleTimeString()}</span></li>
                                )) : <p className="empty-list-placeholder">No recent activity in this session.</p>}
                            </ul>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {team ? 'Save Changes' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default TeamModal;