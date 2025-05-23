// Imports
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';

const statusOptions = ['Order Received', 'In Development', 'Ready to Dispatch', 'Dispatched'];
const statusColors = {
  'Order Received': 'bg-gray-200 text-gray-800',
  'In Development': 'bg-blue-200 text-blue-800',
  'Ready to Dispatch': 'bg-yellow-200 text-yellow-800',
  'Dispatched': 'bg-green-200 text-green-800',
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [eligibleLeads, setEligibleLeads] = useState([]);
  const [newOrder, setNewOrder] = useState({
    status: 'Order Received',
    courier: '',
    tracking_number: '',
    dispatch_date: '',
    lead_id: ''
  });
  const [statusEdits, setStatusEdits] = useState({});
  const [filters, setFilters] = useState({ status: '', search: '', sort: '' });

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, courier, tracking_number, dispatch_date, lead_id, leads(name, product, price, quantity, email)')
      .order('dispatch_date', { ascending: false });

    if (!error) setOrders(data);
  };

  const fetchEligibleLeads = async () => {
    const { data: orderedLeads } = await supabase.from('orders').select('lead_id');
    const usedLeadIds = orderedLeads?.map((o) => o.lead_id) ?? [];

    const { data, error } = await supabase
      .from('leads')
      .select('id, name')
      .eq('stage', 'Won')
      .not('id', 'in', `(${usedLeadIds.join(',') || 0})`);

    if (!error) setEligibleLeads(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchEligibleLeads();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleStatusChange = (id, newStatus) => {
    setStatusEdits(prev => ({ ...prev, [id]: newStatus }));
  };

  const confirmStatusChange = async (id) => {
    const newStatus = statusEdits[id];

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setStatusEdits(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      fetchOrders();

    }
  };

  const downloadReceipt = (order) => {
  const { leads } = order;
  const doc = new jsPDF();
  doc.text(`Receipt for ${leads.name}`, 10, 10);
  doc.text(`Product: ${leads.product}`, 10, 20);
  doc.text(`Price: Rs.${parseFloat(leads.price).toFixed(2)}`, 10, 30);
  doc.text(`Quantity: ${leads.quantity}`, 10, 40);
  doc.text(`Amount: Rs.${(parseFloat(leads.price) * parseFloat(leads.quantity)).toFixed(2)}`, 10, 50);
  doc.save(`Receipt_${leads.name}.pdf`);
};



  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('orders').insert([newOrder]);
    if (!error) {
      setShowForm(false);
      setNewOrder({ status: 'Order Received', courier: '', tracking_number: '', dispatch_date: '', lead_id: '' });
      fetchOrders();
      fetchEligibleLeads();
    }
  };

  const filteredSortedOrders = orders
    .filter(order =>
      (!filters.status || order.status === filters.status) &&
      (!filters.search || order.leads?.name.toLowerCase().includes(filters.search.toLowerCase()))
    )
    .sort((a, b) => {
      if (filters.sort === 'name') return a.leads?.name.localeCompare(b.leads?.name);
      if (filters.sort === 'date') return new Date(b.dispatch_date) - new Date(a.dispatch_date);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6 font-sans">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-box-open mr-2 text-blue-500"></i>Orders
          </h3>
          <button
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={() => setShowForm(prev => !prev)}
          >
            <i className="fas fa-plus mr-2"></i>
            {showForm ? 'Cancel' : 'Create Order'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            className="p-2 border border-gray-300 rounded-lg w-48"
            placeholder="Search by name"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="p-2 border border-gray-300 rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Filter by Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            className="p-2 border border-gray-300 rounded-lg"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="date">Dispatch Date</option>
          </select>
        </div>

        {/* Add Order Form */}
        {showForm && (
          <form onSubmit={handleCreateOrder} className="bg-gray-100 p-6 rounded-xl mb-6 flex flex-wrap gap-4">
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
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i className="fas fa-save mr-2"></i>Save
            </button>
          </form>
        )}

        {/* Orders List */}
        {filteredSortedOrders.map(order => {
          const currentStatus = statusEdits[order.id] ?? order.status;
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="border border-gray-200 p-4 mb-4 rounded-lg bg-white shadow-sm hover:bg-blue-50 transition duration-200 cursor-pointer"
              onClick={() => toggleExpand(order.id)}
            >
              <p className="text-gray-700"><strong>Lead:</strong> {order.leads?.name}</p>
              <p className="flex items-center gap-2">
                <strong>Status:</strong>
                <select
                  className={`p-2 rounded-lg border text-sm ${statusColors[currentStatus]}`}
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {statusEdits[order.id] && statusEdits[order.id] !== order.status && (
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmStatusChange(order.id); }}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <i className="fas fa-check mr-1"></i>Confirm
                  </button>
                )}
              </p>
              <p className="text-gray-700"><strong>Courier:</strong> {order.courier || '-'}</p>
              <p className="text-gray-700"><strong>Tracking #:</strong> {order.tracking_number || '-'}</p>
              <p className="text-gray-700"><strong>Dispatch Date:</strong> {order.dispatch_date || '-'}</p>
              {order.status === 'Dispatched' && (
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadReceipt(order);
                }}
                className="mt-2 px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <i className="fas fa-download mr-1"></i>Download Receipt
                  </button>
                )}


              {/* Expanded Billables */}
              {isExpanded && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <strong className="text-gray-800 flex items-center mb-2">
                    <i className="fas fa-file-invoice-dollar mr-2 text-blue-500"></i>Billable Details:
                  </strong>
                  {order.leads?.product && order.leads?.price != null && order.leads?.quantity != null ? (
                    <div className="text-gray-700 space-y-1">
                      <p>{order.leads.product} - Rs.{parseFloat(order.leads.price).toFixed(2)}</p>
                      <p>Quantity: {order.leads.quantity}</p>
                      <p>Amount: Rs.{(parseFloat(order.leads.price) * parseFloat(order.leads.quantity)).toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>No billables available.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredSortedOrders.length === 0 && (
          <p className="mt-6 text-gray-500 text-center">
            <i className="fas fa-exclamation-circle mr-2"></i>No orders found.
          </p>
        )}
      </div>
    </div>
  );
}
