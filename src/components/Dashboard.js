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
  const [leadStats, setLeadStats] = useState({ total: 0, closed: 0 });
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
    const { data: closedLeads } = await supabase.from('leads').select('id').eq('stage', 'Closed');
    setLeadStats({ total: allLeads?.length || 0, closed: closedLeads?.length || 0 });
  };

  const fetchOrderStats = async () => {
    const { data: allOrders } = await supabase.from('orders').select('id');
    const { data: dispatchedOrders } = await supabase.from('orders').select('id').eq('status', 'Dispatched');
    setOrderStats({ total: allOrders?.length || 0, dispatched: dispatchedOrders?.length || 0 });
  };

  const fetchUpcomingFollowups = async () => {
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const { data } = await supabase
      .from('leads')
      .select('id, name, followup_date')
      .gte('followup_date', today)
      .order('followup_date', { ascending: true })
      .limit(5);
    setUpcomingFollowups(data || []);
  };

  const fetchLeadStageDistribution = async () => {
    const stageOptions = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost', 'Closed'];
    const stageCounts = [];
    for (const stage of stageOptions) {
      const { data } = await supabase.from('leads').select('id').eq('stage', stage);
      stageCounts.push(data?.length || 0);
    }
    setLeadStageDistribution(stageCounts);
  };

  const fetchLeadTrendData = async () => {
    const { data } = await supabase
      .from('leads')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (data) {
      const monthlyCounts = {};
      data.forEach((lead) => {
        const date = new Date(lead.created_at);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
      });

      const labels = Object.keys(monthlyCounts);
      const counts = Object.values(monthlyCounts);
      setLeadTrendData({ labels, counts });
    }
  };

  const barData = {
    labels: ['Leads', 'Closed Leads', 'Orders', 'Dispatched Orders'],
    datasets: [
      {
        label: 'Count',
        data: [leadStats.total, leadStats.closed, orderStats.total, orderStats.dispatched],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Lead and Order Statistics',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const pieData = {
    labels: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost', 'Closed'],
    datasets: [
      {
        label: 'Lead Stages',
        data: leadStageDistribution,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(201, 203, 207, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Lead Stage Distribution',
        font: { size: 18 }
      },
    }
  };

  const lineData = {
    labels: leadTrendData.labels,
    datasets: [
      {
        label: 'Leads Created',
        data: leadTrendData.counts,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Leads Created Over Time',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center mb-6">
          <i className="fas fa-chart-line mr-2 text-blue-500"></i> Dashboard
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Leads</h4>
            <p className="text-gray-600">Total: {leadStats.total}</p>
            <p className="text-gray-600">Closed: {leadStats.closed}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Orders</h4>
            <p className="text-gray-600">Total: {orderStats.total}</p>
            <p className="text-gray-600">Dispatched: {orderStats.dispatched}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <Bar data={barData} options={barOptions} />
          </div>
          <div>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        <div className="mb-6">
          <Line data={lineData} options={lineOptions} />
        </div>

        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center mb-4">
            <i className="fas fa-calendar-check mr-2 text-blue-500"></i> Upcoming Follow-ups
          </h3>
          {upcomingFollowups.length === 0 ? (
            <p className="text-center text-gray-500">No upcoming follow-ups</p>
          ) : (
            <ul className="space-y-2">
              {upcomingFollowups.map((lead) => (
                <li
                  key={lead.id}
                  className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-blue-50 transition duration-200"
                >
                  <span>{lead.name}</span>
                  <span>{lead.followup_date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            <i className="fas fa-users mr-2"></i> View Leads
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            <i className="fas fa-box-open mr-2"></i> View Orders
          </button>
          <button
            onClick={() => navigate('/create-lead')}
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
          >
            <i className="fas fa-plus mr-2"></i> Add Lead
          </button>
          <button
            onClick={() => navigate('/create-order')}
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
          >
            <i className="fas fa-plus mr-2"></i> Add Order
          </button>
        </div>
      </div>
    </div>
  );
}