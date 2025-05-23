import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [leadStats, setLeadStats] = useState({ total: 0, closed: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, dispatched: 0 });
  const [upcomingFollowups, setUpcomingFollowups] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLeadStats();
    fetchOrderStats();
    fetchUpcomingFollowups();
  }, []);

  const fetchLeadStats = async () => {
    const { data: allLeads } = await supabase.from('leads').select('id');
    const { data: closedLeads } = await supabase.from('leads').select('id').eq('stage', 'Closed');
    setLeadStats({ total: allLeads?.length || 0, closed: closedLeads?.length || 0 });
  };

  const fetchOrderStats = async () => {
    const { data: allOrders } = await supabase.from('orders').select('id');
    const { data: dispatchedOrders } = await supabase.from('orders').select('id').eq('status', 'Dispatched');
    setOrderStats({ total: allOrders?.length || 0, dispatched: dispatchedOrders?.length || 0 });
  };

  const fetchUpcomingFollowups = async () => {
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const { data } = await supabase
      .from('leads')
      .select('id, name, followup_date')
      .gte('followup_date', today)
      .order('followup_date', { ascending: true })
      .limit(5);

    setUpcomingFollowups(data || []);
  };

  const barData = {
    labels: ['Leads', 'Closed Leads', 'Orders', 'Dispatched Orders'],
    datasets: [
      {
        label: 'Count',
        data: [leadStats.total, leadStats.closed, orderStats.total, orderStats.dispatched],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Lead and Order Statistics',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">📊 Dashboard</h2>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Leads</h4>
          <p>Total: {leadStats.total}</p>
          <p>Closed: {leadStats.closed}</p>
        </div>

        <div className="stat-card">
          <h4>Orders</h4>
          <p>Total: {orderStats.total}</p>
          <p>Dispatched: {orderStats.dispatched}</p>
        </div>
      </div>

      <Bar data={barData} options={barOptions} />

      <div className="followup-section">
        <h3>⏰ Upcoming Follow-ups</h3>
        {upcomingFollowups.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No upcoming follow-ups</p>
        ) : (
          <ul className="followup-list">
            {upcomingFollowups.map((lead) => (
              <li key={lead.id}>
                {lead.name} — {lead.followup_date}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="quick-links">
        <button onClick={() => navigate('/leads')}>📋 View Leads</button>
        <button onClick={() => navigate('/orders')}>🚚 View Orders</button>
        <button onClick={() => navigate('/create-lead')}>➕ Add Lead</button>
        <button onClick={() => navigate('/create-order')}>➕ Add Order</button>
      </div>
    </div>
  );
}
