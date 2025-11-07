import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PersonService from '../person/PersonService';

const API_URL = 'http://localhost:8082/api/tasks';

const AutoAssignModal = ({ onClose, onTasksAssigned }) => {
    const [strategy, setStrategy] = useState('ROUND_ROBIN');
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [taskLimit, setTaskLimit] = useState(0);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchAvailableMembers();
    }, []);

    const fetchAvailableMembers = async () => {
        setLoading(true);
        try {
            const persons = await PersonService.getAllPersons();
            // Get task counts for each person
            const statsResponse = await axios.get(`${API_URL}/assignment-stats`);
            const stats = statsResponse.data;
            
            const membersWithStats = persons.map(person => ({
                id: person.id,
                name: person.name,
                tasks: stats[person.id] ? stats[person.id].tasks : 0
            }));
            
            setMembers(membersWithStats);
            // Initially select all members
            setSelectedMembers(membersWithStats.map(member => member.id));
        } catch (error) {
            toast.error('Failed to fetch members.');
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMemberToggle = (memberId) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== memberId));
        } else {
            setSelectedMembers([...selectedMembers, memberId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            // Deselect all
            setSelectedMembers([]);
        } else {
            // Select all
            setSelectedMembers(members.map(member => member.id));
        }
    };

    const handleAssign = async () => {
        if (selectedMembers.length === 0) {
            toast.error('Please select at least one member.');
            return;
        }

        setAssigning(true);
        setProgress(0);

        try {
            const requestData = {
                strategy: strategy,
                memberIds: selectedMembers,
                taskLimit: taskLimit > 0 ? taskLimit : 0 // 0 means assign all
            };

            const response = await axios.post(`${API_URL}/auto-assign`, requestData);
            
            if (response.data.success) {
                toast.success(response.data.message);
                onTasksAssigned();
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to assign tasks.');
            }
        } catch (error) {
            toast.error('Failed to assign tasks.');
            console.error('Error assigning tasks:', error);
        } finally {
            setAssigning(false);
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
                width: '500px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Fair Task Distribution</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }}>&times;</button>
                </div>

                {/* Strategy Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <h4>Assignment Strategy</h4>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                value="ROUND_ROBIN"
                                checked={strategy === 'ROUND_ROBIN'}
                                onChange={(e) => setStrategy(e.target.value)}
                                style={{ marginRight: '8px' }}
                            />
                            Round Robin (rotate through members equally)
                        </label>
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                value="BY_SKILL_MATCH"
                                checked={strategy === 'BY_SKILL_MATCH'}
                                onChange={(e) => setStrategy(e.target.value)}
                                style={{ marginRight: '8px' }}
                            />
                            By Skill Match (assign to members with matching skills)
                        </label>
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                value="BY_WORKLOAD"
                                checked={strategy === 'BY_WORKLOAD'}
                                onChange={(e) => setStrategy(e.target.value)}
                                style={{ marginRight: '8px' }}
                            />
                            By Workload (assign to least busy member)
                        </label>
                    </div>
                </div>

                {/* Member Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4>Select Team Members</h4>
                        <button 
                            onClick={handleSelectAll}
                            className="action-btn"
                            style={{ fontSize: '14px' }}
                        >
                            {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    {loading ? (
                        <p>Loading members...</p>
                    ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                            {members.map(member => (
                                <label key={member.id} style={{ display: 'block', marginBottom: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(member.id)}
                                        onChange={() => handleMemberToggle(member.id)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    {member.name} ({member.tasks} tasks)
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Task Limit */}
                <div style={{ marginBottom: '20px' }}>
                    <h4>Tasks to Assign</h4>
                    <input
                        type="number"
                        min="0"
                        value={taskLimit}
                        onChange={(e) => setTaskLimit(parseInt(e.target.value) || 0)}
                        placeholder="All unassigned tasks"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    <small>Leave blank or 0 to assign all unassigned tasks</small>
                </div>

                {/* Progress Bar */}
                {assigning && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ 
                            height: '20px', 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: '10px', 
                            overflow: 'hidden'
                        }}>
                            <div style={{ 
                                height: '100%', 
                                backgroundColor: '#007bff', 
                                width: `${progress}%`,
                                transition: 'width 0.3s'
                            }}></div>
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '5px' }}>
                            Assigning tasks...
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                        onClick={onClose} 
                        className="action-btn cancel-btn"
                        disabled={assigning}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAssign} 
                        className="primary-button"
                        disabled={assigning || selectedMembers.length === 0}
                        style={{ backgroundColor: '#007bff' }}
                    >
                        {assigning ? 'Assigning...' : 'Start Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoAssignModal;