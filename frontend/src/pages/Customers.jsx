import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Eye, Users, Search, Mail, Phone, MapPin, Calendar, ArrowUpRight } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const customersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Patron Registry</h1>
        <p className="text-slate-500 mt-1 font-medium">Directory of esteemed collectors and fine writing enthusiasts</p>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-amber-100/50 shadow-sm h-full flex items-center">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={22} />
              <input
                type="text"
                placeholder="Locate patron by name, email, or identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium placeholder:text-slate-200 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-ink-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-amber-400/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Registrations</p>
            <h3 className="text-4xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>{customers.length}</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 bg-white/5 p-8 rounded-full backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
            <Users size={60} className="text-white/10" />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest italic opacity-40">Consulting Archives...</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="overflow-x-auto whitespace-nowrap lg:whitespace-normal">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-paper border-b border-amber-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Member Profile</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Contact Details</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Primary Residence</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Induction Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50/50">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center bg-paper/20">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                          <Users size={40} className="text-amber-200" />
                        </div>
                        <div className="max-w-xs mx-auto">
                          <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Registry Entry Missing</h3>
                          <p className="text-sm font-medium text-slate-400">The current search parameters do not match any known patrons in our archives.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-amber-50/30 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-amber-700 font-bold text-xl border border-amber-100 shadow-sm group-hover:scale-105 transition-all duration-300">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-800 group-hover:text-amber-700 transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>{customer.name || 'Anonymous Patron'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Reference: <span className="font-mono">{customer.id.substring(0, 10).toUpperCase()}</span></p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium">
                        <div className="flex flex-col gap-2">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-slate-600 bg-paper/50 px-3 py-1 rounded-lg border border-amber-50/50 w-fit">
                              <Mail size={12} className="text-amber-500/60" />
                              <span className="text-[11px] font-bold text-slate-500 truncate max-w-[160px]" title={customer.email}>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-slate-600 bg-paper/50 px-3 py-1 rounded-lg border border-amber-50/50 w-fit">
                              <Phone size={12} className="text-amber-500/60" />
                              <span className="text-[11px] font-bold text-slate-500">{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-start gap-3 text-xs font-bold text-slate-500 max-w-[200px] italic">
                          <MapPin size={14} className="text-amber-500/40 mt-0.5 flex-shrink-0" />
                          <span className={!customer.address ? "opacity-30" : "opacity-70"}>
                            {customer.address ? (
                              customer.address.length > 45 ? customer.address.slice(0, 45) + '...' : customer.address
                            ) : 'Address not recorded'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                          <Calendar size={14} className="text-amber-500/40" />
                          <span>{customer.createdAt?.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) || 'Records Lost'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-3 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-transparent hover:border-amber-100 bg-white shadow-sm active:scale-95" title="Inspect Record">
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredCustomers.length > 0 && (
            <div className="px-8 py-5 border-t border-amber-50 bg-paper/50 flex items-center justify-between">
              <p className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">
                Manifesting <span className="text-amber-900">{filteredCustomers.length}</span> Active Profiles
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Customers;
