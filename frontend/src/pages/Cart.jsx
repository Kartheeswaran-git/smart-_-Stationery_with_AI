import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, PenLine, Minus, Plus, Bookmark } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState(() => {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  });

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const cart = [...cartItems];
    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex > -1) {
      cart[itemIndex].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      setCartItems(cart);
    }
  };

  const removeItem = (id) => {
    const cart = cartItems.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartItems(cart);
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      localStorage.removeItem('cart');
      setCartItems([]);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (cartItems.length === 0) {
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
              <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-amber-600 transition-all flex items-center gap-2">
                <ArrowLeft size={14} />
                Return to Boutique
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="bg-white p-16 rounded-[3rem] border border-amber-100 shadow-2xl shadow-amber-900/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-paper rounded-[2rem] border border-amber-50 mb-8 shadow-sm">
              <ShoppingCart size={40} className="text-amber-200" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Registry is Empty</h2>
            <p className="text-slate-500 font-medium mb-12 max-w-sm mx-auto leading-relaxed">Your collection awaits its first artisan piece. Discover our curated archival supplies.</p>
            <Link
              to="/"
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-ink-900 text-amber-400 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-black hover:shadow-2xl hover:shadow-ink-900/30 overflow-hidden"
            >
              <div className="absolute inset-0 w-2 bg-white/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
              Explore Collection
            </Link>
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
            <div className="flex items-center gap-8">
              <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-amber-600 transition-all flex items-center gap-2">
                <ArrowLeft size={14} />
                Return to Boutique
              </Link>
              <button
                onClick={clearCart}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 hover:text-ink-900 transition-all"
              >
                Reset Slip
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-[2px] bg-amber-600 rounded-full"></div>
          <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Acquisition Box</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden">
              <div className="p-8 border-b border-amber-50 bg-paper/30">
                <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.3em]">Authorized Registry Items</span>
              </div>
              <div className="divide-y divide-amber-50">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-8 group hover:bg-paper/20 transition-all duration-500">
                    <div className="flex items-center gap-8">
                      <div className="w-32 h-32 bg-paper rounded-[2rem] border border-amber-100 flex items-center justify-center p-2 relative overflow-hidden group-hover:shadow-md transition-all">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-[1.5rem]"
                          />
                        ) : (
                          <PenLine size={32} className="text-amber-100" />
                        )}
                        <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/5 transition-all"></div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 block">{item.category}</span>
                            <h3 className="font-bold text-slate-900 text-xl tracking-tight leading-tight group-hover:text-amber-800 transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>{item.name}</h3>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 bg-paper/50 p-1.5 rounded-2xl border border-amber-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center bg-white border border-amber-100 rounded-xl text-amber-900 hover:bg-amber-100 transition-all shadow-sm active:scale-90"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-ink-900 w-8 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center bg-white border border-amber-100 rounded-xl text-amber-900 hover:bg-amber-100 transition-all shadow-sm active:scale-90"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end mb-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Entry Total</span>
                            </div>
                            <p className="text-2xl font-black text-ink-900 tracking-tighter">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 p-8 bg-amber-50/50 rounded-[2rem] border border-dashed border-amber-200">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <Bookmark size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Archival Guarantee</p>
                <p className="text-xs text-slate-500 font-medium">Items preserved in your registry will be held for the duration of this session.</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-ink-900 rounded-[2.5rem] shadow-2xl shadow-ink-900/20 p-10 sticky top-32 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

              <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                Dispatch Ledger
              </h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Registry Value</span>
                  <span className="text-lg font-bold text-slate-200 tabular-nums">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Dispatch Fee</span>
                  <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Gratis</span>
                </div>
                <div className="h-[1px] bg-white/10 w-full"></div>
                <div className="pt-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Total Acquisition</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-4xl font-black text-white tracking-tighter tabular-nums">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 mb-10 border border-white/5">
                <div className="flex items-center gap-4 text-amber-400 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                    <PenLine size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Authorized Protocol</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Dispatch authorized via <span className="text-white font-bold">Standard Correspondence (COD)</span>. Final verification required at checkout.
                </p>
              </div>

              <Link
                to="/checkout"
                className="group relative flex w-full h-16 bg-amber-400 hover:bg-white text-ink-900 items-center justify-center rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all overflow-hidden shadow-xl shadow-amber-400/20 active:scale-95"
              >
                <div className="absolute inset-0 w-3 bg-white/30 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                Process Dispatch
              </Link>

              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center mt-6">
                Subject to Smart Fancy Terms of Acquisition
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;