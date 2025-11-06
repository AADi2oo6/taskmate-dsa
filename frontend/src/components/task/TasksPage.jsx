import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import AssignTaskModal from './AssignTaskModal'; // Import the new modal
import AutoAssignModal from './AutoAssignModal'; // Import the auto-assign modal
import DependencyBadge from './DependencyBadge'; // Import dependency badge
import TaskDependencyGraph from './TaskDependencyGraph'; // Import dependency graph
import AddDependencyModal from './AddDependencyModal'; // Import add dependency modal

const API_URL = 'http://localhost:8082/api/tasks';

const TasksPage = ({ setTaskCount }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskRole, setNewTaskRole] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState(3); // Default medium priority
    const [newTaskDeadline, setNewTaskDeadline] = useState('');
    
    // NEW state for editing functionality
    const [isEditing, setIsEditing] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(null);

    // State for the new assignment modal
    const [assignModalTask, setAssignModalTask] = useState(null);

    // State for priority queue feature
    const [priorityTasks, setPriorityTasks] = useState([]);
    const [draggedTask, setDraggedTask] = useState(null);

    // State for task dependencies feature
    const [showDependencies, setShowDependencies] = useState(false);
    const [dependencyGraph, setDependencyGraph] = useState({ nodes: [], edges: [] });
    const [showCriticalPath, setShowCriticalPath] = useState(false);
    const [showAddDependencyModal, setShowAddDependencyModal] = useState(false);

    // State for auto-assign feature
    const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);

    const roles = ["Manager", "Developer", "Designer", "Tester", "System Administrator", "Project Manager", "Data Analyst", "UI/UX Designer"];
    const priorities = [
        { value: 1, label: '1 - Highest' },
        { value: 2, label: '2 - High' },
        { value: 3, label: '3 - Medium' },
        { value: 4, label: '4 - Low' },
        { value: 5, label: '5 - Lowest' }
    ];

    useEffect(() => {
        fetchTasks();
        fetchPriorityTasks();
        fetchDependencyGraph();
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
    
    const fetchPriorityTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/priority/top-5`);
            setPriorityTasks(response.data);
        } catch (error) {
            console.error('Error fetching priority tasks:', error);
        }
    };

    const fetchDependencyGraph = async () => {
        try {
            const response = await axios.get(`${API_URL}/dependencies/graph`);
            setDependencyGraph(response.data);
        } catch (error) {
            console.error('Error fetching dependency graph:', error);
        }
    };

    // Refresh priority tasks every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchPriorityTasks();
        }, 120000); // 2 minutes in milliseconds
        
        return () => clearInterval(interval);
    }, []);
    
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
                targetRole: newTaskRole,
                priority: newTaskPriority,
                deadline: newTaskDeadline || newTaskDate
            };
            await axios.post(`${API_URL}/dto`, taskData);
            setNewTaskDescription('');
            setNewTaskDate('');
            setNewTaskRole('');
            setNewTaskPriority(3);
            setNewTaskDeadline('');
            fetchTasks();
            fetchPriorityTasks();
            fetchDependencyGraph();
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
            fetchPriorityTasks();
            fetchDependencyGraph();
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
            fetchPriorityTasks();
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
        setNewTaskPriority(task.priority || 3);
        setNewTaskDeadline(task.deadline ? task.deadline.slice(0, 16) : '');
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
                priority: newTaskPriority,
                deadline: newTaskDeadline || newTaskDate
            };
            await axios.put(`${API_URL}/${currentTaskId}`, taskData);
            resetForm();
            fetchTasks();
            fetchPriorityTasks();
            fetchDependencyGraph();
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
        setNewTaskPriority(3);
        setNewTaskDeadline('');
    };

    const handleTaskAssigned = () => {
        fetchTasks(); // Re-fetch tasks to show updated status
        fetchPriorityTasks();
        fetchDependencyGraph();
    };

    // Priority Queue functions
    const handlePullNextTask = async () => {
        if (priorityTasks.length > 0) {
            const nextTask = priorityTasks[0];
            // For now, we'll just show a toast - in a real implementation, 
            // you would open a modal to select a member to assign the task to
            toast.info(`Next task: ${nextTask.name} (Priority: ${nextTask.priority})`);
        } else {
            toast.info('No priority tasks available');
        }
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetTask) => {
        e.preventDefault();
        if (draggedTask && draggedTask.id !== targetTask.id) {
            // In a real implementation, you would update the priority order
            toast.info(`Reordered tasks: ${draggedTask.name} and ${targetTask.name}`);
        }
        setDraggedTask(null);
    };

    // Get priority color based on priority level
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'red';
            case 2: return 'orange';
            case 3: return 'yellow';
            case 4: return 'lightgreen';
            case 5: return 'green';
            default: return 'gray';
        }
    };

    return (
        <div className="main-panel">
            <div className="panel-header">
                <h3>Task Management</h3>
            </div>
            
            {/* Priority Queue Section */}
            <div className="priority-queue-section" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4>Priority Queue</h4>
                    <button className="primary-button" onClick={handlePullNextTask}>
                        Pull Next Task
                    </button>
                </div>
                <div className="priority-cards" style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                    {priorityTasks.length > 0 ? (
                        priorityTasks.map((task, index) => (
                            <div 
                                key={task.id}
                                className="priority-card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, task)}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    minWidth: '200px',
                                    backgroundColor: '#f9f9f9',
                                    cursor: 'move'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{task.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        width: '12px', 
                                        height: '12px', 
                                        borderRadius: '50%', 
                                        backgroundColor: getPriorityColor(task.priority),
                                        marginRight: '8px'
                                    }}></span>
                                    <span>Priority: {task.priority}</span>
                                </div>
                                <div>Days left: {task.daysLeft}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '15px', fontStyle: 'italic', color: '#666' }}>
                            No priority tasks available
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={isEditing ? handleUpdateTask : handleAddTask} className="person-form" style={{ marginBottom: '20px', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
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
                <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(parseInt(e.target.value))}
                >
                    {priorities.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="Deadline"
                />
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button type="submit" className="primary-button">{isEditing ? 'Update Task' : 'Add Task'}</button>
                    <button 
                        type="button" 
                        className="primary-button" 
                        style={{ backgroundColor: '#007bff' }}
                        onClick={() => setShowAutoAssignModal(true)}
                    >
                        Auto-Assign Tasks
                    </button>
                </div>
                {isEditing && <button type="button" onClick={resetForm} className="action-btn cancel-btn">Cancel</button>}
            </form>

            <table className="people-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Role</th>
                        <th>Priority</th>
                        <th>Date</th>
                        <th>Deadline</th>
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
                                <td>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        width: '12px', 
                                        height: '12px', 
                                        borderRadius: '50%', 
                                        backgroundColor: getPriorityColor(task.priority),
                                        marginRight: '5px'
                                    }}></span>
                                    {task.priority}
                                </td>
                                <td>{task.date ? format(parseISO(task.date), 'MM/dd/yy h:mm a') : 'N/A'}</td>
                                <td>{task.deadline ? format(parseISO(task.deadline), 'MM/dd/yy') : 'N/A'}</td>
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
                            <td colSpan="9" style={{ textAlign: 'center' }}>No tasks found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* Task Dependencies Section */}
            <div className="task-dependencies-section" style={{ marginTop: '20px' }}>
                <div 
                    style={{ 
                        padding: '10px', 
                        backgroundColor: '#f0f0f0', 
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                    onClick={() => setShowDependencies(!showDependencies)}
                >
                    <h4>Task Dependencies</h4>
                    <span>{showDependencies ? '▲' : '▼'}</span>
                </div>
                {showDependencies && (
                    <div style={{ padding: '15px', border: '1px solid #ddd', borderTop: 'none' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <button 
                                className="action-btn"
                                style={{ marginRight: '10px' }}
                                onClick={() => setShowCriticalPath(!showCriticalPath)}
                            >
                                {showCriticalPath ? 'Hide Critical Path' : 'Show Critical Path'}
                            </button>
                            <button 
                                className="action-btn"
                                onClick={() => setShowAddDependencyModal(true)}
                            >
                                Add Dependency
                            </button>
                        </div>
                        {dependencyGraph.nodes.length > 0 || dependencyGraph.edges.length > 0 ? (
                            <TaskDependencyGraph 
                                nodes={dependencyGraph.nodes} 
                                edges={dependencyGraph.edges} 
                            />
                        ) : (
                            <p>No dependencies found.</p>
                        )}
                    </div>
                )}
            </div>
            
            {assignModalTask && (
                <AssignTaskModal 
                    task={assignModalTask}
                    onClose={() => setAssignModalTask(null)}
                    onTaskAssigned={handleTaskAssigned}
                />
            )}
            
            {showAutoAssignModal && (
                <AutoAssignModal 
                    onClose={() => setShowAutoAssignModal(false)}
                    onTasksAssigned={handleTaskAssigned}
                />
            )}
            
            {showAddDependencyModal && (
                <AddDependencyModal 
                    tasks={tasks}
                    onClose={() => setShowAddDependencyModal(false)}
                    onDependencyAdded={fetchDependencyGraph}
                />
            )}
        </div>
    );
};

export default TasksPage;