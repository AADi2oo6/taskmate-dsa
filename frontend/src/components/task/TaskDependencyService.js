import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/tasks';

class TaskDependencyService {
    // Add a dependency between two tasks
    static async addDependency(prerequisiteTaskId, dependentTaskId) {
        try {
            const response = await axios.post(`${API_BASE_URL}/dependencies`, {
                prerequisiteTaskId,
                dependentTaskId
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to add dependency');
        }
    }

    // Get the dependency graph
    static async getDependencyGraph() {
        try {
            const response = await axios.get(`${API_BASE_URL}/dependencies/graph`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch dependency graph');
        }
    }

    // Get the critical path
    static async getCriticalPath() {
        try {
            const response = await axios.get(`${API_BASE_URL}/dependencies/critical-path`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch critical path');
        }
    }

    // Get impact analysis for a task
    static async getImpactAnalysis(taskId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/dependencies/${taskId}/impact-analysis`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch impact analysis');
        }
    }

    // Remove a dependency
    static async removeDependency(prerequisiteTaskId, dependentTaskId) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/dependencies/${prerequisiteTaskId}/${dependentTaskId}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to remove dependency');
        }
    }
}

export default TaskDependencyService;