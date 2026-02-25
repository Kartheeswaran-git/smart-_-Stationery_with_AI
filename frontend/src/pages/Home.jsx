import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chatbot from "../components/Chatbot";
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from '../firebase';
import { ShoppingCart, Search, Filter, PenLine, Truck, Award, Phone, Loader2, Menu, X, User, LogOut, LogIn, Sparkles, BookOpen, Star, Gem } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const navigate = useNavigate();

  // Auth State
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load cart from localStorage
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    const productsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProducts(productsList);
  };

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const categoriesList = snapshot.docs.map(doc => doc.data().name);
    setCategories(['all', ...categoriesList]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.length);
    alert(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    navigate('/checkout', {
      state: {
        product: {
          ...product,
          quantity: 1
        }
      }
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: loginName,
          email: loginEmail,
          role: 'customer',
          createdAt: serverTimestamp()
        });

        alert("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
      setShowLoginModal(false);
      setLoginName('');
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error("Auth error:", error);
      setLoginError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        role: 'customer',
        lastLogin: serverTimestamp()
      }, { merge: true });

      setShowLoginModal(false);
    } catch (error) {
      console.error("Google Auth error:", error);
      setLoginError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCartCount(0); // Optional: clear cart view or keep it? User might want to keep cart. 
      // Actually local storage cart is independent of auth in this app so far.
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const features = [
    {
      icon: <Gem className="text-amber-600" size={32} />,
      title: 'Artisan Collections',
      description: 'Hand-picked premium stationery from global master craftsmen'
    },
    {
      icon: <Truck className="text-amber-600" size={32} />,
      title: 'Boutique Delivery',
      description: 'Carefully packaged and dispatched to your doorstep'
    },
    {
      icon: <BookOpen className="text-amber-600" size={32} />,
      title: 'Master Archivists',
      description: 'Consult with our specialists for bespoke paper requirements'
    },
    {
      icon: <Sparkles className="text-amber-600" size={32} />,
      title: 'Bespoke Orders',
      description: 'Customized journals and engraved fine writing instruments'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white border-b border-slate-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-amber-100/50 p-2.5 rounded-xl group-hover:bg-amber-100 transition-all shadow-sm">
                <PenLine size={24} className="text-amber-700" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-ink-900 leading-none tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Smart <span className="text-amber-600">Fancy</span>
                </h1>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Fine Stationery Boutique</span>
              </div>
            </Link>

            {/* Desktop Navigation & Search */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-12">
              <div className="relative w-full group focus-within:ring-4 focus-within:ring-amber-400/10 rounded-2xl transition-all">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Discover fine instruments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 bg-paper/50 border border-amber-50 focus:bg-white focus:border-amber-200 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/admin" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-amber-700 transition-colors">
                Vault
              </Link>

              {user && (
                <Link to="/my-orders" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-amber-700 transition-colors">
                  Journal
                </Link>
              )}

              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Leave</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-xs font-bold text-amber-700 uppercase tracking-widest hover:text-ink-900 transition-colors flex items-center gap-2"
                >
                  <LogIn size={16} />
                  <span>Enter</span>
                </button>
              )}
              <Link to="/cart" className="relative p-3 bg-ink-900 text-amber-400 rounded-2xl shadow-lg shadow-ink-900/20 hover:scale-110 active:scale-95 transition-all group">
                <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-ink-900 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/cart" className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg text-slate-700">
                <ShoppingCart size={20} />
                <span className="font-medium">Cart ({cartCount})</span>
              </Link>
              {user && (
                <Link to="/my-orders" className="px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">
                  My Orders
                </Link>
              )}
              <Link to="/admin" className="px-4 py-3 text-slate-600 font-medium">
                Admin Portal
              </Link>
              {user ? (
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 font-medium">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-3 px-4 py-3 text-primary-600 font-medium">
                  <LogIn size={20} />
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-40 md:pb-32 bg-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 scale-110 animate-subtle-zoom"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/80 to-ink-900"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={14} className="animate-pulse" />
            <span>Premium Stationery Boutique</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200" style={{ fontFamily: '"Playfair Display", serif' }}>
            The Art of <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-[length:200%_auto] animate-shimmer">Fine Stationery.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Curating the world's most exquisite journals, writing instruments, and archival supplies for the contemporary aesthete.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <a href="#products" className="group relative w-full sm:w-auto px-12 py-5 bg-amber-400 text-ink-900 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-amber-400/20 overflow-hidden">
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 w-4 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
            </a>
            <a href="tel:+918608605264" className="w-full sm:w-auto px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-white/10 flex items-center justify-center gap-3 backdrop-blur-sm">
              <Phone size={18} className="text-amber-400" />
              Contact Boutique
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-b border-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group flex flex-col items-center text-center gap-5 p-8 rounded-[2rem] hover:bg-amber-50/50 transition-all duration-500 border border-transparent hover:border-amber-100">
                <div className="p-5 bg-paper rounded-[1.5rem] shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-500 text-amber-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-widest text-xs">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-amber-600 rounded-full"></div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Artisan Repository</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 truncate" style={{ fontFamily: '"Playfair Display", serif' }}>Premier Collections</h2>
            <p className="text-slate-500 font-medium">Archival grade instruments for the discerning collector</p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === category
                  ? 'bg-ink-900 text-amber-400 shadow-xl shadow-ink-900/20'
                  : 'bg-white border border-amber-100 text-slate-500 hover:border-amber-300 hover:text-amber-700'
                  }`}
              >
                {category === 'all' ? 'The Journal' : category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="animate-spin text-primary-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full inline-block mb-3 shadow-sm">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
            <p className="text-slate-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-[2.5rem] border border-amber-100/50 overflow-hidden hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-500 relative">
                  <Link to={`/product/${product.id}`} className="block relative aspect-[5/6] bg-paper/30 overflow-hidden m-4 rounded-[2rem]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-200">
                        <PenLine size={64} />
                      </div>
                    )}
                    {/* Stock Badge */}
                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-700">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${product.stock > 10
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                        {product.stock > 10 ? 'Available' : 'Limited Edition'}
                      </div>
                    </div>
                  </Link>

                  <div className="px-8 pb-8 pt-2">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">{product.category}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 font-bold">₹</span>
                        <span className="text-2xl font-black text-ink-900 tracking-tighter">{product.price}</span>
                      </div>
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors line-clamp-1 truncate" style={{ fontFamily: '"Playfair Display", serif' }}>{product.name}</h3>
                    </Link>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">{product.description}</p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 py-4 bg-paper hover:bg-amber-50 text-amber-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-amber-100"
                      >
                        <ShoppingCart size={16} />
                        Add To Registry
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={product.stock === 0}
                        className="px-6 py-4 bg-ink-900 text-amber-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black hover:shadow-xl hover:shadow-ink-900/20"
                      >
                        Acquire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-20">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-4 rounded-2xl border border-amber-100 text-amber-900 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Prior Slip
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    const showPage = pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis
                      if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <span key={pageNumber} className="px-2 text-amber-200">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-12 h-12 rounded-2xl font-black text-[10px] transition-all flex items-center justify-center ${currentPage === pageNumber
                          ? 'bg-ink-900 text-amber-400 shadow-xl shadow-ink-900/20 scale-110'
                          : 'border border-amber-50 text-slate-400 hover:border-amber-300 hover:text-amber-700'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-4 rounded-2xl border border-amber-100 text-amber-900 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Next Slip
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-ink-900 text-slate-500 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/40">
                <PenLine size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Smart Fancy</span>
            </Link>
            <p className="text-sm leading-relaxed font-medium">Elevating the mundane through artisan archival supplies and fine writing instruments. Established for the discerning eye.</p>
          </div>

          <div>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Registry Links</h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">The Boutique</Link></li>
              <li><a href="#products" className="hover:text-amber-400 transition-colors">Current Collection</a></li>
              <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Acquisition Box</Link></li>
              <li><Link to="/admin" className="hover:text-amber-400 transition-colors">Vault Access</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Principal Office</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="leading-relaxed">xxx</li>
              <li className="text-amber-400/80">concierge@smartfancy.boutique</li>
              <li className="text-white font-bold tracking-widest">+91 xxxxxxxxxx</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Bespoke Orders</h3>
            <p className="text-sm mb-8 leading-relaxed">Require customized journals or bulk archival supplies? Consult with our specialists.</p>
            <a href="tel:+918608605264" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-paper/5 text-amber-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-amber-400/20 hover:bg-amber-400 hover:text-ink-900">
              <Phone size={14} />
              Bespoke Inquiry
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            © {new Date().getFullYear()} Smart Fancy Fine Stationery. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {
        showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all relative border border-amber-100 animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-amber-600 p-2 rounded-full hover:bg-amber-50 transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="p-10">
                <div className="text-center mb-10">
                  <div className="bg-amber-100 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <User size={28} className="text-amber-700" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 truncate" style={{ fontFamily: '"Playfair Display", serif' }}>
                    {isSignUp ? 'New Registry' : 'Welcome Back'}
                  </h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                    {isSignUp ? 'Establish your patron profile' : 'Access your acquisition history'}
                  </p>
                </div>

                <div className="space-y-6">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loginLoading}
                    className="w-full bg-white border border-amber-100 hover:bg-amber-50 hover:border-amber-200 text-slate-700 h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 w-2 bg-amber-400/5 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span className="uppercase tracking-widest text-[10px]">Google Authentication</span>
                  </button>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-amber-50"></div>
                    </div>
                    <span className="relative bg-white px-4 text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">Or Correspondence Flow</span>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-5">
                    {isSignUp && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Distinguished Name</label>
                        <input
                          type="text"
                          value={loginName}
                          onChange={(e) => setLoginName(e.target.value)}
                          className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                          placeholder="Master Archivist"
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Archive Email</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                        placeholder="patron@smartfancy.co"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest ml-1">Access Cipher</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-paper/30 border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>

                    {loginError && (
                      <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-50 p-4 rounded-xl flex items-start gap-2 border border-red-100 animate-shake">
                        <div className="mt-0.5"><X size={14} /></div>
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-ink-900 text-amber-400 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-black hover:shadow-2xl hover:shadow-ink-900/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 w-3 bg-white/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                      {loginLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <span>{isSignUp ? 'Create Registry' : 'Authorize Entry'}</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {isSignUp ? 'Already registered?' : "New patron?"}{' '}
                      <button
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setLoginError('');
                        }}
                        className="text-amber-700 font-black hover:text-ink-900 transition-colors ml-1"
                      >
                        {isSignUp ? 'Authorize Here' : 'Open Registry'}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Home;