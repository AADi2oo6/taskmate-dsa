import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:8082/api/tasks';

const AddDependencyModal = ({ tasks, onClose, onDependencyAdded }) => {
    const [prerequisiteTaskId, setPrerequisiteTaskId] = useState('');
    const [dependentTaskId, setDependentTaskId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!prerequisiteTaskId || !dependentTaskId) {
            toast.error('Please select both tasks');
            return;
        }
        
        if (prerequisiteTaskId === dependentTaskId) {
            toast.error('Cannot create dependency to the same task');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/dependencies`, {
                prerequisiteTaskId: parseInt(prerequisiteTaskId),
                dependentTaskId: parseInt(dependentTaskId)
            });
            
            if (response.data.success) {
                toast.success('Dependency added successfully');
                onDependencyAdded();
                onClose();
            } else {
                toast.error(response.data.error || 'Failed to add dependency');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add dependency');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '400px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Add Task Dependency</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Prerequisite Task (Must be completed first):
                        </label>
                        <select
                            value={prerequisiteTaskId}
                            onChange={(e) => setPrerequisiteTaskId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                            required
                        >
                            <option value="">Select a task</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.id}: {task.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Dependent Task (Depends on the above):
                        </label>
                        <select
                            value={dependentTaskId}
                            onChange={(e) => setDependentTaskId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                            required
                        >
                            <option value="">Select a task</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.id}: {task.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="action-btn cancel-btn"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Dependency'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDependencyModal;