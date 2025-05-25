import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [leadStats, setLeadStats] = useState({ total: 0, won: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, dispatched: 0 });
  const [upcomingFollowups, setUpcomingFollowups] = useState([]);
  const [leadStageDistribution, setLeadStageDistribution] = useState([]);
  const [leadTrendData, setLeadTrendData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLeadStats();
    fetchOrderStats();
    fetchUpcomingFollowups();
    fetchLeadStageDistribution();
    fetchLeadTrendData();
  }, []);

  const fetchLeadStats = async () => {
    const { data: allLeads } = await supabase.from('leads').select('id');
    const { data: wonLeads } = await supabase.from('leads').select('id').eq('stage', 'Won');
    setLeadStats({ total: allLeads?.length || 0, won: wonLeads?.length || 0 });
  };

  const fetchOrderStats = async () => {
    const { data: allOrders } = await supabase.from('orders').select('id');
    const { data: dispatchedOrders } = await supabase.from('orders').select('id').eq('status', 'Dispatched');
    setOrderStats({ total: allOrders?.length || 0, dispatched: dispatchedOrders?.length || 0 });
  };

  const fetchUpcomingFollowups = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('leads')
      .select('id, name, followup_date')
      .gte('followup_date', today)
      .order('followup_date', { ascending: true })
      .limit(5);
    setUpcomingFollowups(data || []);
  };

  const fetchLeadStageDistribution = async () => {
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
    const counts = [];
    for (const stage of stages) {
      const { data } = await supabase.from('leads').select('id').eq('stage', stage);
      counts.push(data?.length || 0);
    }
    setLeadStageDistribution(counts);
  };

  const fetchLeadTrendData = async () => {
    const { data } = await supabase.from('leads').select('created_at').order('created_at', { ascending: true });
    if (data) {
      const monthlyCounts = {};
      data.forEach((lead) => {
        const date = new Date(lead.created_at);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
      });

      setLeadTrendData({
        labels: Object.keys(monthlyCounts),
        counts: Object.values(monthlyCounts),
      });
    }
  };

  const barData = {
    labels: ['Leads', 'Leads Won', 'Orders', 'Dispatched Orders'],
    datasets: [{
      label: 'Count',
      data: [leadStats.total, leadStats.won, orderStats.total, orderStats.dispatched],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
    }]
  };

  const pieData = {
    labels: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
    datasets: [{
      label: 'Lead Stages',
      data: leadStageDistribution,
      backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'],
    }]
  };

  const lineData = {
    labels: leadTrendData.labels,
    datasets: [{
      label: 'Leads Created',
      data: leadTrendData.counts,
      borderColor: '#3B82F6',
      tension: 0.3,
    }]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 10 }
        }
      },
      title: {
        display: false,
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <i className="fas fa-chart-line text-blue-500 mr-2"></i> Dashboard
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="text-xl font-semibold text-blue-800">{leadStats.total}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Leads Won</p>
            <p className="text-xl font-semibold text-green-800">{leadStats.won}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-xl font-semibold text-yellow-800">{orderStats.total}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Dispatched</p>
            <p className="text-xl font-semibold text-purple-800">{orderStats.dispatched}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg shadow h-[300px]">
            <Bar data={barData} options={chartOptions} />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow h-[300px]">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow h-[300px] mb-8">
          <Line data={lineData} options={chartOptions} />
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Upcoming Follow-ups</h3>
          {upcomingFollowups.length === 0 ? (
            <p className="text-gray-500 text-center">No upcoming follow-ups</p>
          ) : (
            <ul className="space-y-2">
              {upcomingFollowups.map((lead) => (
                <li key={lead.id} className="bg-blue-50 px-4 py-2 rounded flex justify-between items-center">
                  <span className="text-gray-800">{lead.name}</span>
                  <span className="text-sm text-gray-500">{lead.followup_date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => navigate('/leads')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Leads
          </button>
          <button onClick={() => navigate('/orders')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Orders
          </button>
          <button onClick={() => navigate('/create-lead')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Add Lead
          </button>
          <button onClick={() => navigate('/create-order')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Add Order
          </button>
        </div>
      </div>
    </div>
  );
}
