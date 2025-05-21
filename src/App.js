import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LeadsPage from './pages/LeadsPage';
import OrdersPage from './pages/OrdersPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Leads</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<LeadsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
