import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { addDoc, collection, serverTimestamp, getDocs, query, where, getDoc, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Shield, CheckCircle, ArrowLeft, PenLine, FileText, ClipboardCheck, Phone, Mail, MapPin, Truck, Award, ShoppingCart } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch saved user details
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(prev => ({
              ...prev,
              customerName: userData.name || currentUser.displayName || '',
              email: userData.email || currentUser.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              city: userData.city || '',
              pincode: userData.pincode || ''
            }));
          } else {
            // Fallback if doc doesn't exist yet
            setFormData(prev => ({
              ...prev,
              customerName: currentUser.displayName || '',
              email: currentUser.email || ''
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    instructions: ''
  });

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Load cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);

    // If direct buy from product page
    if (location.state?.product) {
      setCartItems([location.state.product]);
      setTotalAmount(location.state.product.price * location.state.product.quantity);
    }
  }, [location]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save/Update User Profile with latest address
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        // Legacy flow for guest checkout (if enabled later) or fallback
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", formData.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(usersRef, {
            name: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
            createdAt: serverTimestamp(),
            role: 'customer'
          });
        }
      }

      // Create order object
      const orderData = {
        userId: user ? user.uid : null, // Link order to user ID
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        instructions: formData.instructions,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        total: totalAmount,
        status: 'Pending',
        paymentMethod: 'Cash on Delivery',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);

      // Clear cart
      localStorage.removeItem('cart');

      // Show success
      setOrderPlaced(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !location.state?.product) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[2.5rem] border border-amber-100 shadow-xl max-w-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} className="text-amber-200" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Registry is Empty</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">You must select artisan items for acquisition before proceeding to formal dispatch.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-ink-900 transition-colors"
          >
            <ArrowLeft size={14} />
            The Boutique
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-paper font-sans">
        <header className="bg-white/80 backdrop-blur-md border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100/50 p-2 rounded-xl">
                <PenLine size={24} className="text-amber-700" />
              </div>
              <h1 className="text-2xl font-bold text-ink-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                Smart <span className="text-amber-600">Fancy</span>
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-24">
          <div className="bg-white rounded-[3rem] border border-amber-100 shadow-2xl shadow-amber-900/10 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

            <div className="inline-flex items-center justify-center w-24 h-24 bg-paper rounded-[2.5rem] border border-amber-50 mb-8 shadow-sm">
              <ClipboardCheck size={40} className="text-amber-600" />
            </div>

            <h1 className="text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Dispatch Authorized</h1>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              Your acquisition request has been formally recorded. Our master logisticians are preparing your archival shipment.
            </p>

            <div className="bg-paper/50 rounded-[2rem] p-8 mb-10 border border-amber-50 text-left">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.3em]">Official Entry ID</span>
                <span className="text-lg font-black text-ink-900 font-mono tracking-wider">{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="h-[1px] bg-amber-100/50 w-full mb-6"></div>
              <p className="text-xs text-slate-500 text-center font-medium">
                Our concierge will contact you at <span className="text-ink-900 font-bold">{formData.phone}</span> to coordinate formal delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/')}
                className="group relative flex h-16 bg-ink-900 text-amber-400 items-center justify-center rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-black hover:shadow-xl active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 w-3 bg-white/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                Return to Boutique
              </button>
              <a
                href="tel:+918608605264"
                className="flex h-16 border-2 border-amber-100 text-amber-900 hover:bg-amber-50 items-center justify-center rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 gap-3"
              >
                <Phone size={16} />
                Acquisition Support
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-amber-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-amber-100/50 p-2 rounded-xl">
                <PenLine size={24} className="text-amber-700" />
              </div>
              <h1 className="text-2xl font-bold text-ink-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                Smart <span className="text-amber-600">Fancy</span>
              </h1>
            </Link>
            <button
              onClick={() => navigate('/cart')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-amber-600 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Return to Acquisition Box
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-[2px] bg-amber-600 rounded-full"></div>
          <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Formal Dispatch Charter</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Customer Information Form */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-[2.5rem] border border-amber-100 shadow-2xl shadow-amber-900/5 p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <FileText className="text-amber-50/50" size={120} />
              </div>
              <h2 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.3em] mb-10 relative z-10">I. Consignee Particulars</h2>

              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Distinguished Name</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                        placeholder="Master Archivist"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Correspondence Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                        placeholder="patron@smartfancy.co"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Direct Dial</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                        placeholder="+91 00000 00000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Archive Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                        placeholder="641 XXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">City of Residence</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                      placeholder="Palladam"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Formal Logistics Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium resize-none"
                      placeholder="1/957, Kodangi Palayam, Trichy Main Road..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Dispatch Directives (Optional)</label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium resize-none"
                      placeholder="e.g., Handle with extreme care, archival packaging only..."
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-[2.5rem] border border-amber-100 shadow-2xl shadow-amber-900/5 overflow-hidden">
              <div className="p-10 border-b border-amber-50 bg-paper/30">
                <h2 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.3em]">II. Inventory Enumeration</h2>
              </div>
              <div className="divide-y divide-amber-50">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-8 flex items-center justify-between group hover:bg-paper/10 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-paper rounded-2xl border border-amber-50 flex items-center justify-center p-1 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <PenLine size={24} className="text-amber-100" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>{item.name}</p>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Quantity Authorized: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-ink-900 tabular-nums">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-ink-900 rounded-[2.5rem] shadow-2xl shadow-ink-900/20 p-10 sticky top-32 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
              <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                Summary
              </h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Registry Total</span>
                  <span className="text-lg font-bold text-slate-200 tabular-nums">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Courier Protocol</span>
                  <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Gratis</span>
                </div>
                <div className="h-[1px] bg-white/10 w-full"></div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Total Ledger Entry</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-4xl font-black text-white tracking-tighter tabular-nums">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-center gap-4 text-emerald-400 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <Truck size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Direct Dispatch Flow</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6">
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
                    Dispatch authorized via <span className="text-white font-bold text-sm">Standard Correspondence (COD)</span>. Final signature required at portal arrival.
                  </p>
                  <p className="text-[10px] text-amber-400/60 font-medium italic border-t border-white/5 pt-4">
                    Kindly ensure archival currency is accessible during delivery. First-year maintenance certification included.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative flex w-full h-16 bg-amber-400 hover:bg-white text-ink-900 items-center justify-center rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all overflow-hidden shadow-xl shadow-amber-400/20 active:scale-95 disabled:opacity-50"
              >
                <div className="absolute inset-0 w-3 bg-white/30 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin"></div>
                    <span>Authorizing...</span>
                  </div>
                ) : 'Place Order (COD)'}
              </button>

              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center mt-6">
                Subject to Smart Fancy Acquisition Protocol
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;