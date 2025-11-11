import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FaTrash } from 'react-icons/fa';

const TEAMS_API_URL = 'http://localhost:8082/api/teams';

const Avatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return <div className="avatar">{initial}</div>;
};

const ManageTeamForm = ({ team, people, onTeamUpdated, onClose }) => {
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');
    const [leadId, setLeadId] = useState('');
    const [memberIds, setMemberIds] = useState([]);

    useEffect(() => {
        if (team) {
            setTeamName(team.name);
            setDescription(team.description || '');
            setLeadId(team.leadId || '');
            const currentMemberIds = team.members.map(m => m.id);
            setMemberIds(currentMemberIds);
            if (team.leadId && !currentMemberIds.includes(team.leadId)) {
                setMemberIds([...currentMemberIds, team.leadId]);
            }
        }
    }, [team]);

    const memberDetails = memberIds.map(id => people.find(p => p.id === id)).filter(Boolean);

    const addMemberOptions = people
        .filter(p => !memberIds.includes(p.id))
        .map(p => ({ value: p.id, label: p.name, role: p.role }));

    const handleAddMember = (selectedOption) => {
        if (selectedOption && !memberIds.includes(selectedOption.value)) {
            setMemberIds([...memberIds, selectedOption.value]);
        }
    };

    const handleRoleChange = (memberId, newRole) => {
        if (newRole === 'Team Lead') {
            setLeadId(memberId);
        } else if (leadId === memberId) {
            setLeadId('');
        }
    };

    const handleRemoveMember = (memberIdToRemove) => {
        setMemberIds(memberIds.filter(id => id !== memberIdToRemove));
        if (leadId === memberIdToRemove) {
            setLeadId('');
        }
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
            leadId: leadId ? Number(leadId) : null,
            memberIds: memberIds.join(';'),
        };

        try {
            await axios.put(`${TEAMS_API_URL}/${team.id}`, teamData);
            toast.success('Team updated successfully!');
            onTeamUpdated();
            onClose();
        } catch (error) {
            toast.error('Failed to update team.');
            console.error('Error saving team:', error.response?.data || error.message);
        }
    };

    return (
        <div className="card manage-team-form-container">
            <form onSubmit={handleSubmit} className="modal-form">
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
                        placeholder="Search and add team members..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        value={null}
                        formatOptionLabel={({ label, role }) => (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar name={label} />
                                <div style={{ marginLeft: '10px' }}>
                                    <div>{label}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{role}</div>
                                </div>
                            </div>
                        )}
                    />
                </div>

                <div className="form-section">
                    <label className="form-section-label">Current Team ({memberDetails.length})</label>
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
                </div>

                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManageTeamForm;