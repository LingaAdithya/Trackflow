import React from 'react';
import LeadList from '../components/LeadList';

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
      All Leads
      </h1>
      <LeadList />
      <hr className="my-6 border-gray-300" />
    </div>
  );
}