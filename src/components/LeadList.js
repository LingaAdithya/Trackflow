import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filterStage, setFilterStage] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [editingLeadData, setEditingLeadData] = useState({});
  const [editingFollowupId, setEditingFollowupId] = useState(null);
  const [followupDate, setFollowupDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    contact_number: '',
    email: '',
    product: '',
    amount: '',
    quantity: '',
    stage: 'New',
  });

  const stageOptions = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  const fetchLeads = useCallback(async () => {
    let query = supabase.from('leads').select('*');
    if (sortBy === 'name' || sortBy === 'followup_date') {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error } = await query;
    if (error) console.error('Error fetching leads:', error);
    else setLeads(data);
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleStageChange = (leadId, newStage) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, stage: newStage } : lead
      )
    );
    setEditingLeadData((prev) => ({ ...prev, stage: newStage }));
  };

  const handleStageConfirm = async (leadId, confirmedStage) => {
    const originalLead = leads.find((lead) => lead.id === leadId);
    const wasWon = originalLead.stage === 'Won';

    const { error: stageError } = await supabase
      .from('leads')
      .update({ stage: confirmedStage || originalLead.stage })
      .eq('id', leadId);

    if (stageError) {
      console.error('Error updating stage:', stageError);
      toast.error(`Failed to update stage: ${stageError.message}`);
    } else {
      if (wasWon && confirmedStage !== 'Won') {
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('lead_id', leadId);
        if (deleteError) {
          console.error('Error withdrawing order:', deleteError);
          toast.error(`Failed to withdraw order: ${deleteError.message}`);
        }
      }

      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId
            ? { ...lead, stage: confirmedStage || lead.stage }
            : lead
        )
      );

      toast.success('Stage updated successfully');
      cancelEditing();

      if (confirmedStage === 'Won') navigate('/create-order');
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    const leadToInsert = {
      ...newLead,
      stage: 'New',
      amount: parseFloat(newLead.amount) || 0,
      quantity: parseInt(newLead.quantity, 10) || 0,
    };

    const { data, error } = await supabase.from('leads').insert([leadToInsert]).select();
    if (error) {
      console.error('Error adding lead:', error);
      toast.error(`Failed to add lead: ${error.message}`);
    } else {
      setLeads((prev) => [data[0], ...prev]);
      setShowForm(false);
      setNewLead({
        name: '',
        company: '',
        contact_number: '',
        email: '',
        product: '',
        amount: '',
        quantity: '',
        stage: 'New',
      });
      toast.success('Lead added successfully');
    }
  };

  const handleFollowupSave = async (leadId) => {
    const { error } = await supabase.from('leads').update({ followup_date: followupDate }).eq('id', leadId);
    if (error) {
      console.error('Error updating followup date:', error);
      toast.error(`Failed to update follow-up date: ${error.message}`);
    } else {
      setEditingFollowupId(null);
      setFollowupDate('');
      fetchLeads();
      toast.success('Follow-up date updated');
    }
  };

  const saveEditedLead = async (leadId) => {
    const updatedLeadData = {
      name: editingLeadData.name,
      company: editingLeadData.company,
      contact_number: editingLeadData.contact_number,
      email: editingLeadData.email,
      product: editingLeadData.product,
      quantity: parseInt(editingLeadData.quantity, 10) || 0,
      stage: editingLeadData.stage,
      followup_date: editingLeadData.followup_date || null,
    };

    const { error } = await supabase.from('leads').update(updatedLeadData).eq('id', leadId);
    if (error) {
      console.error('Error updating lead:', error);
      toast.error(`Failed to update lead: ${error.message}`);
    } else {
      fetchLeads();
      toast.success('Changes saved successfully');
      cancelEditing();
    }
  };

  const cancelEditing = () => {
    setEditingLeadId(null);
    setEditingLeadData({});
    setEditingFollowupId(null);
    setFollowupDate('');
    fetchLeads();
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStage = filterStage === 'All' || lead.stage === filterStage;
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-users mr-2 text-blue-500"></i> Lead Management
          </h2>
          <button
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 w-full sm:w-auto"
            onClick={() => setShowForm((prev) => !prev)}
          >
            <i className="fas fa-plus mr-2"></i>
            {showForm ? 'Cancel' : 'Add Lead'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddLead}
            className="bg-gray-100 p-4 sm:p-6 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <input
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              required
            />
            <input
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Company"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              required
            />
            <input
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contact Number"
              value={newLead.contact_number}
              onChange={(e) => setNewLead({ ...newLead, contact_number: e.target.value })}
              required
            />
            <input
              type="email"
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              required
            />
            <input
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Product"
              value={newLead.product}
              onChange={(e) => setNewLead({ ...newLead, product: e.target.value })}
              required
            />
            <input
              type="number"
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Quantity"
              value={newLead.quantity}
              onChange={(e) => setNewLead({ ...newLead, quantity: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.01"
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Amount"
              value={newLead.amount}
              onChange={(e) => setNewLead({ ...newLead, amount: e.target.value })}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 w-full sm:w-auto col-span-1 sm:col-span-2"
            >
              <i className="fas fa-save mr-2"></i>Save
            </button>
          </form>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap">
          <label className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-gray-700">
              <i className="fas fa-filter mr-2 text-blue-500"></i>Filter by Stage:
            </span>
            <select
              className="p-2 border border-gray-300 rounded-lg w-full sm:w-auto"
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
          <label className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-gray-700">
              <i className="fas fa-search mr-2 text-blue-500"></i>Search:
            </span>
            <input
              className="p-2 border border-gray-300 rounded-lg w-full sm:w-64"
              placeholder="Search by name or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-gray-700">
              <i className="fas fa-sort mr-2 text-blue-500"></i>Sort by:
            </span>
            <select
              className="p-2 border border-gray-300 rounded-lg w-full sm:w-auto"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="created_at">Created At</option>
              <option value="name">Name</option>
              <option value="followup_date">Follow-up Date</option>
            </select>
            <button
              className="p-2 text-gray-700 hover:text-blue-600"
              onClick={() => handleSortChange(sortBy)}
            >
              <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white hidden sm:table-header-group">
              <tr>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSortChange('name')}>
                  Name {sortBy === 'name' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                </th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Stage</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSortChange('followup_date')}>
                  Follow-up {sortBy === 'followup_date' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                </th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, idx) => (
                <tr
                  key={lead.id}
                  className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 flex flex-col sm:table-row border-b sm:border-none p-4 sm:p-0`}
                >
                  <td className="p-3 sm:table-cell flex items-center">
                    <span className="font-semibold sm:hidden mr-2">Name:</span>
                    <div
                      className="text-blue-700 font-bold cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setEditingFollowupId(lead.id);
                        setFollowupDate(lead.followup_date || '');
                      }}
                      title="Click to edit follow-up date"
                    >
                      <i className="fas fa-user"></i>
                      {lead.name}
                      {lead.followup_date && (
                        <i className="fas fa-calendar-check text-green-500" title="Follow-up scheduled"></i>
                      )}
                    </div>
                  </td>
                  <td className="p-3 sm:table-cell flex items-center">
                    <span className="font-semibold sm:hidden mr-2">Company:</span>
                    {editingLeadId === lead.id ? (
                      <input
                        type="text"
                        value={editingLeadData.company}
                        onChange={(e) =>
                          setEditingLeadData({ ...editingLeadData, company: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                      />
                    ) : (
                      lead.company
                    )}
                  </td>
                  <td className="p-3 sm:table-cell flex items-center">
                    <span className="font-semibold sm:hidden mr-2">Stage:</span>
                    {editingLeadId === lead.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editingLeadData.stage}
                          onChange={(e) => {
                            setEditingLeadData({ ...editingLeadData, stage: e.target.value });
                            handleStageChange(lead.id, e.target.value);
                          }}
                          className="p-2 border rounded w-full sm:w-auto"
                        >
                          {stageOptions.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStageConfirm(lead.id, editingLeadData.stage)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </div>
                    ) : (
                      lead.stage
                    )}
                  </td>
                  <td className="p-3 sm:table-cell flex items-center">
                    <span className="font-semibold sm:hidden mr-2">Contact:</span>
                    {editingLeadId === lead.id ? (
                      <input
                        type="text"
                        value={editingLeadData.contact_number}
                        onChange={(e) =>
                          setEditingLeadData({ ...editingLeadData, contact_number: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                      />
                    ) : (
                      lead.contact_number
                    )}
                  </td>
                  <td className="p-3 sm:table-cell flex items-center">
                    <span className="font-semibold sm:hidden mr-2">Email:</span>
                    {editingLeadId === lead.id ? (
                      <input
                        type="email"
                        value={editingLeadData.email}
                        onChange={(e) =>
                          setEditingLeadData({ ...editingLeadData, email: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                      />
                    ) : (
                      lead.email
                    )}
                  </td>
                  <td className="p-3 sm:table-cell flex items-center">
                    <span className="font-semibold sm:hidden mr-2">Follow-up:</span>
                    {editingLeadId === lead.id ? (
                      <input
                        type="date"
                        value={editingLeadData.followup_date || ''}
                        onChange={(e) =>
                          setEditingLeadData({ ...editingLeadData, followup_date: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                      />
                    ) : editingFollowupId === lead.id ? (
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
                        <input
                          type="date"
                          className="p-2 border border-gray-300 rounded-lg w-full sm:w-auto"
                          value={followupDate}
                          onChange={(e) => setFollowupDate(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFollowupSave(lead.id)}
                            className="px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                          >
                            <i className="fas fa-save mr-1"></i>Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <i className="fas fa-times mr-1"></i>Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      lead.followup_date || '-'
                    )}
                  </td>
                  <td className="p-3 sm:table-cell flex items-center">
                    <span className="font-semibold sm:hidden mr-2">Actions:</span>
                    {editingLeadId === lead.id ? (
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          onClick={() => saveEditedLead(lead.id)}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          onClick={cancelEditing}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-gray-500 hover:text-blue-600"
                        title="Edit Lead"
                        onClick={() => {
                          setEditingLeadId(lead.id);
                          setEditingLeadData({ ...lead });
                        }}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <p className="mt-6 text-gray-500 text-center">
            <i className="fas fa-exclamation-circle mr-2"></i>No leads found.
          </p>
        )}
      </div>
    </div>
  );
}