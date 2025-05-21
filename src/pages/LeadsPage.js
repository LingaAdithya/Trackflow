import React from 'react';
import LeadForm from '../components/LeadForm';
import LeadList from '../components/LeadList';

export default function LeadsPage() {
  return (
    <div>
      <h1>Leads</h1>
      <LeadForm />
      <hr />
      <LeadList />
    </div>
  );
}
