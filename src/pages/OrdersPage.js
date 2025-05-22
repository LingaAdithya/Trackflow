import React from 'react';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';

export default function OrdersPage() {
  return (
    <div>
      <h1>Orders</h1>
      <OrderForm />
      <hr />
      <OrderList />
    </div>
  );
}
