import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCrown, FaTimes } from 'react-icons/fa';

const MemberAvatar = ({ person }) => (
    <div className="avatar" title={person.name}>
        {person.name.charAt(0).toUpperCase()}
    </div>
);

const TeamCard = ({ team, lead, onDelete }) => {
    const navigate = useNavigate();

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent any parent click events
        onDelete(team.id);
    };

    return (
        <div className="card team-card">
            <button className="delete-team-btn" onClick={handleDeleteClick} title="Delete Team">
                <FaTimes />
            </button>
            <h3>{team.name}</h3>
            {lead && <div className="team-lead"><FaCrown /> Lead: {lead.name}</div>}
            <div className="team-meta">
                <FaUsers />
                <span>{team.memberCount ?? 0} Members</span>
            </div>
            <div className="avatar-stack">
                {team.members.slice(0, 5).map(member => <MemberAvatar key={member.id} person={member} />)}
                {team.members.length > 5 && <div className="avatar-more">+{team.members.length - 5}</div>}
            </div>
            <button className="manage-btn" onClick={() => navigate(`/team/${team.id}`)}>Manage</button>
        </div>
    );
};

export default TeamCard;