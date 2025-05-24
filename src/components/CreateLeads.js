import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreateLead() {
  const navigate = useNavigate();

  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    contact_number: '',
    email: '',
    stage: 'New',
    product: '',
    quantity: '',
    price: '',
  });

  const handleAddLead = async (e) => {
    e.preventDefault();

    const leadToInsert = {
      ...newLead,
      stage: 'New',
      price: parseFloat(newLead.price) || 0,
      quantity: parseInt(newLead.quantity) || 0,
    };

    const { error } = await supabase.from('leads').insert([leadToInsert]).select();

    if (error) {
      console.error('Error adding lead:', error);
      alert('Failed to create lead');
    } else {
      alert('Lead created successfully!');
      navigate('/leads');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <i className="fas fa-users mr-2 text-blue-500"></i> Create New Lead
        </h2>

        <form
          onSubmit={handleAddLead}
          className="bg-gray-100 p-4 sm:p-6 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name"
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
          />
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Company"
            value={newLead.company}
            onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
          />
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contact Number"
            value={newLead.contact_number}
            onChange={(e) => setNewLead({ ...newLead, contact_number: e.target.value })}
          />
          <input
            type="email"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={newLead.email}
            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
          />
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Product"
            value={newLead.product}
            onChange={(e) => setNewLead({ ...newLead, product: e.target.value })}
          />
          <input
            type="number"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Quantity"
            value={newLead.quantity}
            onChange={(e) => setNewLead({ ...newLead, quantity: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Price"
            value={newLead.price}
            onChange={(e) => setNewLead({ ...newLead, price: e.target.value })}
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 sm:col-span-2"
          >
            <i className="fas fa-save mr-2"></i> Save Lead
          </button>
        </form>
      </div>
    </div>
  );
}