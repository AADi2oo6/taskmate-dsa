import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './OrgManager.css';
import TasksPage from './TasksPage';

// Importing icons from the react-icons library
import { LuLayoutDashboard } from "react-icons/lu";
import { HiOutlineUsers } from "react-icons/hi2";
import { BsCheck2Square } from "react-icons/bs";
import { GoProjectSymlink } from "react-icons/go";
import { IoMoonOutline } from "react-icons/io5";

const API_URL = 'http://localhost:8080/api/people';

const OrgManager = () => {
    // State for the list of people
    const [people, setPeople] = useState([]);

    // State for the form inputs
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [totalWorkHour, setTotalWorkHour] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // State for searching
    const [minHours, setMinHours] = useState('');
    const [maxHours, setMaxHours] = useState('');

    // State to track the active page
    const [currentPage, setCurrentPage] = useState('people');

    // State for task count
    const [taskCount, setTaskCount] = useState(0);

    useEffect(() => {
        if (currentPage === 'people') {
            fetchPeople();
        }
    }, [currentPage]);

    const fetchPeople = async () => {
        try {
            const response = await axios.get(API_URL);
            setPeople(response.data);
        } catch (error) {
            toast.error('Failed to fetch people.');
            console.error('There was an error fetching the people!', error);
        }
    };

    // NEW: Undo and Redo functions
    const handleUndo = async () => {
        try {
            await axios.post(`${API_URL}/undo`);
            fetchPeople();
            toast.info('Undo successful!');
        } catch (error) {
            toast.error('Nothing to undo.');
            console.error('Undo failed:', error);
        }
    };

    const handleRedo = async () => {
        try {
            await axios.post(`${API_URL}/redo`);
            fetchPeople();
            toast.info('Redo successful!');
        } catch (error) {
            toast.error('Nothing to redo.');
            console.error('Redo failed:', error);
        }
    };
    // END NEW

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name.trim() || !role || totalWorkHour === '') {
            toast.error('Please fill in all fields.');
            return;
        }
        const personData = { name, role, totalWorkHour: Number(totalWorkHour) };

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${currentId}`, personData);
                toast.success('Person updated successfully!');
            } else {
                await axios.post(API_URL, personData);
                toast.success('Person added successfully!');
            }
            fetchPeople();
            resetForm();
        } catch (error) {
            toast.error(`Failed to ${isEditing ? 'update' : 'add'} person.`);
            console.error(`Error ${isEditing ? 'updating' : 'adding'} person:`, error);
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
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (person) => {
        setIsEditing(true);
        setCurrentId(person.id);
        setName(person.name);
        setRole(person.role);
        setTotalWorkHour(person.totalWorkHour);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchPeople();
            toast.success('Person deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete person.');
            console.error('Error deleting person:', error);
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
                        <li><a href="#" className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}><LuLayoutDashboard className="nav-icon" /> Dashboard <span className="shortcut">Ctrl+1</span></a></li>
                        <li><a href="#" className={`nav-link ${currentPage === 'people' ? 'active' : ''}`} onClick={() => setCurrentPage('people')}><HiOutlineUsers className="nav-icon" /> People <span className="shortcut">Ctrl+2</span></a></li>
                        <li><a href="#" className={`nav-link ${currentPage === 'tasks' ? 'active' : ''}`} onClick={() => setCurrentPage('tasks')}><BsCheck2Square className="nav-icon" /> Tasks <span className="shortcut">Ctrl+3</span></a></li>
                        <li><a href="#" className={`nav-link ${currentPage === 'resources' ? 'active' : ''}`} onClick={() => setCurrentPage('resources')}><GoProjectSymlink className="nav-icon" /> Resources <span className="shortcut">Ctrl+4</span></a></li>
                    </ul>
                </nav>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h1>Org Manager</h1>
                    <p>Manage people, tasks, and resources</p>
                </header>

                <div className="stats-grid">
                    <div className="card stat-card">
                        <p>People</p>
                        <span>{people.length}</span>
                    </div>
                    <div className="card stat-card">
                        <p>Tasks</p>
                        <span>{taskCount}</span>
                    </div>
                    <div className="card stat-card"><p>Resources</p><span>0</span></div>
                    <div className="card stat-card"><p>Conflicts</p><span>0</span></div>
                </div>

                {/* Conditional Rendering based on currentPage state */}
                {currentPage === 'people' && (
                    <>
                        <div className="card" style={{ marginTop: '32px' }}>
                            <h2>{isEditing ? 'Update Person' : 'Add New Person'}</h2>
                            <form onSubmit={handleSubmit} className="person-form">
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
                                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                                    <option value="" disabled>Select a Role</option>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
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
                                <button onClick={handleUndo} className="action-btn">Undo</button>
                                <button onClick={handleRedo} className="action-btn">Redo</button>
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
                                            <td>{person.totalWorkHour}</td>
                                            <td>
                                                <button onClick={() => handleEdit(person)} className="action-btn edit-btn">Update</button>
                                                <button onClick={() => handleDelete(person.id)} className="action-btn delete-btn">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No people found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                )}

                {/* The TasksPage component is rendered when currentPage is 'tasks' */}
                {currentPage === 'tasks' && <TasksPage setTaskCount={setTaskCount} />}
            </main>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default OrgManager;