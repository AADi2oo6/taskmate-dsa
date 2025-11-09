import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import TeamModal from './TeamModal'; // Assuming you have this file
import TeamCard from './TeamCard';
import { useMemo } from 'react';

const TEAMS_API_URL = 'http://localhost:8082/api/teams';
const PEOPLE_API_URL = 'http://localhost:8082/api/people';

const TeamsPage = ({ setTeamCount }) => {
    const [teams, setTeams] = useState([]);
    const [people, setPeople] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // State for the "same team" check feature
    const [person1Id, setPerson1Id] = useState('');
    const [person2Id, setPerson2Id] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeamsAndPeople();
    }, []);

    const fetchTeamsAndPeople = async () => {
        setIsLoading(true);

        setError(null);
        try {
            const [teamsResponse, peopleResponse] = await Promise.all([
                axios.get(TEAMS_API_URL),
                axios.get(PEOPLE_API_URL)
            ]);

            setTeams(teamsResponse.data);
            setPeople(peopleResponse.data);
            setTeamCount(teamsResponse.data.length);
        } catch (error) {
            const errorMessage = 'Failed to fetch team data.';
            toast.error(errorMessage);
            setError(errorMessage);
            console.error('Error fetching teams and people:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (team = null) => {
        setEditingTeam(team);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeam(null);
    };

    const handleTeamCreated = () => {
        fetchTeamsAndPeople();
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            try {
                await axios.delete(`${TEAMS_API_URL}/${teamId}`);
                toast.success('Team deleted successfully!');
                fetchTeamsAndPeople(); // Refresh the list of teams
            } catch (error) {
                toast.error('Failed to delete team.');
                console.error('Error deleting team:', error.response?.data || error.message);
            }
        }
    };

    const handleCheckSameTeam = async () => {
        if (!person1Id || !person2Id) {
            toast.error("Please select two people to compare.");
            return;
        }
        if (person1Id === person2Id) {
            toast.info("Please select two different people.");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8082/api/teams/same-team?personId1=${person1Id}&personId2=${person2Id}`);
            
            // Find person names for a more descriptive message
            const person1 = people.find(p => p.id === Number(person1Id));
            const person2 = people.find(p => p.id === Number(person2Id));

            if (response.data.areOnSameTeam) {
                toast.success(`Yes! ${person1.name} and ${person2.name} are on the same team.`);
            } else {
                toast.info(`No, ${person1.name} and ${person2.name} are not on the same team.`);
            }
        } catch (error) {
            toast.error("Failed to check team status.");
            console.error('Error checking same team status:', error);
        }
    };
    
    const enrichedTeams = useMemo(() => {
        if (!teams.length || !people.length) {
            return []; // Return empty array if data is not ready, preventing crashes
        }

        // 1. Create a HashMap of people for efficient lookup by ID.
        const peopleMap = new Map(people.map(p => [p.id, p]));

        // 2. Enrich each team with its full member objects.
        // The `team` object from the backend already contains a `members` array with at least the member IDs.
        return teams.map(team => {
            // The backend sends member objects that might not be the full Person object.
            // We need to look up the full person object from our peopleMap.
            const members = (team.members || [])
                .map(member => peopleMap.get(member.id)) // Always look up the full person object from the map
                .filter(Boolean); // Filter out any potential mismatches

            return {
                ...team,
                members,
                memberCount: members.length,
            };
        });
    }, [teams, people]);

    const filteredTeams = enrichedTeams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.members && team.members.some(member => member.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <>
            <div className="table-header">
                <h2 style={{ margin: 0 }}>Active Teams</h2>
                <div className="search-form" style={{ gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Filter by team name or member..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button onClick={() => handleOpenModal()} className="action-btn sort-btn">+ Create New Team</button>
                </div>
            </div>

            {/* --- Same Team Check Feature --- */}
            <div className="card" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <h3>Check if People are on the Same Team</h3>
                <div className="search-form">
                    <select value={person1Id} onChange={e => setPerson1Id(e.target.value)}>
                        <option value="">Select Person 1</option>
                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={person2Id} onChange={e => setPerson2Id(e.target.value)}>
                        <option value="">Select Person 2</option>
                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={handleCheckSameTeam} className="action-btn sort-btn">
                        Check
                    </button>
                </div>
            </div>

            {isLoading && <p>Loading teams...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && (
                <div className="teams-grid">
                    {filteredTeams.length > 0 ? (
                        filteredTeams.map(enrichedTeam => {
                            const lead = people.find(p => p.id === enrichedTeam.leadId);

                            return (
                                <TeamCard 
                                    key={enrichedTeam.id} 
                                    team={enrichedTeam} 
                                    lead={lead} 
                                    onDelete={handleDeleteTeam} 
                                    onManage={() => handleOpenModal(enrichedTeam)} 
                                />
                            );
                        })
                    ) : (
                        <p>No teams found. Create one to get started!</p>
                    )}
                </div>
            )}

            {isModalOpen && (
                <TeamModal
                    team={editingTeam}
                    onClose={handleCloseModal}
                    people={people}
                    onTeamCreated={handleTeamCreated}
                />
            )}
        </>
    );
};

export default TeamsPage;