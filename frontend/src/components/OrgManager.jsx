import React, { useState, useEffect } from 'react';
import './OrgManager.css';

// Importing icons from the react-icons library
import { LuLayoutDashboard } from "react-icons/lu"; 
import { HiOutlineUsers } from "react-icons/hi2";
import { BsCheck2Square } from "react-icons/bs";
import { GoProjectSymlink } from "react-icons/go";
import { IoMoonOutline } from "react-icons/io5";

const OrgManager = () => {
  // State for the list of people
  const [people, setPeople] = useState([]);

  // UPDATED: State for the more complex form inputs
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [totalWorkHour, setTotalWorkHour] = useState('');

  // NEW: State to handle the "update" functionality
  const [isEditing, setIsEditing] = useState(false);
  const [currentPersonId, setCurrentPersonId] = useState(null);

  // Pre-defined roles for the dropdown menu
  const roles = ["Analyst", "Developer", "Manager", "QA Tester", "Designer", "System Administrator", "Project Manager", "Data Analyst", "UI/UX Designer"];

  // Fetch all people when the component first loads (no changes here)
  useEffect(() => {
    fetch('http://localhost:8080/api/people')
      .then(response => response.json())
      .then(data => setPeople(data))
      .catch(error => console.error('Error fetching people:', error));
  }, []);

  // NEW: Helper function to clear the form fields and reset the editing state
  const resetForm = () => {
    setName('');
    setRole('');
    setTotalWorkHour('');
    setIsEditing(false);
    setCurrentPersonId(null);
  };

  // REPLACED handleAddPerson with a more powerful handleSubmit for both Add and Update
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() || !role) return;

    const personData = { name, role, totalWorkHour: Number(totalWorkHour) };

    if (isEditing) {
      // UPDATE logic
      fetch(`http://localhost:8080/api/people/${currentPersonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      })
      .then(response => response.json())
      .then(updatedPerson => {
        setPeople(people.map(p => (p.id === updatedPerson.id ? updatedPerson : p)));
        resetForm();
      })
      .catch(error => console.error('Error updating person:', error));
    } else {
      // ADD logic
      fetch('http://localhost:8080/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      })
      .then(response => response.json())
      .then(newPerson => {
        setPeople([...people, newPerson]);
        resetForm();
      })
      .catch(error => console.error('Error adding person:', error));
    }
  };

  // NEW: Function to prepare the form for editing a person
  const handleEdit = (person) => {
    setIsEditing(true);
    setCurrentPersonId(person.id);
    setName(person.name);
    setRole(person.role);
    setTotalWorkHour(person.totalWorkHour);
  };

  // RENAMED handleDeletePerson to handleDelete for consistency
  const handleDelete = (id) => {
    fetch(`http://localhost:8080/api/people/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        setPeople(people.filter(person => person.id !== id));
      } else {
        console.error('Failed to delete person');
      }
    })
    .catch(error => console.error('Error deleting person:', error));
  };

  return (
    <div className="dashboard-container">
      {/* KEPT: The entire sidebar is preserved */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Org Manager</h1>
          <p>Work & resources</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#" className="nav-link active"><LuLayoutDashboard className="nav-icon" /> Dashboard <span className="shortcut">Ctrl+1</span></a></li>
            <li><a href="#" className="nav-link"><HiOutlineUsers className="nav-icon" /> People <span className="shortcut">Ctrl+2</span></a></li>
            <li><a href="#" className="nav-link"><BsCheck2Square className="nav-icon" /> Tasks <span className="shortcut">Ctrl+3</span></a></li>
            <li><a href="#" className="nav-link"><GoProjectSymlink className="nav-icon" /> Resources <span className="shortcut">Ctrl+4</span></a></li>
          </ul>
        </nav>
        
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* KEPT: The main header is preserved */}
        <header className="main-header">
          <h1>Org Manager</h1>
          <p>Manage people, tasks, and resources</p>
        </header>

        {/* KEPT: The statistics cards are preserved and will update the count correctly */}
        <div className="stats-grid">
          <div className="card stat-card">
            <p>People</p>
            <span>{people.length}</span>
          </div>
          <div className="card stat-card"><p>Tasks</p><span>0</span></div>
          <div className="card stat-card"><p>Resources</p><span>0</span></div>
          <div className="card stat-card"><p>Conflicts</p><span>0</span></div>
        </div>
        
        {/* REPLACED the old management section with the new, more powerful one */}
        <div className="card" style={{marginTop: '32px'}}>
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

            <h2 style={{marginTop: '40px'}}>Current Team</h2>
            
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
                    {people.map(person => (
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
                    ))}
                </tbody>
            </table>
        </div>
      </main>
    </div>
  );
};

export default OrgManager;