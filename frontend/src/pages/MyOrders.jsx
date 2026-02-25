import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Package, Calendar, MapPin, ChevronRight, ShoppingBag, Shield, PenLine, Bookmark, History, FileText, Award, Clock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                navigate('/'); // Redirect if not logged in
            } else {
                setUser(currentUser);
                fetchOrders(currentUser.email);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchOrders = async (userEmail) => {
        try {
            let q;
            const ordersRef = collection(db, 'orders');

            if (user?.uid) {
                // Prefer querying by User ID if available
                q = query(ordersRef, where('userId', '==', user.uid));
            } else {
                // Fallback to email
                q = query(ordersRef, where('email', '==', userEmail));
            }

            const querySnapshot = await getDocs(q);
            const ordersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sorting to avoid composite index requirement
            ordersList.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA; // Descending order
            });

            setOrders(ordersList);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-paper">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
                    <History className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-600" size={20} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-amber-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="bg-amber-100/50 p-2 rounded-xl">
                            <PenLine size={24} className="text-amber-700" />
                        </div>
                        <h1 className="text-2xl font-bold text-ink-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                            Smart <span className="text-amber-600">Fancy</span>
                        </h1>
                    </Link>
                    <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-amber-600 transition-all flex items-center gap-2">
                        <ArrowLeft size={14} />
                        Return to Boutique
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-[2px] bg-amber-600 rounded-full"></div>
                    <h1 className="text-4xl font-black text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Patron Journal</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-16 text-center border border-amber-100 shadow-2xl shadow-amber-900/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
                        <div className="bg-paper w-24 h-24 rounded-[2rem] border border-amber-50 flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <History size={40} className="text-amber-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>The Journal is Blank</h3>
                        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">No archival acquisitions have been recorded under this signature yet.</p>
                        <Link to="/" className="group relative inline-flex items-center gap-3 px-12 py-5 bg-ink-900 text-amber-400 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-black hover:shadow-2xl hover:shadow-ink-900/30 overflow-hidden">
                            <div className="absolute inset-0 w-2 bg-white/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                            Begin Collection
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-[2.5rem] border border-amber-100 overflow-hidden shadow-2xl shadow-amber-900/5 hover:shadow-amber-900/10 transition-all duration-500 group relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>

                                {/* Order Header */}
                                <div className="bg-paper/30 px-10 py-8 border-b border-amber-50 flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-10">
                                        <div>
                                            <span className="block text-[9px] font-black text-amber-900/40 uppercase tracking-[0.2em] mb-1">Acquisition Date</span>
                                            <span className="font-bold text-ink-900 flex items-center gap-2">
                                                <Clock size={14} className="text-amber-600" />
                                                {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Pending Archive'}
                                            </span>
                                        </div>
                                        <div className="h-10 w-[1px] bg-amber-100 hidden sm:block"></div>
                                        <div>
                                            <span className="block text-[9px] font-black text-amber-900/40 uppercase tracking-[0.2em] mb-1">Folio Entry</span>
                                            <span className="font-mono font-bold text-slate-600 tracking-wider">#{order.id.slice(0, 8).toUpperCase()}</span>
                                        </div>
                                        <div className="h-10 w-[1px] bg-amber-100 hidden sm:block"></div>
                                        <div>
                                            <span className="block text-[9px] font-black text-amber-900/40 uppercase tracking-[0.2em] mb-1">Total Value</span>
                                            <span className="font-black text-ink-900 text-lg tracking-tighter">₹{order.total}</span>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                        }`}>
                                        {order.status || 'In Transit'}
                                    </div>
                                </div>

                                {/* Tracking / Address Info */}
                                <div className="px-10 py-6 border-b border-amber-50 flex items-start gap-4 bg-paper/10">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        <span className="text-[9px] font-black text-amber-900/40 uppercase tracking-widest block mb-1">Consignee Address</span>
                                        {order.address}
                                    </p>
                                </div>

                                {/* Items */}
                                <div className="p-10 bg-white">
                                    <div className="space-y-6">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-6 group/item">
                                                <div className="h-20 w-20 bg-paper rounded-[1.5rem] shrink-0 overflow-hidden flex items-center justify-center border border-amber-50 p-1 group-hover/item:scale-105 transition-transform duration-500">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-xl" />
                                                    ) : (
                                                        <FileText size={24} className="text-amber-100" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 text-lg leading-tight truncate group-hover/item:text-amber-800 transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>{item.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Quantity: {item.quantity}</span>
                                                        <div className="w-1 h-1 rounded-full bg-amber-200"></div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry: ₹{item.price}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-ink-900 tracking-tighter">₹{item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-dashed border-amber-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <Award size={14} />
                                            </div>
                                            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest leading-none">Smart Fancy Heritage Guarantee</span>
                                        </div>
                                        <Link to="/" className="text-[9px] font-black text-amber-700 uppercase tracking-[0.2em] hover:text-ink-900 transition-colors flex items-center gap-2">
                                            Re-Authorize List
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrders;
