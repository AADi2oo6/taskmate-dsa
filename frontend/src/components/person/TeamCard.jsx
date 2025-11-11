import React from 'react';
import { FaUsers, FaUserTie, FaTrash } from 'react-icons/fa';

const Avatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
    const color = colors[name ? name.length % colors.length : 0];
    return (
        <div className="avatar" style={{ backgroundColor: color }} title={name}>
            {initial}
        </div>
    );
};

const TeamCard = ({ team, lead, onDelete, onManage }) => {
    const visibleMembers = team.members.slice(0, 5);
    const hiddenMemberCount = team.members.length - visibleMembers.length;

    return (
        <div className="card team-card">
            <button onClick={() => onDelete(team.id)} className="delete-team-btn" title="Delete Team">
                <FaTrash />
            </button>

            <h3>{team.name}</h3>

            {lead && (
                <div className="team-lead">
                    <FaUserTie />
                    <span>{lead.name}</span>
                </div>
            )}

            <div className="team-meta">
                <FaUsers />
                <span>{team.memberCount} Member{team.memberCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="team-card-footer">
                <div className="avatar-stack">
                    {visibleMembers.map(member => (
                        <Avatar key={member.id} name={member.name} />
                    ))}
                    {hiddenMemberCount > 0 && (
                        <div className="avatar-more" title={`${hiddenMemberCount} more members`}>
                            +{hiddenMemberCount}
                        </div>
                    )}
                </div>

                <button onClick={onManage} className="manage-btn">
                    Manage
                </button>
            </div>
        </div>
    );
};

export default TeamCard;