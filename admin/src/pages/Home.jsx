import React, { useEffect, useState } from 'react';
import axiosInstance from '../customize/axios';
import { currency } from '../App';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Clock
} from 'lucide-react';
import {useNavigate} from "react-router-dom"

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    productCount: 0,
    userCount: 0,
    recentOrders: []
  });

  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get("/admin/dashboard-stats");
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Mảng chứa thông tin các card thống kê
  const statCards = [
    {
      title: "Total Revenue",
      value: `${currency}${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="text-emerald-600" size={24} />,
      bg: "bg-emerald-50",
      trend: "+12.5%",
      color: "text-emerald-600"
    },
    {
      title: "Total Orders",
      value: stats.orderCount,
      icon: <ShoppingCart className="text-indigo-600" size={24} />,
      bg: "bg-indigo-50",
      trend: "+8.2%",
      color: "text-indigo-600"
    },
    {
      title: "Products",
      value: stats.productCount,
      icon: <Package className="text-amber-600" size={24} />,
      bg: "bg-amber-50",
      trend: "In Stock",
      color: "text-amber-600"
    },
    {
      title: "Customers",
      value: stats.userCount,
      icon: <Users className="text-rose-600" size={24} />,
      bg: "bg-rose-50",
      trend: "Active",
      color: "text-rose-600"
    }
  ];

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.bg}`}>
                {card.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 ${card.color}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{card.title}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Recent Orders</h3>
            <button onClick={() => navigate('/order')} className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={16}/>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase font-black">
                <tr>
                  <th className="px-8 py-4">Order ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-mono text-xs text-slate-500">#{order._id.slice(-6)}</td>
                    <td className="px-8 py-4 font-bold text-slate-700">{order.address.firstName}</td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right font-black text-slate-800">
                      {currency}{order.amount.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                   <tr>
                     <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">No recent orders yet.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Activity / Quick Actions */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <TrendingUp className="absolute -right-4 -top-4 text-white/10" size={160} />
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button onClick={() => navigate('/add')} className="cursor-pointer w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex items-center gap-4 px-6 transition-all font-bold">
                <div className="p-2 bg-white rounded-xl text-indigo-600">
                  <Package size={20}/>
                </div>
                Add New Product
              </button>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl flex items-center gap-4 px-6 transition-all font-black shadow-lg">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Clock size={20}/>
                </div>
                Generate Report
              </button>
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-3xl border border-white/10">
              <p className="text-indigo-100 text-sm font-medium italic">"Success is not final; failure is not fatal: It is the courage to continue that counts."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;