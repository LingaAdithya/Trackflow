import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function OrderForm() {
  const [closedLeads, setClosedLeads] = useState([]);
  const [formData, setFormData] = useState({
    lead_id: '',
    status: 'Order Received',
    courier: '',
    tracking_number: '',
    dispatch_date: ''
  });

  useEffect(() => {
    const fetchClosedLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name')
        .eq('stage', 'Closed');

      if (error) alert('Error fetching closed leads: ' + error.message);
      else setClosedLeads(data);
    };

    fetchClosedLeads();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('orders').insert([formData]);
    if (error) alert('Error creating order: ' + error.message);
    else {
      alert('Order created!');
      setFormData({ lead_id: '', status: 'Order Received', courier: '', tracking_number: '', dispatch_date: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Order</h3>
      <select name="lead_id" value={formData.lead_id} onChange={handleChange} required>
        <option value="">Select Closed Lead</option>
        {closedLeads.map((lead) => (
          <option key={lead.id} value={lead.id}>{lead.name}</option>
        ))}
      </select>

      <input name="courier" value={formData.courier} onChange={handleChange} placeholder="Courier" />
      <input name="tracking_number" value={formData.tracking_number} onChange={handleChange} placeholder="Tracking Number" />
      <input type="date" name="dispatch_date" value={formData.dispatch_date} onChange={handleChange} />

      <button type="submit">Create Order</button>
    </form>
  );
}
