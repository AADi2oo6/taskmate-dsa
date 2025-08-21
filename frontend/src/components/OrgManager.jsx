import React from 'react';
import './OrgManager.css';

// Importing icons from the react-icons library
import { LuLayoutDashboard } from "react-icons/lu";

import { AiOutlineDashboard } from "react-icons/ai";
import { BsCheck2Square } from "react-icons/bs";
import { GoProjectSymlink } from "react-icons/go";
import { IoMoonOutline } from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi";

const OrgManager = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Org Manager</h1>
          <p>Work & resources</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="#" className="nav-link active">
                <LuLayoutDashboard className="nav-icon" />
                Dashboard
                <span className="shortcut">Ctrl+1</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <HiOutlineUsers className="nav-icon" />
                People
                <span className="shortcut">Ctrl+2</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <BsCheck2Square className="nav-icon" />
                Tasks
                <span className="shortcut">Ctrl+3</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <GoProjectSymlink className="nav-icon" />
                Resources
                <span className="shortcut">Ctrl+4</span>
              </a>
            </li>
          </ul>
        </nav>
        
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="main-header">
          <h1>Org Manager</h1>
          <p>Manage people, tasks, and resources</p>
        </header>

        <div className="stats-grid">
          <div className="card stat-card">
            <p>People</p>
            <span>0</span>
          </div>
          <div className="card stat-card">
            <p>Tasks</p>
            <span>0</span>
          </div>
          <div className="card stat-card">
            <p>Resources</p>
            <span>0</span>
          </div>
          <div className="card stat-card">
            <p>Conflicts</p>
            <span>0</span>
          </div>
        </div>

        <div className="charts-grid">
          <div className="card chart-placeholder">
            <h2>Tasks per Person</h2>
            <p>Add people and tasks to see a chart</p>
          </div>
          <div className="card chart-placeholder">
            <h2>Tasks per Resource</h2>
            <p>Add resources and tasks to see a chart</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgManager;