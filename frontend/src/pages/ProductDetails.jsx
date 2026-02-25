import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingCart, Truck, Shield, ArrowLeft, PenLine, Star, Award, Zap, Minus, Plus, Bookmark, Gem, X } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.length);

    alert(`${quantity} ${product.name}(s) added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
          <PenLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-600" size={20} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[2.5rem] border border-amber-100 shadow-xl max-w-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <X className="text-amber-200" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Entry Not Found</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">The archival record you are seeking does not appear in our current collection.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-ink-900 transition-colors">
            <ArrowLeft size={14} />
            Return to Boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper font-sans">
      {/* Header */}
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
              <Link to="/" className="hidden sm:flex text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-amber-600 transition-all items-center gap-2">
                <ArrowLeft size={14} />
                The Boutique
              </Link>
              <Link to="/cart" className="relative group">
                <div className="p-2.5 rounded-xl group-hover:bg-amber-50 transition-all border border-transparent group-hover:border-amber-100">
                  <ShoppingCart size={22} className="text-slate-600 group-hover:text-amber-700 transition" />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-amber-900/20">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="bg-white rounded-[3rem] border border-amber-100 shadow-2xl shadow-amber-900/5 p-12 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
              <div className="flex items-center justify-center aspect-square bg-paper/30 rounded-[2.5rem] border border-amber-50 relative overflow-hidden group-hover:scale-95 transition-transform duration-700">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-[80%] max-w-[80%] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-amber-100">
                    <PenLine size={80} />
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-200">Archival View Unavailable</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white p-6 rounded-3xl border border-amber-50 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Award size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Premium Origin</span>
              </div>
              <div className="flex-1 bg-white p-6 rounded-3xl border border-amber-50 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Bookmark size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Archival Quality</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-ink-900 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {product.category}
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-200 to-transparent"></div>
              </div>
              <h1 className="text-5xl font-black text-slate-900 leading-tight mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>{product.name}</h1>
              <div className="flex items-center gap-6">
                <p className="text-4xl font-black text-ink-900 tracking-tighter">₹{product.price}</p>
                <div className="w-[1px] h-8 bg-amber-100"></div>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock > 10
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
                  }`}>
                  {product.stock > 10 ? 'In Stock' : `Rare: ${product.stock} Remaining`}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.3em] mb-4">Artisan's Note</h2>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                {product.description || 'A masterpiece of precision and aesthetic appeal, curated for the modern connoisseur of fine writing materials.'}
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-amber-100 shadow-xl shadow-amber-900/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-paper flex items-center justify-center text-amber-600 shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-ink-900 uppercase tracking-widest mb-1">Boutique Logistics</h3>
                  <p className="text-xs text-slate-400 font-medium">Archival preservation packaging included</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 bg-paper/50 rounded-2xl border border-amber-50">
                  <p className="text-[9px] font-black text-amber-900/40 uppercase tracking-widest mb-1">Coverage</p>
                  <p className="text-xs font-bold text-slate-700">Across Tamil Nadu</p>
                </div>
                <div className="p-4 bg-paper/50 rounded-2xl border border-amber-50">
                  <p className="text-[9px] font-black text-amber-900/40 uppercase tracking-widest mb-1">Dispatch</p>
                  <p className="text-xs font-bold text-slate-700">Gratis (COD)</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-6 border-t border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-black text-amber-900 uppercase tracking-[0.3em] block mb-2 ml-1">Quantity Selection</label>
                  <div className="flex items-center gap-2 bg-paper/50 p-1.5 rounded-2xl border border-amber-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-white border border-amber-100 rounded-xl text-amber-900 hover:bg-amber-100 transition-all shadow-sm active:scale-90"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-xl font-black text-ink-900 w-12 text-center tabular-nums">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center bg-white border border-amber-100 rounded-xl text-amber-900 hover:bg-amber-100 transition-all shadow-sm active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorized Supply</p>
                  <p className="text-sm font-black text-amber-600">{product.stock} units in vault</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="group relative flex-1 h-18 bg-ink-900 text-amber-400 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all hover:bg-black hover:shadow-2xl hover:shadow-ink-900/40 disabled:opacity-50 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 w-3 bg-white/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                  <ShoppingCart size={18} />
                  <span>Secure Acquisition</span>
                </button>
                <Link
                  to="/checkout"
                  state={{ product: { ...product, quantity } }}
                  className="flex-1 border-2 border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] text-center transition-all flex items-center justify-center active:scale-95"
                >
                  Authorize Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Features */}
        <div className="mt-24 p-12 bg-white rounded-[3rem] border border-amber-100 shadow-2xl shadow-amber-900/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>
          <h2 className="text-3xl font-black text-slate-900 mb-10" style={{ fontFamily: '"Playfair Display", serif' }}>Archival Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex items-start gap-5 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0">
                <Star size={28} />
              </div>
              <div>
                <h3 className="text-sm font-black text-ink-900 uppercase tracking-widest mb-2">Authenticated Collection</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Each instrument in our vault is meticulously verified for archival pedigree.</p>
              </div>
            </div>
            <div className="flex items-start gap-5 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0">
                <Gem size={28} />
              </div>
              <div>
                <h3 className="text-sm font-black text-ink-900 uppercase tracking-widest mb-2">Artisan Heritage</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Supporting global master craftsmen preserving traditional stationery arts.</p>
              </div>
            </div>
            <div className="flex items-start gap-5 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-sm font-black text-ink-900 uppercase tracking-widest mb-2">Patron Assurance</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Direct support and heritage maintenance for all acquisitions from our boutique.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;