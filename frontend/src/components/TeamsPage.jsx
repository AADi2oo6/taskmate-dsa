import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import TeamModal from './TeamModal'; // Assuming you have this file
import TeamCard from './TeamCard';
import { useMemo } from 'react';

const TEAMS_API_URL = 'http://localhost:8081/api/teams';
const PEOPLE_API_URL = 'http://localhost:8081/api/people';

// --- Singly Linked List Implementation for Activity Log ---
class LinkedListNode {
    constructor(data, next = null) {
        this.data = data;
        this.next = next;
    }
}

class SinglyLinkedList {
    constructor() {
        this.head = null;
    }

    // Add to the beginning of the list (O(1) operation)
    addFirst(data) {
        const newNode = new LinkedListNode(data, this.head);
        this.head = newNode;
    }

    // Convert the list to an array for rendering (O(n) operation)
    toArray() {
        const elements = [];
        let currentNode = this.head;
        while (currentNode) {
            elements.push(currentNode.data);
            currentNode = currentNode.next;
        }
        return elements;
    }
}

const TeamsPage = ({ setTeamCount }) => {
    const [teams, setTeams] = useState([]);
    const [people, setPeople] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activityLog, setActivityLog] = useState(new SinglyLinkedList());

    useEffect(() => {
        fetchTeamsAndPeople();
    }, []);

    const fetchTeamsAndPeople = async () => {
        setIsLoading(true);

        // Log the fetch activity using the linked list
        const newLog = new SinglyLinkedList();
        Object.assign(newLog, activityLog);
        newLog.addFirst(`Fetching data at ${new Date().toLocaleTimeString()}`);

        setError(null);
        try {
            const [teamsResponse, peopleResponse] = await Promise.all([
                axios.get(TEAMS_API_URL),
                axios.get(PEOPLE_API_URL)
            ]);

            setTeams(teamsResponse.data);
            setPeople(peopleResponse.data);
            setTeamCount(teamsResponse.data.length);
            newLog.addFirst('Data successfully loaded.');
        } catch (error) {
            const errorMessage = 'Failed to fetch team data.';
            toast.error(errorMessage);
            setError(errorMessage);
            newLog.addFirst(`Error: ${errorMessage}`);
            console.error('Error fetching teams and people:', error);
        } finally {
            setActivityLog(newLog);
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
                const teamToDelete = teams.find(t => t.id === teamId);
                await axios.delete(`${TEAMS_API_URL}/${teamId}`);
                toast.success('Team deleted successfully!');
                fetchTeamsAndPeople(); // Refresh the list of teams

                const newLog = new SinglyLinkedList();
                Object.assign(newLog, activityLog);
                newLog.addFirst(`Deleted team: "${teamToDelete?.name || 'Unknown'}"`);
                setActivityLog(newLog);
            } catch (error) {
                toast.error('Failed to delete team.');
                console.error('Error deleting team:', error.response?.data || error.message);
            }
        }
    };
    
    const enrichedTeams = useMemo(() => {
        if (!teams.length || !people.length) {
            return []; // Return empty array if data is not ready, preventing crashes
        }

        // 1. Create a HashMap for efficient member lookup.
        const membersByTeamId = new Map();
        people.forEach(person => {
            // The backend sends a 'teams' array on each person object.
            if (person.teams && Array.isArray(person.teams)) {
                person.teams.forEach(team => {
                    if (!membersByTeamId.has(team.id)) {
                        membersByTeamId.set(team.id, []);
                    }
                    membersByTeamId.get(team.id).push(person);
                });
            }
        });

        // 2. Use the HashMap to enrich the teams data with member counts and lists.
        return teams.map(team => {
            const members = membersByTeamId.get(team.id) || [];
            return {
                ...team,
                members,
                memberCount: members.length
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

            {isLoading && <p>Loading teams...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && (
                <div className="teams-grid">
                    {filteredTeams.length > 0 ? (
                        filteredTeams.map(team => {
                            const lead = people.find(p => p.id === team.leadId);
                            return <TeamCard key={team.id} team={team} lead={lead} onDelete={handleDeleteTeam} />;
                        })
                    ) : (
                        <p>No teams found. Create one to get started!</p>
                    )}
                </div>
            )}

            {/* Render the Activity Log from the Linked List */}
            <div className="card" style={{ marginTop: '32px' }}>
                <h3>Activity Log</h3>
                <ul className="activity-log-list">
                    {activityLog.toArray().map((log, index) => (
                        <li key={index}>
                            {log}
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && (
                <TeamModal
                    team={editingTeam}
                    onClose={handleCloseModal}
                    onTeamCreated={handleTeamCreated}
                />
            )}
        </>
    );
};

export default TeamsPage;