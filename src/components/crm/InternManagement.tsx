import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Plus, UserPlus, Trash2, Copy, Eye, EyeOff,
  ArrowLeft, Loader2, X, Check, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { API_BASE_URL } from '@/lib/api';

interface Intern {
  id: number;
  name: string;
  email: string;
  intern_code: string;
  student_count?: number;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
    </div>
  );
}

function generateInternCode(name: string): string {
  const prefix = name.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'INT';
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}${num}`;
}

export default function InternManagement() {
  const { token } = useAuth();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [revealing, setRevealing] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);

  // New intern form
  const [form, setForm] = useState({ name: '', email: '', password: '', intern_code: '' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const fetchInterns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/crm/interns`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setInterns(Array.isArray(data) ? data.filter((i: any) => i && typeof i.id === 'number') : []);
    } catch { showToast('Failed to load interns', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchInterns(); }, [fetchInterns]);

  const autoCode = () => setForm(prev => ({ ...prev, intern_code: generateInternCode(prev.name) }));

  const addIntern = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.intern_code.trim()) {
      setFormErr('All fields are required'); return;
    }
    setSaving(true); setFormErr('');
    try {
      const r = await fetch(`${API_BASE_URL}/crm/interns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to create intern');
      showToast(`Intern ${form.name} created`);
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', intern_code: '' });
      fetchInterns();
    } catch (e: any) { setFormErr(e.message); }
    finally { setSaving(false); }
  };

  const deleteIntern = async (id: number, name: string) => {
    if (!window.confirm(`Remove intern "${name}"? Their assigned students will be unassigned.`)) return;
    try {
      const r = await fetch(`${API_BASE_URL}/crm/interns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      setInterns(prev => prev.filter(i => i.id !== id));
      showToast(`${name} removed`);
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/crm" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Intern Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchInterns} disabled={loading} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <UserPlus className="w-4 h-4" /> Add Intern
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 opacity-80" />
            <h2 className="text-lg font-bold">Intern Overview</h2>
          </div>
          <div className="text-4xl font-black mb-1">{interns.length}</div>
          <div className="text-blue-200 text-sm">Active interns with unique referral codes</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : interns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No interns yet</h3>
            <p className="text-gray-400 text-sm mb-5">Add your first intern to start tracking student assignments.</p>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add First Intern
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {interns.map(intern => (
              <div key={intern.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{intern.name}</h3>
                    <p className="text-sm text-gray-500">{intern.email}</p>
                  </div>
                  <button onClick={() => deleteIntern(intern.id, intern.name)}
                    className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Intern Code</p>
                    <p className="font-mono font-bold text-indigo-700 text-lg tracking-widest">
                      {revealing.has(intern.id)
                        ? (intern.intern_code ?? '—')
                        : '•'.repeat((intern.intern_code ?? '').length || 6)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setRevealing(prev => { const next = new Set(prev); prev.has(intern.id) ? next.delete(intern.id) : next.add(intern.id); return next; })}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                      {revealing.has(intern.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => copyCode(intern.id, intern.intern_code)}
                      className={`p-2 rounded-lg transition-colors ${copied === intern.id ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600 hover:bg-white'}`}>
                      {copied === intern.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {typeof intern.student_count === 'number' && (
                  <p className="text-xs text-gray-400 mt-3 text-right">
                    {intern.student_count} student{intern.student_count !== 1 ? 's' : ''} assigned
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add intern modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Intern</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[['name','Full Name'], ['email','Email Address'], ['password','Temporary Password']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={k === 'password' ? 'password' : 'text'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={(form as any)[k]}
                    onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))}
                    onBlur={k === 'name' && !form.intern_code ? autoCode : undefined}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intern Code</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.intern_code}
                    onChange={e => setForm(prev => ({ ...prev, intern_code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. RAJ042"
                  />
                  <button onClick={autoCode} title="Auto-generate"
                    className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {formErr && <p className="text-red-600 text-sm">{formErr}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={addIntern} disabled={saving}
                  className="flex-1 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />} Create Intern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
