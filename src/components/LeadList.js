import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LeadList() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setLeads(data);
  };

  return (
    <div>
      <h2>Leads</h2>
      {leads.map((lead) => (
        <div key={lead.id} style={{ border: '1px solid gray', padding: '10px', margin: '5px' }}>
          <p><strong>{lead.name}</strong> ({lead.company})</p>
          <p>Stage: {lead.stage}</p>
          <p>Contact: {lead.contact}</p>
        </div>
      ))}
    </div>
  );
}
