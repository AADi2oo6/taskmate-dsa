// frontend/src/services/TeamService.js

import axios from 'axios';

// Your backend is running on 8082
const API_BASE_URL = 'http://localhost:8082/api';

class TeamService {
    
    // Gets all teams (returns TeamDTO list)
    getAllTeams() {
        return axios.get(`${API_BASE_URL}/teams`);
    }

    // Gets all people (for the modal)
    getAllPeople() {
        return axios.get(`${API_BASE_URL}/people`);
    }

    // Creates a team
    // teamData should be { teamName, leadId, memberIds: "1;2;3" }
    createTeam(teamData) {
        return axios.post(`${API_BASE_URL}/teams`, teamData);
    }

    // Updates a team
    updateTeam(teamId, teamData) {
        return axios.put(`${API_BASE_URL}/teams/${teamId}`, teamData);
    }

    // Deletes a team
    deleteTeam(teamId) {
        return axios.delete(`${API_BASE_URL}/teams/${teamId}`);
    }

    // Checks if two people are on the same team
    checkSameTeam(personId1, personId2) {
        return axios.get(`${API_BASE_URL}/teams/same-team?personId1=${personId1}&personId2=${personId2}`);
    }
}

export default new TeamService();