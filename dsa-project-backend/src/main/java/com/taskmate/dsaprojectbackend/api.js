import axios from 'axios';

const API_URL = 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_URL,
});

// People API
export const getAllPeople = () => api.get('/people');
export const createPerson = (personData) => api.post('/people', personData);
export const updatePerson = (id, personData) => api.put(`/people/${id}`, personData);
export const deletePerson = (id) => api.delete(`/people/${id}`);
export const undoLastPersonOperation = () => api.post('/people/undo');
export const redoLastPersonOperation = () => api.post('/people/redo');
export const canUndo = () => api.get('/people/can-undo');
export const canRedo = () => api.get('/people/can-redo');

// Tasks API
export const getAllTasks = () => api.get('/tasks');
export const addTask = (taskData) => api.post('/tasks/dto', taskData);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const assignTask = (taskId, personId) => api.put(`/tasks/${taskId}/assign`, { personId });
export const getActiveTaskCount = () => api.get('/tasks/count');

// Task Priority API
export const getTop5Tasks = () => api.get('/tasks/priority/top-5');
export const assignPriorityTask = (taskId, memberId) => api.post(`/tasks/priority/assign?taskId=${taskId}&memberId=${memberId}`);
export const refreshPriorities = () => api.put('/tasks/priority/refresh');

// Task Dependency API
export const addDependency = (prerequisiteTaskId, dependentTaskId) => api.post('/tasks/dependencies', { prerequisiteTaskId, dependentTaskId });
export const getDependencyGraph = () => api.get('/tasks/dependencies/graph');
export const getCriticalPath = () => api.get('/tasks/dependencies/critical-path');
export const getImpactAnalysis = (taskId) => api.get(`/tasks/dependencies/${taskId}/impact-analysis`);
export const removeDependency = (prereqId, dependentId) => api.delete(`/tasks/dependencies/${prereqId}/${dependentId}`);

// Auto-Assign API
export const autoAssignTasks = (strategy, memberIds, taskLimit) => api.post('/tasks/auto-assign', { strategy, memberIds, taskLimit });
export const getAssignmentStats = () => api.get('/tasks/assignment-stats');
export const getAvailableMembers = () => api.get('/tasks/members/available');

// Teams API
export const getAllTeams = () => api.get('/teams');
export const createTeam = (teamData) => api.post('/teams', teamData);
export const updateTeam = (id, teamData) => api.put(`/teams/${id}`, teamData);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
export const getTeamCount = () => api.get('/teams/count');
export const checkSameTeam = (personId1, personId2) => api.get(`/teams/same-team?personId1=${personId1}&personId2=${personId2}`);

// New API call for team task queue
export const getTeamTaskQueue = (teamId) => api.get(`/teams/${teamId}/tasks`);

export const updateTaskStatus = (taskId, status) => {
    return api.put(`/tasks/${taskId}/status`, { status });
};

export const getUnassignedTasks = () => api.get('/tasks').then(res => res.data.filter(task => task.assignedPersonId === null && task.status === 'Pending'));

export const assignTaskToPerson = (taskId, personId) => api.put(`/tasks/${taskId}/assign`, { personId });