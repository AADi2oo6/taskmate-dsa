import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import AssignTaskModal from './AssignTaskModal'; // Import the new modal

const API_URL = 'http://localhost:8081/api/tasks';

const TasksPage = ({ setTaskCount }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskRole, setNewTaskRole] = useState('');
    
    // NEW state for editing functionality
    const [isEditing, setIsEditing] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(null);

    // State for the new assignment modal
    const [assignModalTask, setAssignModalTask] = useState(null);


    const roles = ["Manager", "Developer", "Designer", "Tester", "System Administrator", "Project Manager", "Data Analyst", "UI/UX Designer"];

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(API_URL);
            setTasks(response.data);
            const countResponse = await axios.get(`${API_URL}/count`);
            setTaskCount(countResponse.data);
        } catch (error) {
            toast.error('Failed to fetch tasks.');
            console.error('Error fetching tasks:', error);
        }
    };
    
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskDescription.trim() || !newTaskDate || !newTaskRole) {
            toast.error('Please fill in all task fields.');
            return;
        }
        try {
            const taskData = {
                description: newTaskDescription,
                date: newTaskDate,
                targetRole: newTaskRole
            };
            await axios.post(API_URL, taskData);
            setNewTaskDescription('');
            setNewTaskDate('');
            setNewTaskRole('');
            fetchTasks();
            toast.success('Task added successfully!');
        } catch (error) {
            toast.error('Failed to add task.');
            console.error('Error adding task:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchTasks();
            toast.success('Task deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete task.');
            console.error('Error deleting task:', error);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/${id}/status`, { status });
            fetchTasks();
            toast.info('Task status updated.');
        } catch (error) {
            toast.error('Failed to update status.');
            console.error('Error updating status:', error);
        }
    };
    
    // NEW: Function to prepare the form for editing a task
    const handleEditTask = (task) => {
        setIsEditing(true);
        setCurrentTaskId(task.id);
        setNewTaskDescription(task.description);
        // Format the date for the input field
        setNewTaskDate(task.date.slice(0, 16));
        setNewTaskRole(task.targetRole);
    };

    // NEW: Function to handle the form submission for updating a task
    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!newTaskDescription.trim() || !newTaskDate || !newTaskRole) {
            toast.error('Please fill in all task fields.');
            return;
        }
        try {
            const taskData = {
                description: newTaskDescription,
                date: newTaskDate,
                targetRole: newTaskRole,
            };
            await axios.put(`${API_URL}/${currentTaskId}`, taskData);
            resetForm();
            fetchTasks();
            toast.success('Task updated successfully!');
        } catch (error) {
            toast.error('Failed to update task.');
            console.error('Error updating task:', error);
        }
    };

    // Helper function to reset the form state
    const resetForm = () => {
        setIsEditing(false);
        setCurrentTaskId(null);
        setNewTaskDescription('');
        setNewTaskDate('');
        setNewTaskRole('');
    };

    const handleTaskAssigned = () => {
        fetchTasks(); // Re-fetch tasks to show updated status
    };

    return (
        <div className="main-panel">
            <div className="panel-header">
                <h3>Task Management</h3>
            </div>
            <form onSubmit={isEditing ? handleUpdateTask : handleAddTask} className="person-form" style={{ marginBottom: '20px', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <input
                    type="text"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Enter new task description"
                    required
                />
                <input
                    type="datetime-local"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    required
                />
                <select
                    value={newTaskRole}
                    onChange={(e) => setNewTaskRole(e.target.value)}
                    required
                >
                    <option value="" disabled>Select Role</option>
                    <option value="All">All (Emergency)</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button type="submit" className="primary-button">{isEditing ? 'Update Task' : 'Add Task'}</button>
                {isEditing && <button type="button" onClick={resetForm} className="action-btn cancel-btn">Cancel</button>}
            </form>

            <table className="people-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Role</th>
                        <th>Date</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.id}</td>
                                <td>{task.description}</td>
                                <td>
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td>
                                <td>{task.targetRole}</td>
                                <td>{task.date ? format(parseISO(task.date), 'MM/dd/yy h:mm a') : 'N/A'}</td>
                                <td>{task.assignedPersonId || 'Unassigned'}</td>
                                <td>
                                    <button onClick={() => handleEditTask(task)} className="action-btn edit-btn">Edit</button>
                                    {task.status === 'Pending' && (
                                        <button onClick={() => setAssignModalTask(task)} className="action-btn sort-btn">Assign</button>
                                    )}
                                    <button onClick={() => handleDeleteTask(task.id)} className="action-btn delete-btn">Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No tasks found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {assignModalTask && (
                <AssignTaskModal 
                    task={assignModalTask}
                    onClose={() => setAssignModalTask(null)}
                    onTaskAssigned={handleTaskAssigned}
                />
            )}
        </div>
    );
};

export default TasksPage;