import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  X,
  Truck,
  ChevronDown
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-700';
      case 'Packed': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Packed': return <Package size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      case 'Pending': return <Clock size={14} />;
      default: return <Package size={14} />;
    }
  };

  const statusOptions = ['Pending', 'Packed', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Sales Ledger</h1>
        <p className="text-slate-500 mt-1 font-medium">Chronicle of acquisitions and fulfilled request</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-amber-100/50 shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search our register..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-3 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium placeholder:text-slate-200 shadow-sm"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 pl-9 pr-8 py-3 bg-white border border-amber-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 appearance-none transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Statuses</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest italic opacity-40">Accessing Records...</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="overflow-x-auto whitespace-nowrap lg:whitespace-normal">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-paper border-b border-amber-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Transaction ID</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Patron Information</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Fulfillment State</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Valuation</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Dated</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center bg-paper/20">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                          <Truck size={40} className="text-amber-200" />
                        </div>
                        <div className="max-w-xs mx-auto">
                          <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>No Transactions Found</h3>
                          <p className="text-sm font-medium text-slate-400">The ledger currently holds no records matching your query.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-50/30 transition-all group">
                      <td className="px-8 py-6 font-mono text-[11px] font-bold text-slate-400">
                        <span className="text-amber-600">#</span>{order.id.slice(0, 10).toUpperCase()}
                      </td>
                      <td className="px-6 py-6 font-medium">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-800">{order.customerName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{order.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="relative inline-block group/status">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className={`appearance-none pl-10 pr-10 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/10 border-transparent transition-all shadow-sm ${getStatusColor(order.status)}`}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
                            {getStatusIcon(order.status)}
                          </div>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-40 group-hover/status:opacity-100 transition-opacity pointer-events-none" size={12} />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-lg font-bold text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>₹{order.total}</span>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                        {order.createdAt?.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="px-4 py-2 bg-white text-ink-900 hover:text-white hover:bg-ink-900 border border-amber-100 hover:border-ink-900 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 float-right group"
                        >
                          <Eye size={14} className="group-hover:scale-110 transition-transform" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal - Redesigned as a Premium Document */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-md transition-all animate-fade-in">
          <div className="bg-paper rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(60,31,10,0.3)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-slide-up border border-white/20">
            <div className="px-10 py-8 border-b border-amber-100/50 flex items-center justify-between bg-white/50 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-16 h-16 rounded-[2rem] bg-ink-900 text-white flex items-center justify-center shadow-2xl rotate-3 ring-4 ring-amber-50">
                  <Truck size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Dispatch Dossier</h3>
                  <div className="flex items-center gap-2 text-amber-600/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">
                    <span className="text-amber-900 font-mono">#{selectedOrder.id.toUpperCase()}</span>
                    <span>| Full Statement</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="relative z-10 text-slate-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition-all active:scale-90 group"
              >
                <X size={28} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto bg-white/30 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-amber-100 pb-2">Patron Particulars</h4>
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-slate-800">{selectedOrder.customerName}</p>
                    <p className="text-sm font-medium text-slate-500">{selectedOrder.email}</p>
                    <p className="text-xs font-bold text-amber-600/60 uppercase tracking-widest">{selectedOrder.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-amber-100 pb-2">Consignment Destination</h4>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{selectedOrder.address}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-amber-100 pb-4 mb-4">Inventory Manifest</h4>
                <div className="bg-white/60 rounded-3xl border border-amber-50 overflow-hidden shadow-inner">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50/50">
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-amber-900/40 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-center text-[10px] font-bold text-amber-900/40 uppercase tracking-widest">Qty</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-amber-900/40 uppercase tracking-widest">Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50/50">
                      {selectedOrder.items ? selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/20 transition-colors">
                          <td className="px-6 py-4 text-slate-800 font-bold">{item.name}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-400">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>₹{item.price}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic font-medium">No inventory data available for this ledger entry.</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-amber-50/50 border-t border-amber-100">
                      <tr>
                        <td colSpan="2" className="px-6 py-5 text-right font-bold text-amber-900/40 uppercase tracking-widest">Grand Total</td>
                        <td className="px-6 py-5 text-right font-bold text-ink-900 text-2xl" style={{ fontFamily: '"Playfair Display", serif' }}>₹{selectedOrder.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="bg-paper p-8 rounded-[2rem] border border-amber-100 shadow-xl shadow-amber-900/5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Update Dispatch Status</h4>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative flex-1 w-full group">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      className="w-full pl-12 pr-10 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 transition-all font-bold text-slate-800 cursor-pointer appearance-none shadow-inner"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                      {getStatusIcon(selectedOrder.status)}
                    </div>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-amber-600 transition-colors" size={18} />
                  </div>
                  <div className="px-8 py-4 bg-white rounded-2xl border border-amber-50 shadow-inner flex flex-col items-center justify-center min-w-[160px]">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">State</span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-paper/50 border-t border-amber-100/50 flex justify-center">
              <button
                onClick={() => setShowDetails(false)}
                className="px-10 py-4 bg-ink-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-xl shadow-ink-900/20 active:scale-95"
              >
                Seal Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

