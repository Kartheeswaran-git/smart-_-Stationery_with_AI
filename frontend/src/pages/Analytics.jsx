import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    conversionRate: 0,
    topProducts: [],
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalCustomers = usersSnapshot.size;

      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Mocking some sales data for top products since we don't have a real transactions subcollection yet
      const topProducts = products.slice(0, 5).map(p => ({
        ...p,
        sales: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 50000) + 10000
      })).sort((a, b) => b.revenue - a.revenue);

      setAnalyticsData({
        totalRevenue,
        averageOrderValue,
        totalOrders,
        totalCustomers,
        conversionRate: totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(2) : 0,
        topProducts,
        recentOrders: orders.slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock Data for Charts
  const revenueData = [
    { name: 'Jan', revenue: 40000, orders: 24 },
    { name: 'Feb', revenue: 30000, orders: 18 },
    { name: 'Mar', revenue: 20000, orders: 12 },
    { name: 'Apr', revenue: 27800, orders: 20 },
    { name: 'May', revenue: 18900, orders: 15 },
    { name: 'Jun', revenue: 23900, orders: 19 },
    { name: 'Jul', revenue: 34900, orders: 25 },
  ];

  const categoryData = [
    { name: 'Extinguishers', value: 400 },
    { name: 'Alarms', value: 300 },
    { name: 'Hydrants', value: 300 },
    { name: 'Safety Gear', value: 200 },
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${analyticsData.totalRevenue.toLocaleString()}`,
      trend: '+12.5%',
      trendUp: true,
      icon: DollarSign,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'Total Orders',
      value: analyticsData.totalOrders,
      trend: '+8.2%',
      trendUp: true,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Customers',
      value: analyticsData.totalCustomers,
      trend: '-2.4%',
      trendUp: false,
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Avg Order Value',
      value: `₹${analyticsData.averageOrderValue.toFixed(0)}`,
      trend: '+4.1%',
      trendUp: true,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Intelligence Hub</h1>
          <p className="text-slate-500 mt-1 font-medium">Synthesized insights and performance analytics</p>
        </div>

        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-amber-100 shadow-sm transition-all focus-within:ring-4 focus-within:ring-amber-400/10 active:scale-95 cursor-pointer">
          <Calendar size={18} className="text-amber-600" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-[10px] font-bold uppercase tracking-widest border-none focus:ring-0 text-slate-700 bg-transparent cursor-pointer"
          >
            <option value="week">Weekly Review</option>
            <option value="month">Monthly Ledger</option>
            <option value="quarter">Quarterly Digest</option>
            <option value="year">Annual Archive</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border border-amber-100 shadow-xl shadow-amber-900/5 hover:shadow-amber-900/10 transition-all group active:scale-95">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${stat.color.includes('red') ? 'bg-amber-100 text-amber-600' :
                stat.color.includes('blue') ? 'bg-ink-50 text-ink-700' :
                  stat.color.includes('emerald') ? 'bg-paper text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                <stat.icon size={26} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${stat.trendUp ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2" style={{ fontFamily: '"Playfair Display", serif' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Valuation Trajectory</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Periodic revenue patterns & flow</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fffbeb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '24px',
                    border: '1px solid #fef3c7',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '16px',
                    fontWeight: 700
                  }}
                  itemStyle={{ color: '#d97706' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d97706"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={{ r: 6, fill: '#fff', stroke: '#d97706', strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: '#d97706', stroke: '#fff', strokeWidth: 4, shadow: '0 0 10px rgba(217, 119, 6, 0.5)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5">
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Categorical Index</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Portfolio distribution</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Instruments', value: 400 },
                    { name: 'Parchment', value: 300 },
                    { name: 'Inks', value: 300 },
                    { name: 'Folios', value: 200 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {[
                    { name: 'Instruments', value: 400 },
                    { name: 'Parchment', value: 300 },
                    { name: 'Inks', value: 300 },
                    { name: 'Folios', value: 200 },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0f172a', '#d97706', '#f59e0b', '#78350f'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '20px',
                    border: '1px solid #fef3c7',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { name: 'Instruments', value: 400 },
              { name: 'Parchment', value: 300 },
              { name: 'Inks', value: 300 },
              { name: 'Folios', value: 200 },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center p-3 rounded-2xl bg-paper/50 border border-amber-100/50">
                <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: ['#0f172a', '#d97706', '#f59e0b', '#78350f'][index % 4] }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-center">{item.name}</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="p-8 border-b border-amber-100 flex items-center justify-between bg-paper/30">
            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Premier Editions</h3>
            <button className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors">Manifest All</button>
          </div>
          <div className="divide-y divide-amber-50">
            {analyticsData.topProducts.map((product) => (
              <div key={product.id} className="p-6 flex items-center gap-5 hover:bg-amber-50/30 transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-100 shadow-sm group-hover:scale-105 transition-transform">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="w-full h-full object-contain p-2 rounded-xl" />
                  ) : (
                    <Package size={24} className="text-amber-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate" style={{ fontFamily: '"Inter", sans-serif' }}>{product.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>₹{product.revenue.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">{product.sales} units dispatched</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders - Themed as Ledger Entries */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="p-8 border-b border-amber-100 flex items-center justify-between bg-paper/30">
            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Journal Entries</h3>
            <button className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors">Recall History</button>
          </div>
          <div className="divide-y divide-amber-50">
            {analyticsData.recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between hover:bg-amber-50/30 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-paper border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
                    {order.customerName ? order.customerName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800 group-hover:text-amber-700 transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>{order.customerName || 'Unknown Patron'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {order.id.slice(0, 10).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>₹{order.total}</p>
                  <div className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full inline-block mt-1 ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Pending' ? 'bg-ink-50 text-ink-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {order.status || 'Pending Review'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;