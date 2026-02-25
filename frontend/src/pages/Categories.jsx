import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, FolderTree, Search } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const categoriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategory.trim(),
        createdAt: new Date()
      });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category", error);
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Classification Archives</h1>
        <p className="text-slate-500 mt-1 font-medium">Organize your collection by speciality and grade</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Add Category Form - Redesigned as a Premium Card */}
        <div className="lg:col-span-1">
          <div className="bg-paper rounded-[2rem] shadow-xl shadow-amber-900/5 border border-amber-100 p-8 sticky top-6">
            <div className="w-14 h-14 rounded-2xl bg-ink-900 text-white flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
              <Plus size={28} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              Define Specialty
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6 border-b border-amber-100 pb-4">New Archive Entry</p>

            <form onSubmit={handleAddCategory}>
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Designation Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner"
                  placeholder="e.g. Fine Paper"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink-900 hover:bg-black text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold shadow-xl shadow-ink-900/20 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-95"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin"></span>
                    <span className="uppercase tracking-widest text-[10px]">Recording...</span>
                  </>
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-[10px]">Archive Category</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Category List - Dressing up as indexed records */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-amber-100/50 shadow-sm">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Locate specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium placeholder:text-slate-200 shadow-sm"
              />
            </div>
            <div className="px-5 py-2.5 bg-paper rounded-xl text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] border border-amber-100">
              {filteredCategories.length} Records
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden">
            <div className="divide-y divide-amber-50">
              {filteredCategories.length === 0 ? (
                <div className="p-20 text-center bg-paper/20">
                  <div className="bg-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-inner">
                    <FolderTree size={40} className="text-amber-200" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-xl mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Archives Vacant</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                    {searchTerm ? "The index does not contain this designation. Seek another?" : "The catalogue is ready for its first classification."}
                  </p>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="p-6 flex items-center justify-between hover:bg-amber-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-100 shadow-sm group-hover:scale-110 transition-transform">
                        <FolderTree size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-700 transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>{category.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Registered: {category.createdAt?.seconds ? new Date(category.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Archive'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-transparent hover:border-red-100 shadow-sm bg-white"
                      title="Decommission Specialty"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Categories;
