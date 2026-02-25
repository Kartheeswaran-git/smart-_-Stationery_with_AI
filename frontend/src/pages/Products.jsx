import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Package,
  Search,
  Filter,
  ChevronDown,
  Eye,
  AlertCircle,
  Link,
  Activity,
  ArrowRight,
  PenLine
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState('upload'); // 'upload' or 'url'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null,
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return '';
    setUploading(true);

    const uploadPromise = new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });

    try {
      const url = await uploadPromise;
      setUploading(false);
      return url;
    } catch (error) {
      console.error("Image upload error:", error);
      alert(`Image upload error: ${error.message}`);
      setUploading(false);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      // Only upload if in 'upload' mode and a file is selected
      if (imageInputType === 'upload' && formData.image) {
        imageUrl = await handleImageUpload(formData.image);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl,
        createdAt: editingProduct ? editingProduct.createdAt : new Date(),
        updatedAt: new Date()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image: null,
      imageUrl: ''
    });
    setEditingProduct(null);
    setImageInputType('upload');
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: null
    });
    // If product has an image URL, we can default to 'url' mode or 'upload'.
    // 'upload' allows replacing it. 'url' allows editing the URL.
    // Let's default to 'url' if there's a URL, so they can see it?
    // Actually, usually users want to see the image. 
    // Let's default to 'upload' which shows the preview of the existing URL anyway.
    setImageInputType('upload');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'stock': return a.stock - b.stock;
      case 'newest': return new Date(b.createdAt?.seconds * 1000 || 0) - new Date(a.createdAt?.seconds * 1000 || 0);
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Inventory Ledger</h1>
          <p className="text-slate-500 mt-1 font-medium">Catalogue of fine stationery & writing instruments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-ink-900 text-white px-6 py-3 rounded-2xl hover:bg-black transition-all shadow-xl shadow-ink-900/10 font-bold active:scale-95 group"
        >
          <Plus size={20} className="text-amber-400 group-hover:rotate-90 transition-transform" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-amber-100/50 shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search our collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-3 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium placeholder:text-slate-300"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48 pl-9 pr-8 py-3 bg-white border border-amber-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 appearance-none transition-all cursor-pointer shadow-sm"
            >
              <option value="all">All Specialties</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48 pl-9 pr-8 py-3 bg-white border border-amber-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 appearance-none transition-all cursor-pointer shadow-sm"
            >
              <option value="newest">Latest Acquisitions</option>
              <option value="name">Alphabetical (A-Z)</option>
              <option value="price-low">Value: Low to High</option>
              <option value="price-high">Value: High to Low</option>
              <option value="stock">Inventory Level</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-xl overflow-hidden shadow-amber-900/5">
        <div className="overflow-x-auto whitespace-nowrap lg:whitespace-normal">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-paper border-b border-amber-100">
                <th className="px-8 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Item Details</th>
                <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Collection</th>
                <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Valuation</th>
                <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Stock Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Availability</th>
                <th className="px-8 py-5 text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-amber-900/30 uppercase tracking-widest">Compiling Records...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-slate-500 bg-paper/30">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                        <Package size={40} className="text-amber-200" />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: '"Playfair Display", serif' }}>No Items Found</p>
                        <p className="text-sm font-medium text-slate-400 mt-1">Our vaults are currently empty for this search. Check back soon for new arrivals.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-amber-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-white border border-amber-100 shadow-sm overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300 p-1">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full bg-paper flex items-center justify-center rounded-xl">
                              <Package size={24} className="text-amber-200" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-amber-700 transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>{product.name}</p>
                          <p className="text-xs font-medium text-slate-400 line-clamp-1 max-w-[250px] mt-0.5">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-ink-50 text-ink-700 uppercase tracking-wider border border-ink-100">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>₹{product.price}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Premium Grade</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 w-32">
                        <span className="text-xs font-bold text-slate-600 tracking-tight">{product.stock} Units</span>
                        <div className="h-2 w-full bg-amber-50 rounded-full overflow-hidden border border-amber-100/50">
                          <div
                            className={`h-full rounded-full transition-all duration-700 group-hover:brightness-110 ${product.stock > 20 ? 'bg-amber-600' :
                              product.stock > 10 ? 'bg-amber-400' : 'bg-red-500'
                              }`}
                            style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {product.stock === 0 ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-widest">
                          <AlertCircle size={12} className="animate-pulse" /> Out of Stock
                        </div>
                      ) : product.stock < 10 ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-widest">
                          Diminishing
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-widest">
                          Plentiful
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-amber-100 bg-white"
                          title="Edit Portfolio"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100 bg-white"
                          title="Purge Entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Simplified for now) */}
        {!loading && products.length > 0 && (
          <div className="px-8 py-5 border-t border-amber-50 bg-paper/50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">
              Archiving <span className="text-amber-900">{sortedProducts.length}</span> / {products.length} Registered Items
            </p>
          </div>
        )}
      </div>

      {/* Modal - Redesigned for Premium Experience */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-md transition-all animate-fade-in">
          <div className="bg-paper rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(60,31,10,0.3)] w-full max-w-3xl overflow-hidden transform transition-all animate-slide-up border border-white/20">
            <div className="px-10 py-8 flex items-center justify-between relative overflow-hidden bg-white/50 border-b border-amber-100/50">
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-16 h-16 rounded-[2rem] bg-ink-900 text-white flex items-center justify-center shadow-2xl rotate-3 ring-4 ring-amber-50">
                  <PenLine size={32} className="translate-x-1" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                    {editingProduct ? 'Curate Entry' : 'New Acquisition'}
                  </h3>
                  <p className="text-amber-600/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Exclusive Inventory Registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="relative z-10 text-slate-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition-all group active:scale-90"
              >
                <X size={28} className="group-hover:rotate-90 transition-transform" />
              </button>

              {/* Background accent */}
              <div className="absolute -right-10 -top-10 text-amber-50/50 pointer-events-none rotate-12">
                <Package size={200} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 bg-white/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Product Title</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner"
                      required
                      placeholder="e.g. Classic Ivory Inkstand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Archive Category</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 appearance-none transition-all font-bold text-slate-800 cursor-pointer shadow-inner"
                        required
                      >
                        <option value="">Choose Specialty</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Valuation (₹)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-amber-400">₹</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-10 pr-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Reserves</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner"
                      required
                      min="0"
                      placeholder="Units"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Visual Representation</label>

                    {/* Input Type Toggle */}
                    <div className="flex bg-amber-50 p-1.5 rounded-2xl mb-4 border border-amber-100 shadow-inner">
                      <button
                        type="button"
                        onClick={() => {
                          setImageInputType('upload');
                          setFormData({ ...formData, imageUrl: editingProduct ? editingProduct.imageUrl : '' });
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${imageInputType === 'upload'
                          ? 'bg-white text-amber-900 shadow-sm ring-1 ring-amber-100'
                          : 'text-amber-900/40 hover:text-amber-900/60'
                          }`}
                      >
                        <Upload size={14} />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputType('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${imageInputType === 'url'
                          ? 'bg-white text-amber-900 shadow-sm ring-1 ring-amber-100'
                          : 'text-amber-900/40 hover:text-amber-900/60'
                          }`}
                      >
                        <Link size={14} />
                        <span>Fetch URL</span>
                      </button>
                    </div>

                    {imageInputType === 'url' ? (
                      <div className="space-y-4">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all font-medium text-xs text-slate-500 placeholder:text-slate-200 shadow-inner"
                          placeholder="https://exclusive-gallery.com/item.jpg"
                        />
                        {formData.imageUrl && (
                          <div className="relative aspect-square w-full h-32 overflow-hidden rounded-2xl border-2 border-amber-50 bg-paper group shadow-inner">
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="h-full w-full object-contain p-2"
                              onError={(e) => (e.target.style.display = 'none')}
                              onLoad={(e) => (e.target.style.display = 'block')}
                            />
                            <div className="absolute inset-0 bg-ink-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-3 border-dashed border-amber-100/50 rounded-3xl p-6 text-center hover:border-amber-400 hover:bg-amber-50/20 transition-all duration-300 relative group">
                        {formData.imageUrl && !formData.image ? (
                          <div className="relative inline-block group">
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="h-32 w-32 object-contain rounded-2xl mx-auto p-1 bg-white shadow-xl"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, imageUrl: '' })}
                              className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full shadow-2xl p-2 hover:bg-red-50 ring-4 ring-amber-50 border border-red-100"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : formData.image ? (
                          <div className="flex items-center justify-center flex-col gap-3 text-amber-900 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <Package size={24} className="text-amber-600" />
                            </div>
                            <span className="text-xs font-bold truncate max-w-[200px]">{formData.image.name}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: null })}
                              className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:underline"
                            >
                              Remove Selection
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <div className="flex flex-col items-center gap-4 text-amber-900/30 group-hover:text-amber-900/60 transition-colors">
                              <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-900/5 border border-amber-50 group-hover:scale-110 transition-transform duration-300">
                                <Upload size={32} />
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm font-bold block">Drop Artwork Here</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold underline">or browse archives</span>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                              className="hidden"
                            />
                          </label>
                        )}

                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
                              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-[0.2em]">Digitizing...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Narrative Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-5 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all min-h-[140px] font-medium text-slate-700 placeholder:text-slate-200 shadow-inner resize-none"
                  placeholder="Tell the story of this instrument..."
                />
              </div>

              <div className="flex items-center justify-end gap-5 pt-8 border-t border-amber-100/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-10 py-4 bg-ink-900 text-white rounded-[1.5rem] hover:bg-black font-bold text-xs shadow-2xl shadow-ink-900/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 active:scale-95 group"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin"></span>
                      <span className="uppercase tracking-[0.1em]">Securing...</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.1em]">{editingProduct ? 'Update Collection' : 'Archive Entry'}</span>
                      <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;