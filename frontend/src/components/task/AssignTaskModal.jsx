import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../team/TeamModal.css'; // Reusing modal styles for consistency

const PEOPLE_API_URL = 'http://localhost:8082/api/people';
const TASKS_API_URL = 'http://localhost:8082/api/tasks';

const AssignTaskModal = ({ task, onClose, onTaskAssigned }) => {
    const [eligiblePeople, setEligiblePeople] = useState([]);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndFilterPeople = async () => {
            if (!task) return;

            try {
                setIsLoading(true);
                const response = await axios.get(PEOPLE_API_URL);
                const allPeople = response.data;

                // This is the critical data structure processing logic
                const filtered = allPeople.filter(person => person.role === task.targetRole);

                setEligiblePeople(filtered);
            } catch (error) {
                toast.error("Failed to fetch people for assignment.");
                console.error("Error fetching people:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndFilterPeople();
    }, [task]);

    const handleConfirmAssignment = async () => {
        if (!selectedPersonId) {
            toast.warn("Please select a person to assign the task to.");
            return;
        }

        try {
            await axios.put(`${TASKS_API_URL}/${task.id}/assign`, {
                personId: selectedPersonId
            });
            toast.success(`Task "${task.description}" assigned successfully!`);
            onTaskAssigned(); // Notify parent to refresh the task list
            onClose(); // Close the modal
        } catch (error) {
            toast.error("Failed to assign task.");
            console.error("Error assigning task:", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 style={{ margin: 0 }}>Assign Task: {task.description}</h2>
                </div>

                <div className="modal-body">
                    <p style={{ marginTop: 0 }}>Select a person with the role: <strong>{task.targetRole}</strong></p>
                    {isLoading ? (
                        <p>Loading eligible people...</p>
                    ) : (
                        <div className="assignment-list">
                            {eligiblePeople.length > 0 ? (
                                eligiblePeople.map(person => (
                                    <label key={person.id} className="assignment-option">
                                        <input
                                            type="radio"
                                            name="person"
                                            value={person.id}
                                            checked={selectedPersonId === person.id}
                                            onChange={() => setSelectedPersonId(person.id)}
                                        />
                                        <span className="person-name">{person.name}</span>
                                        <span className="person-role">{person.role}</span>
                                    </label>
                                ))
                            ) : (
                                <p>No available people found with the required role.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="action-btn cancel-btn" onClick={onClose}>Cancel</button>
                    <button 
                        className="action-btn sort-btn" 
                        onClick={handleConfirmAssignment}
                        disabled={!selectedPersonId || isLoading}
                    >
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTaskModal;