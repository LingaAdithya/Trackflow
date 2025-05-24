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
  const usedLeadIds = orderedLeads?.map((o) => Number(o.lead_id)).filter(Boolean) ?? [];

  const { data, error } = await supabase
    .from('leads')
    .select('id, name')
    .eq('stage', 'Won')

  if (error) {
    console.error("Error fetching eligible leads:", error.message);
  } else {
    console.log("Eligible leads:", data);
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg max-w-3xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <i className="fas fa-box-open mr-2 text-blue-500"></i> Create New Order
        </h3>
        <form
          onSubmit={handleCreateOrder}
          className="bg-gray-100 p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row sm:flex-wrap gap-4"
        >
          <select
            className="flex-1 w-full sm:min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex-1 w-full sm:min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Courier"
            value={newOrder.courier}
            onChange={(e) => setNewOrder({ ...newOrder, courier: e.target.value })}
          />
          <input
            className="flex-1 w-full sm:min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tracking Number"
            value={newOrder.tracking_number}
            onChange={(e) => setNewOrder({ ...newOrder, tracking_number: e.target.value })}
          />
          <input
            type="date"
            className="flex-1 w-full sm:min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newOrder.dispatch_date}
            onChange={(e) => setNewOrder({ ...newOrder, dispatch_date: e.target.value })}
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            <i className="fas fa-save mr-2"></i> Save Order
          </button>
          <p className="text-sm text-gray-500 mt-2">
  Eligible leads: {eligibleLeads.length}
</p>

        </form>
      </div>
    </div>
  );
}