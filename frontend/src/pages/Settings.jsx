import React, { useState, useEffect } from "react";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  User,
  Store,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  CreditCard
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [storeData, setStoreData] = useState({
    storeName: "Fire Safety Tamil Nadu",
    phone: "",
    address: "",
    gstNumber: "",
    codEnabled: true
  });

  useEffect(() => {
    if (auth.currentUser) {
      setProfileData({
        displayName: auth.currentUser.displayName || "",
        email: auth.currentUser.email || "",
        newPassword: "",
        confirmPassword: ""
      });
    }
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "store"));
      if (snap.exists()) setStoreData(snap.data());
    } catch (error) {
      console.error("Error fetching store settings:", error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (profileData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profileData.displayName });
      }

      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }

      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          showMessage('error', "Passwords do not match");
          return;
        }
        await updatePassword(user, profileData.newPassword);
      }

      showMessage('success', "Profile updated successfully!");
    } catch (e) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveStore = async () => {
    try {
      setLoading(true);
      await setDoc(doc(db, "settings", "store"), storeData, { merge: true });
      showMessage('success', "Store settings saved!");
    } catch (e) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'store', label: 'Store Settings', icon: Store },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Configuration Vault</h1>
        <p className="text-slate-500 mt-1 font-medium">Fine-tune your establishment's operational parameters</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation for Settings */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden p-3">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                    ? 'bg-ink-900 text-amber-400 shadow-lg shadow-ink-900/20 translate-x-1'
                    : 'text-slate-500 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? "text-amber-400" : "text-amber-600/40"} />
                  <span className="uppercase tracking-widest text-[10px]">{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-8 p-6 bg-paper/50 rounded-2xl border border-amber-100/50">
              <h4 className="text-[9px] font-bold text-amber-900/40 uppercase tracking-[0.2em] mb-2">Vault Status</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Encryption Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5 p-8 lg:p-12 min-h-[500px]">
            {message.text && (
              <div className={`mb-8 p-5 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest border animate-in fade-in slide-in-from-top-4 duration-500 ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'error' ? 'bg-red-100' : 'bg-amber-100'}`}>
                  {message.type === 'error' ? '!' : '✓'}
                </div>
                {message.text}
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-10 max-w-2xl animate-in fade-in duration-700">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Keeper's Identity</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your administrative persona</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">Distinguished Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium shadow-sm"
                        placeholder="Master Archivist"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">Correspondence Email</label>
                    <div className="relative group">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium shadow-sm"
                        placeholder="archivist@smartfancy.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-amber-50">
                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-ink-900 text-amber-400 font-bold rounded-2xl transition-all hover:bg-black hover:shadow-2xl hover:shadow-ink-900/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 w-3 bg-amber-400/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    <span className="uppercase tracking-[0.2em] text-xs">Seal Changes</span>
                  </button>
                </div>
              </div>
            )}

            {/* Store Settings */}
            {activeTab === "store" && (
              <div className="space-y-10 max-w-2xl animate-in fade-in duration-700">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Establishment Details</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Foundational store configurations</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">Venture Title</label>
                    <input
                      type="text"
                      value={storeData.storeName}
                      onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                      className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-bold text-slate-800 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">Contact Line</label>
                      <input
                        type="tel"
                        value={storeData.phone}
                        onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">Taxation Index (GST)</label>
                      <input
                        type="text"
                        value={storeData.gstNumber}
                        onChange={(e) => setStoreData({ ...storeData, gstNumber: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-mono shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">Principal Headquarters</label>
                    <textarea
                      rows={4}
                      value={storeData.address}
                      onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                      className="w-full px-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium shadow-sm resize-none"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-amber-50">
                  <button
                    onClick={saveStore}
                    disabled={loading}
                    className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-ink-900 text-amber-400 font-bold rounded-2xl transition-all hover:bg-black hover:shadow-2xl hover:shadow-ink-900/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 w-3 bg-amber-400/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    <span className="uppercase tracking-[0.2em] text-xs">Authorize Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-10 max-w-2xl animate-in fade-in duration-700">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>Defensive Measures</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cryptography & access control</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">New Cipher Sequence</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                      <input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium shadow-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em] ml-1">Authenticate Sequence</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                      <input
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-white border border-amber-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm font-medium shadow-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-amber-50">
                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-ink-900 text-amber-400 font-bold rounded-2xl transition-all hover:bg-black hover:shadow-2xl hover:shadow-ink-900/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 w-3 bg-amber-400/10 -skew-x-12 translate-x-[-200%] group-hover:animate-shimmer"></div>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    <span className="uppercase tracking-[0.2em] text-xs">Rotate Ciphers</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
