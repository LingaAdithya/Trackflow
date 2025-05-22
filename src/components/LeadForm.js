import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // make sure this path is correct

export default function LeadForm({ onLeadAdded, onCancel })  {
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    email: '',
    company: '',
    product_interest: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Step 1: Check if lead with same contact_number already exists
  const { data: existingLeads, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('contact_number', formData.contact_number);

  if (fetchError) {
    alert('Error checking for existing lead: ' + fetchError.message);
    return;
  }

  if (existingLeads.length > 0) {
    alert('Lead already exists!');
    return;
  }

  // Step 2: Insert new lead
  const { error } = await supabase.from('leads').insert([
    {
      name: formData.name,
      contact_number: formData.contact_number,
      email: formData.email,
      company: formData.company,
      product_interest: formData.product_interest,
      stage: 'New'
    }
  ]);

  if (error) {
    alert('Error adding lead: ' + error.message);
  } else {
    alert('Lead added!');
    setFormData({ name: '', contact_number: '', email: '', company: '', product_interest: '' });
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="contact_number" value={formData.contact} onChange={handleChange} placeholder="Contact" required />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="email" required/>
      <input name="company" value={formData.company} onChange={handleChange} placeholder="Company" required />
      <input name="product_interest" value={formData.product_interest} onChange={handleChange} placeholder="Product Interest" required />
      <button type="submit">Add Lead</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>
        Cancel
      </button>
    </form>
  );
}
