import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './OrgManager.css';
import TasksPage from '../task/TasksPage';
import ResourceManager from '../resource/ResourceManager'; // Import the new resource manager component
import TeamsPage from '../team/TeamsPage';
import OrgHierarchyTree from '../common/OrgHierarchyTree'; // Import the hierarchy component
import TeamDetailPage from '../team/TeamDetailPage'; // Import the new detail page

// Importing icons from the react-icons library
import { LuLayoutDashboard } from "react-icons/lu";
import { GrResources } from "react-icons/gr";
import { FaUsers } from 'react-icons/fa';
import { HiOutlineUsers } from "react-icons/hi2";
import { BsCheck2Square } from "react-icons/bs";
import { FaSitemap } from "react-icons/fa"; // New icon for hierarchy
import { IoMoonOutline } from "react-icons/io5";

const API_URL = 'http://localhost:8082/api/people';

const OrgManager = () => {
    // State for the list of people
    const [people, setPeople] = useState([]);

    // State for the list of managers (for dropdown)
    // State for the form inputs
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [totalWorkHour, setTotalWorkHour] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [managerId, setManagerId] = useState(''); // New state for manager selection
    // State for searching
    const [minHours, setMinHours] = useState('');
    const [maxHours, setMaxHours] = useState('');

    // State for undo/redo availability
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Get the current page from the URL to highlight the active link
    const location = useLocation();
    const currentPage = location.pathname.substring(1) || 'dashboard'; // Default to 'dashboard'

    // State for summary counts
    const [taskCount, setTaskCount] = useState(0);
    const [teamCount, setTeamCount] = useState(0);

    useEffect(() => {
        fetchPeople(); // Fetch people once on initial load for the 'Add Person' manager dropdown
        
        // Poll for undo/redo availability every 2 seconds
        const interval = setInterval(() => {
            checkUndoRedoAvailability();
        }, 2000);
        
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const fetchPeople = async () => {
        try {
            const response = await axios.get(API_URL);
            setPeople(response.data);
        } catch (error) {
            toast.error('Failed to fetch people.');
            console.error('There was an error fetching the people!', error);
        }
    };

    const checkUndoRedoAvailability = async () => {
        try {
            const undoResponse = await axios.get(`${API_URL}/can-undo`);
            const redoResponse = await axios.get(`${API_URL}/can-redo`);
            setCanUndo(undoResponse.data.canUndo);
            setCanRedo(redoResponse.data.canRedo);
        } catch (error) {
            console.error('Error checking undo/redo availability:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name.trim() || !role || totalWorkHour === '') {
            toast.error('Please fill in all fields.');
            return;
        }
        const personData = { 
            name, 
            role, 
            totalWorkHour: Number(totalWorkHour),
            managerId: managerId ? Number(managerId) : null
        };

        try {
            if (isEditing) {
                const response = await axios.put(`${API_URL}/${currentId}`, personData, { headers: { 'Content-Type': 'application/json' } });
                // Replace the old person with the updated one in the state
                setPeople(people.map(p => p.id === currentId ? response.data : p));
                toast.success('Person updated successfully!');
            } else {
                const response = await axios.post(API_URL, personData, { headers: { 'Content-Type': 'application/json' } });
                // Add the new person to the existing state
                setPeople([...people, response.data]);
                toast.success('Person added successfully!');
            }
            resetForm();
            // Check undo/redo availability after operation
            await checkUndoRedoAvailability();
            // We no longer need fetchPeople() here as we are updating the state directly
            // fetchPeople(); 
        } catch (error) {
            // Enhanced error handling to display specific backend messages
            const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} person.`;
            toast.error(errorMessage);
            
            console.error(`Error ${isEditing ? 'updating' : 'adding'} person:`, {
                message: error.message,
                responseData: error.response?.data,
                status: error.response?.status
            });
        }
    };

    const handleRangeSearch = async () => {
        if (!minHours || !maxHours) {
            toast.error("Please enter both a minimum and maximum hour value.");
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/search-by-hours?min=${minHours}&max=${maxHours}`);
            setPeople(response.data);
            toast.success("Search results loaded.");
        } catch (error) {
            toast.error("Failed to search.");
            console.error('Error fetching filtered people:', error);
        }
    };

    const handleSortByHours = async () => {
        try {
            const response = await axios.get(`${API_URL}/sorted-by-hours`);
            setPeople(response.data);
            toast.success("People sorted by work hours.");
        } catch (error) {
            toast.error("Failed to sort.");
            console.error('Error fetching sorted people:', error);
        }
    };

    const handleReset = () => {
        fetchPeople();
        setMinHours('');
        setMaxHours('');
        toast.info("View reset.");
    };

    const resetForm = () => {
        setName('');
        setRole('');
        setTotalWorkHour('');
        setManagerId(''); // Reset managerId
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (person) => {
        setIsEditing(true);
        setCurrentId(person.id);
        setName(person.name);
        setRole(person.role);
        setTotalWorkHour(person.totalWorkHour);
        setManagerId(person.managerId ?? ''); // Coalesce null/undefined to an empty string for the select input
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchPeople();
            toast.success('Person deleted successfully!');
            // Check undo/redo availability after operation
            await checkUndoRedoAvailability();
        } catch (error) {
            toast.error('Failed to delete person.');
            console.error('Error deleting person:', error);
        }
    };

    const handleUndo = async () => {
        try {
            const response = await axios.post(`${API_URL}/undo`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchPeople(); // Refresh the people list
            } else {
                toast.info(response.data.message);
            }
            // Check undo/redo availability after operation
            await checkUndoRedoAvailability();
        } catch (error) {
            toast.error('Failed to undo operation.');
            console.error('Error undoing operation:', error);
        }
    };

    const handleRedo = async () => {
        try {
            const response = await axios.post(`${API_URL}/redo`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchPeople(); // Refresh the people list
            } else {
                toast.info(response.data.message);
            }
            // Check undo/redo availability after operation
            await checkUndoRedoAvailability();
        } catch (error) {
            toast.error('Failed to redo operation.');
            console.error('Error redoing operation:', error);
        }
    };

    const roles = ["Analyst", "Developer", "Manager", "QA Tester", "Designer", "System Administrator", "Project Manager", "Data Analyst", "UI/UX Designer"];

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>Org Manager</h1>
                    <p>Work & resources</p>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><Link to="/dashboard" className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}><LuLayoutDashboard className="nav-icon" /> Dashboard</Link></li>
                        <li><Link to="/people" className={`nav-link ${currentPage === 'people' ? 'active' : ''}`}><HiOutlineUsers className="nav-icon" /> People</Link></li>
                        <li><Link to="/teams" className={`nav-link ${currentPage === 'teams' ? 'active' : ''}`}><FaUsers className="nav-icon" /> Teams</Link></li>
                        <li><Link to="/tasks" className={`nav-link ${currentPage === 'tasks' ? 'active' : ''}`}><BsCheck2Square className="nav-icon" /> Tasks</Link></li>
                        <li><Link to="/hierarchy" className={`nav-link ${currentPage === 'hierarchy' ? 'active' : ''}`}><FaSitemap className="nav-icon" /> Hierarchy</Link></li>
                        <li><Link to="/resourcemanage" className={`nav-link ${currentPage === 'resourcemanage' ? 'active' : ''}`}><GrResources className="nav-icon" /> Resources</Link></li>
                    </ul>
                </nav>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h1>Org Manager</h1>
                    <p>Manage people, tasks, and resources</p>
                </header>

                <div className="new-stats-grid">
                    <Link to="/people" className="new-stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                            <HiOutlineUsers />
                        </div>
                        <p className="stat-label">Total People</p>
                        <p className="stat-value">{people.length}</p>
                    </Link>
                    <Link to="/tasks" className="new-stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                            <BsCheck2Square />
                        </div>
                        <p className="stat-label">Active Tasks</p>
                        <p className="stat-value">{taskCount}</p>
                    </Link>
                    <Link to="/teams" className="new-stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}>
                            <FaUsers />
                        </div>
                        <p className="stat-label">Active Teams</p>
                        <p className="stat-value">{teamCount}</p>
                    </Link>
                </div>

                {/* --- Routing Logic --- */}
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={
                        <div className="card" style={{ marginTop: '32px' }}>
                            <h2>Welcome to the Dashboard</h2>
                            <p>Select a page from the sidebar to get started.</p>
                        </div>
                    } />
                    <Route path="/people" element={
                    <>
                        <div className="card" style={{ marginTop: '32px' }}>
                            <h2>{isEditing ? 'Update Person' : 'Add New Person'}</h2>
                            <form onSubmit={handleSubmit} className="person-form">
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
                                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                                    <option value="" disabled>Select a Role</option>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <select value={managerId} onChange={(e) => setManagerId(e.target.value)} title="Select this person's manager">
                                    <option value="">Select Manager (Optional)</option>
                                    {people.filter(p => p.id !== currentId).map(p => ( // Cannot be own manager
                                        <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                    ))}
                                </select>

                                <input type="number" value={totalWorkHour} onChange={(e) => setTotalWorkHour(e.target.value)} placeholder="Total Working Hours" required />
                                <button type="submit">{isEditing ? 'Update' : 'Add Person'}</button>
                                {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>}
                            </form>
                        </div>

                        <div className="search-container card" style={{ marginTop: '32px' }}>
                            <h3>Search by Work Hour Range</h3>
                            <div className="search-form">
                                <input
                                    type="number"
                                    value={minHours}
                                    onChange={e => setMinHours(e.target.value)}
                                    placeholder="Min Hours"
                                />
                                <input
                                    type="number"
                                    value={maxHours}
                                    onChange={e => setMaxHours(e.target.value)}
                                    placeholder="Max Hours"
                                />
                                <button onClick={handleRangeSearch} className="action-btn sort-btn">Search</button>
                            </div>
                        </div>

                        <div className="table-header">
                            <h2 style={{ margin: 0 }}>Current Team</h2>
                            <div>
                                <button onClick={handleUndo} className="action-btn sort-btn" disabled={!canUndo}>Undo</button>
                                <button onClick={handleRedo} className="action-btn sort-btn" disabled={!canRedo}>Redo</button>
                                <button onClick={handleSortByHours} className="action-btn sort-btn">Sort by Work Hours</button>
                                <button onClick={handleReset} className="action-btn cancel-btn">Reset View</button>
                            </div>
                        </div>

                        <table className="people-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    {/* New column */}
                                    <th>Manager ID</th>
                                    <th>Total Working Hours</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {people.length > 0 ? (
                                    people.map(person => (
                                        <tr key={person.id}>
                                            <td>{person.id}</td>
                                            <td>{person.name}</td>
                                            <td>{person.role}</td>
                                            <td>{person.managerId || 'N/A'}</td> {/* Display manager ID */}
                                            <td>{person.totalWorkHour}</td>
                                            <td>
                                                <button onClick={() => handleEdit(person)} className="action-btn edit-btn">Update</button>
                                                <button onClick={() => handleDelete(person.id)} className="action-btn delete-btn">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>No people found.</td> {/* Adjusted colspan */}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                    } />
                    <Route path="/teams" element={<TeamsPage setTeamCount={setTeamCount} />} />
                    <Route path="/tasks" element={<TasksPage setTaskCount={setTaskCount} />} />
                    <Route path="/hierarchy" element={<OrgHierarchyTree setTeamCount={setTeamCount} />} />
                    <Route path="/team/:teamId" element={<TeamDetailPage />} />
                    <Route path="/team/:teamId" element={<TeamDetailPage />} /> {/* Ensure this route exists */}
                    <Route path="/resourcemanage" element={<ResourceManager />} />
                </Routes>
            </main>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default OrgManager;