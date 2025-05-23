import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreateOrderPage() {
  const [eligibleLeads, setEligibleLeads] = useState([]);
  const [newOrder, setNewOrder] = useState({
    status: 'Order Received',
    courier: '',
    tracking_number: '',
    dispatch_date: '',
    lead_id: ''
  });
  const navigate = useNavigate();

  const fetchEligibleLeads = async () => {
    const { data: orderedLeads } = await supabase.from('orders').select('lead_id');
    const usedLeadIds = orderedLeads?.map((o) => o.lead_id) ?? [];

    const { data } = await supabase
      .from('leads')
      .select('id, name')
      .eq('stage', 'Won')
      .not('id', 'in', `(${usedLeadIds.join(',') || 0})`);

    setEligibleLeads(data || []);
  };

  useEffect(() => {
    fetchEligibleLeads();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('orders').insert([newOrder]);
    if (!error) {
      navigate('/orders');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6 font-sans">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          Create New Order
        </h3>
        <form onSubmit={handleCreateOrder} className="bg-gray-100 p-6 rounded-xl flex flex-wrap gap-4">
          <select
            className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg"
            required
            value={newOrder.lead_id}
            onChange={(e) => setNewOrder({ ...newOrder, lead_id: e.target.value })}
          >
            <option value="">Select Lead</option>
            {eligibleLeads.map(lead => (
              <option key={lead.id} value={lead.id}>{lead.name}</option>
            ))}
          </select>
          <input
            className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg"
            placeholder="Courier"
            value={newOrder.courier}
            onChange={(e) => setNewOrder({ ...newOrder, courier: e.target.value })}
          />
          <input
            className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg"
            placeholder="Tracking Number"
            value={newOrder.tracking_number}
            onChange={(e) => setNewOrder({ ...newOrder, tracking_number: e.target.value })}
          />
          <input
            type="date"
            className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg"
            value={newOrder.dispatch_date}
            onChange={(e) => setNewOrder({ ...newOrder, dispatch_date: e.target.value })}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-save mr-2"></i>Save Order
          </button>
        </form>
      </div>
    </div>
  );
}
