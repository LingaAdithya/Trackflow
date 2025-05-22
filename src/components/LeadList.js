import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import LeadForm from './LeadForm'; // assuming you have LeadForm as a separate component

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const stageOptions = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed', 'Lost'];


  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setLeads(data);
  };

  const handleLeadAdded = () => {
    setShowForm(false);
    fetchLeads();
  };

    const updateStage = async (id, newStage) => {
    const { error } = await supabase
      .from('leads')
      .update({ stage: newStage })
      .eq('id', id);

    if (error) {
      alert('Error updating stage: ' + error.message);
    } else {
      // Refresh list after update
      fetchLeads();
    }
  };


return (
  <div>
    {!showForm && (
      <button onClick={() => setShowForm(true)} style={{ marginBottom: '20px' }}>
        + Add New Lead
      </button>
    )}

    {showForm && <LeadForm onLeadAdded={handleLeadAdded} onCancel={() => setShowForm(false)} />}

    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
      {stageOptions.map((stage) => (
        <div key={stage} style={{ flex: 1, minWidth: '250px' }}>
          <h3 style={{ textAlign: 'center', background: '#f4f4f4', padding: '10px' }}>{stage}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leads
              .filter((lead) => lead.stage === stage)
              .map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    border: '1px solid gray',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <p><strong>{lead.name}</strong> ({lead.company})</p>
                  <p>
                    <strong>Stage:</strong>
                    <select
                      value={lead.stage}
                      onChange={(e) => updateStage(lead.id, e.target.value)}
                    >
                      {stageOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </p>
                  <p>Contact Number: {lead.contact_number}</p>
                  <p>Email: {lead.email}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
}