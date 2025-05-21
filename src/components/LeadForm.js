import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // make sure this path is correct

export default function LeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    company: '',
    product_interest: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('leads').insert([
      {
        name: formData.name,
        contact: formData.contact,
        company: formData.company,
        product_interest: formData.product_interest,
        status: 'New' // default stage
      }
    ]);

    if (error) {
      alert('Error adding lead: ' + error.message);
    } else {
      alert('Lead added!');
      setFormData({ name: '', contact: '', company: '', product_interest: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact" required />
      <input name="company" value={formData.company} onChange={handleChange} placeholder="Company" required />
      <input name="product_interest" value={formData.product_interest} onChange={handleChange} placeholder="Product Interest" required />
      <button type="submit">Add Lead</button>
    </form>
  );
}
