import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import OrgManager from './components/person/OrgManager'; // This is your main App component
import './index.css'; // Your global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <OrgManager />
    </BrowserRouter>
  </React.StrictMode>
);