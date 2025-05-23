import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filterStage, setFilterStage] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [followupDate, setFollowupDate] = useState('');
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

  const stageOptions = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching leads:', error);
    else setLeads(data);
  };

  const handleStageChange = (leadId, newStage) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, newStage } : lead
      )
    );
  };

  const handleStageConfirm = async (leadId, confirmedStage) => {
    const { error } = await supabase.from('leads').update({ stage: confirmedStage }).eq('id', leadId);
    if (error) {
      console.error('Error updating stage:', error);
    } else {
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId
            ? { ...lead, stage: confirmedStage, newStage: undefined }
            : lead
        )
      );
      if (confirmedStage === 'Won') {
        navigate('/create-order'); 
      }
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();

    const leadToInsert = {
      ...newLead,
      stage: 'New',
      price: parseFloat(newLead.price) || 0,
      quantity: parseInt(newLead.quantity) || 0,
    };

    const { data, error } = await supabase.from('leads').insert([leadToInsert]).select();

    if (error) {
      console.error('Error adding lead:', error);
    } else {
      setLeads((prev) => [data[0], ...prev]);
      setShowForm(false);
      setNewLead({
        name: '',
        company: '',
        contact_number: '',
        email: '',
        product: '',
        quantity: '',
        price: '',
        stage: 'New',
      });
    }
  };

  const handleFollowupSave = async (leadId) => {
    const { error } = await supabase.from('leads').update({ followup_date: followupDate }).eq('id', leadId);
    if (error) console.error('Error updating followup date:', error);
    else {
      setEditingFollowup(null);
      setFollowupDate('');
      fetchLeads();
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStage = filterStage === 'All' || lead.stage === filterStage;
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6 font-sans">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-users mr-2 text-blue-500"></i> Lead Management
          </h2>
          <button
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
            onClick={() => setShowForm((prev) => !prev)}
          >
            <i className="fas fa-plus mr-2"></i>
            {showForm ? 'Cancel' : 'Add Lead'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddLead}
            className="bg-gray-100 p-6 rounded-xl mb-6 flex flex-wrap gap-4"
          >
            <input
              className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg"
              placeholder="Name"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              required
            />
            <input
              className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg"
              placeholder="Company"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              required
            />
            <input
              className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg"
              placeholder="Contact Number"
              value={newLead.contact_number}
              onChange={(e) => setNewLead({ ...newLead, contact_number: e.target.value })}
              required
            />
            <input
              className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Product"
              value={newLead.product}
              onChange={(e) => setNewLead({ ...newLead, product: e.target.value })}
            />
            <input
              type="number"
              className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Quantity"
              value={newLead.quantity}
              onChange={(e) => setNewLead({ ...newLead, quantity: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Price"
              value={newLead.price}
              onChange={(e) => setNewLead({ ...newLead, price: e.target.value })}
            />
            <input
              type="email"
              className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg"
              placeholder="Email"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <i className="fas fa-save mr-2"></i>Save
            </button>
          </form>
        )}

        <div className="flex gap-6 mb-6 flex-wrap">
          <label className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">
              <i className="fas fa-filter mr-2 text-blue-500"></i>Filter by Stage:
            </span>
            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
            >
              <option value="All">All</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">
              <i className="fas fa-search mr-2 text-blue-500"></i>Search:
            </span>
            <input
              className="p-2 border border-gray-300 rounded-lg w-64"
              placeholder="Search by name or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Stage</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, idx) => (
                <tr
                  key={lead.id}
                  className={`${
                    idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50`}
                >
                  <td
                    className="p-3 text-blue-600 font-medium cursor-pointer"
                    onClick={() => {
                      setEditingFollowup(lead.id);
                      setFollowupDate(lead.followup_date || '');
                    }}
                  >
                    <i className="fas fa-user mr-2"></i>
                    {lead.name}
                  </td>
                  <td className="p-3">{lead.company}</td>
                  <td className="p-3">
                    <select
                      className="p-2 border border-gray-300 rounded-lg"
                      value={lead.newStage ?? lead.stage}
                      onChange={(e) => handleStageChange(lead.id, e.target.value)}
                    >
                      {stageOptions.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    {lead.newStage && lead.newStage !== lead.stage && (
                      <button
                        onClick={() => handleStageConfirm(lead.id, lead.newStage)}
                        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg"
                      >
                        <i className="fas fa-check mr-1"></i>Confirm
                      </button>
                    )}
                  </td>
                  <td className="p-3">{lead.contact_number}</td>
                  <td className="p-3">{lead.email}</td>
                  <td className="p-3">
                    {editingFollowup === lead.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          className="p-2 border border-gray-300 rounded-lg"
                          value={followupDate}
                          onChange={(e) => setFollowupDate(e.target.value)}
                        />
                        <button
                          onClick={() => handleFollowupSave(lead.id)}
                          className="px-3 py-1 bg-teal-500 text-white rounded-lg"
                        >
                          <i className="fas fa-save mr-1"></i>Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingFollowup(null);
                            setFollowupDate('');
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg"
                        >
                          <i className="fas fa-times mr-1"></i>Cancel
                        </button>
                      </div>
                    ) : (
                      lead.followup_date || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
