import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LeadsPage from './pages/LeadsPage';
import OrdersPage from './pages/OrdersPage';
import DashboardPage from './pages/DashboardPage';
import CreateOrderPage from './components/CreateOrderPage';
import CreateLead from './components/CreateLeads'; 
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-logo">
            <Link to="/" className="nav-logo-link">📦 TrackFlow</Link>
          </div>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/leads">Leads</Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/create-order" element={<CreateOrderPage />} />
            <Route path="/create-lead" element={<CreateLead />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
