import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const lowStockProducts = productsSnapshot.docs.filter(
          doc => doc.data().stock < 10
        ).length;

        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const pendingOrders = ordersSnapshot.docs.filter(
          doc => doc.data().status === 'Pending'
        ).length;
        const usersSnapshot = await getDocs(collection(db, 'users'));

        setStats({
          totalProducts: productsSnapshot.size,
          totalCategories: categoriesSnapshot.size,
          totalOrders: ordersSnapshot.size,
          totalUsers: usersSnapshot.size,
          lowStockProducts,
          pendingOrders
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      () => fetchStats()
    );
    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      () => fetchStats()
    );

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  const statCards = [
    {
      title: 'Active Inventory',
      value: stats.totalProducts,
      icon: <Package className="text-amber-700" size={24} />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Product Lines',
      value: stats.totalCategories,
      icon: <FolderTree className="text-amber-800" size={24} />,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      title: 'Store Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart className="text-ink-600" size={24} />,
      bgColor: 'bg-ink-50',
      borderColor: 'border-ink-100',
    },
    {
      title: 'Fancy Members',
      value: stats.totalUsers,
      icon: <Users className="text-slate-600" size={24} />,
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-100',
    },
    {
      title: 'Stock Requests',
      value: stats.lowStockProducts,
      icon: <AlertTriangle className="text-red-600" size={24} />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      urgent: true
    },
    {
      title: 'Awaiting Action',
      value: stats.pendingOrders,
      icon: <TrendingUp className="text-amber-600" size={24} />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      urgent: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Workspace Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your Smart Fancy boutique performance</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
          <Activity size={14} />
          Live System
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`
              card-paper p-6 transition-all duration-300 hover:translate-y-[-4px] group
              ${stat.urgent ? 'ring-2 ring-red-100 border-red-200' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-5">
              <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              {stat.urgent && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.15em]">{stat.title}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>{stat.value}</span>
                <span className="text-xs font-bold text-amber-500/60 uppercase">Unit(s)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions */}
        <div className="card-paper p-8 lg:col-span-1 shadow-md border-amber-100/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-600 rounded-lg shadow-lg shadow-amber-600/20">
              <Activity className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Control Panel</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Inventory Manager', path: '/admin/products', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Order Processing', path: '/admin/orders', icon: ShoppingCart, color: 'text-ink-600', bg: 'bg-ink-50' },
              { label: 'Customer Insights', path: '/admin/customers', icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full group flex items-center justify-between p-4 bg-white hover:bg-paper border border-amber-50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-amber-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon size={20} />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{action.label}</span>
                </div>
                <ArrowRight size={18} className="text-amber-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Overview Card */}
        <div className="card-paper p-8 lg:col-span-2 bg-paper flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-dots-paper opacity-50"></div>

          <div className="relative z-10">
            <div className="bg-white p-6 rounded-3xl shadow-xl mb-6 group-hover:rotate-6 transition-transform duration-500 border border-amber-50">
              <TrendingUp className="text-amber-500" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Market Performance</h3>
            <p className="text-slate-500 max-w-sm mb-8 font-medium">Detailed sales and visitor metrics are currently being compiled for the monthly report.</p>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="px-8 py-3 bg-ink-900 text-white rounded-2xl hover:bg-black transition-all font-bold text-sm shadow-xl shadow-ink-900/20 active:scale-95 flex items-center gap-2"
            >
              Access Analytics Hub
              <ArrowRight size={16} className="text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;