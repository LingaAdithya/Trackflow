import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [leadStats, setLeadStats] = useState({ total: 0, closed: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, dispatched: 0 });

  const navigate = useNavigate(); // for routing if you're using react-router

  useEffect(() => {
    fetchLeadStats();
    fetchOrderStats();
  }, []);

  const fetchLeadStats = async () => {
    const { data: allLeads } = await supabase.from('leads').select('id');
    const { data: closedLeads } = await supabase.from('leads').select('id').eq('stage', 'Closed');
    setLeadStats({ total: allLeads.length, closed: closedLeads.length });
  };

  const fetchOrderStats = async () => {
    const { data: allOrders } = await supabase.from('orders').select('id');
    const { data: dispatchedOrders } = await supabase.from('orders').select('id').eq('status', 'Dispatched');
    setOrderStats({ total: allOrders.length, dispatched: dispatchedOrders.length });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Dashboard</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <h4>Leads</h4>
          <p>Total: {leadStats.total}</p>
          <p>Closed: {leadStats.closed}</p>
        </div>

        <div style={cardStyle}>
          <h4>Orders</h4>
          <p>Total: {orderStats.total}</p>
          <p>Dispatched: {orderStats.dispatched}</p>
        </div>
      </div>

      <h3>🔗 Quick Links</h3>
      <div style={{ display: 'flex', gap: '15px' }}>
        <button onClick={() => navigate('/leads')}>📋 View Leads</button>
        <button onClick={() => navigate('/orders')}>🚚 View Orders</button>
        <button onClick={() => navigate('/')}>➕ Add Lead</button>
        <button onClick={() => navigate('/orders')}>➕ Add Order</button>
      </div>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #ccc',
  padding: '20px',
  borderRadius: '8px',
  minWidth: '150px',
  backgroundColor: '#f9f9f9',
};
