import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const statusOptions = ['Order Received', 'In Development', 'Ready to Dispatch', 'Dispatched'];

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, courier, tracking_number, dispatch_date, lead_id, leads(name)')
      .order('dispatch_date', { ascending: false });

    if (error) alert('Error fetching orders: ' + error.message);
    else setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) alert('Error updating status: ' + error.message);
    else fetchOrders();
  };

  return (
    <div>
      <h3>Orders</h3>
      {orders.map((order) => (
        <div key={order.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <p><strong>Lead:</strong> {order.leads?.name}</p>
          <p><strong>Status:</strong>
            <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </p>
          <p><strong>Courier:</strong> {order.courier}</p>
          <p><strong>Tracking #:</strong> {order.tracking_number}</p>
          <p><strong>Dispatch Date:</strong> {order.dispatch_date}</p>
        </div>
      ))}
    </div>
  );
}
