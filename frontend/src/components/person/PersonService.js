import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/people';

class PersonService {
    // Get all persons
    static async getAllPersons() {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch persons');
        }
    }

    // Get person by ID
    static async getPersonById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch person');
        }
    }

    // Add a new person
    static async addPerson(person) {
        try {
            const response = await axios.post(API_BASE_URL, person);
            return response.data;
        } catch (error) {
            throw new Error('Failed to add person');
        }
    }

    // Update a person
    static async updatePerson(id, person) {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, person);
            return response.data;
        } catch (error) {
            throw new Error('Failed to update person');
        }
    }

    // Delete a person
    static async deletePerson(id) {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            return true;
        } catch (error) {
            throw new Error('Failed to delete person');
        }
    }
}

export default PersonService;