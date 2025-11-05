import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUsers, FaPencilAlt } from 'react-icons/fa';
import TeamModal from './TeamModal'; // Import the modal

const TeamDetailPage = () => {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTeamDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8082/api/teams/${teamId}`);
                setTeam(response.data);
            } catch (err) {
                setError('Failed to load team details.');
                toast.error('Failed to load team details.');
                console.error("Error fetching team details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeamDetails();
    }, [teamId]);

    const handleTeamUpdated = () => {
        // Re-fetch the details to show the latest data after an edit
        const fetchTeamDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8082/api/teams/${teamId}`);
                setTeam(response.data);
            } catch (err) {
                toast.error('Failed to refresh team details.');
            }
        };
        fetchTeamDetails();
    };

    if (isLoading) return <p>Loading team details...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!team) return <p>Team not found.</p>;

    return (
        <>
            <div className="card" style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <Link to="/teams" className="action-btn" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <FaArrowLeft /> Back to Teams
                        </Link>
                        <h2>{team.name}</h2>
                        <div className="team-meta" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            <FaUsers />
                            <span>{team.members.length} Members</span>
                        </div>
                    </div>
                    <button className="action-btn sort-btn" onClick={() => setIsModalOpen(true)}><FaPencilAlt /> Edit Team</button>
                </div>

                <h3>Members</h3>
                <ul className="member-list" style={{ height: 'auto', border: 'none' }}>
                    {team.members.map(member => (
                        <li key={member.id}>{member.name} <span>({member.role})</span></li>
                    ))}
                </ul>
            </div>
            {isModalOpen && <TeamModal team={team} onClose={() => setIsModalOpen(false)} onTeamCreated={handleTeamUpdated} />}
        </>
    );
};

export default TeamDetailPage;