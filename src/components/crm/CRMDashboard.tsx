import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, MessageSquare, TrendingUp, Filter, Search,
  Plus, Download, Edit2, Trash2, ChevronDown, ChevronUp,
  Tag, LogOut, Settings, X, Check, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { API_BASE_URL } from '@/lib/api';

/* ─── Types ───────────────────────────────────────────────────────── */
type Status = 'contacted' | 'interested' | 'no_updates' | 'conversion';

interface Student {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  college: string | null;
  course: string | null;
  batch_year: string | null;
  status: Status;
  assigned_intern_id: number | null;
  intern_code: string | null;
  notes: string | null;
  assigned_intern_name?: string | null;
}

interface InternOption {
  id: number;
  name: string;
  intern_code: string;
}

/* ─── Constants ───────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  contacted:  { label: 'Contacted',  color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200', icon: <MessageSquare className="w-4 h-4" /> },
  interested: { label: 'Interested', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200', icon: <TrendingUp className="w-4 h-4" /> },
  no_updates: { label: 'No Updates', color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200', icon: <AlertCircle className="w-4 h-4" /> },
  conversion: { label: 'Conversion', color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200',icon: <UserCheck className="w-4 h-4" /> },
};

const ALL_STATUSES: Status[] = ['contacted', 'interested', 'no_updates', 'conversion'];

/* ─── Toast ───────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium transition-all ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ─── Edit Student Modal ──────────────────────────────────────────── */
function EditStudentModal({ student, interns, token, onClose, onSaved }: {
  student: Student; interns: InternOption[]; token: string; onClose: () => void; onSaved: (s: Student) => void;
}) {
  const [form, setForm] = useState({ ...student });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!form.name.trim()) { setErr('Name is required'); return; }
    setSaving(true); setErr('');
    try {
      const r = await fetch(`${API_BASE_URL}/crm/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      onSaved(d.student);
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[['name','Name *'], ['email','Email'], ['phone','Phone'], ['college','College'], ['course','Course'], ['batch_year','Batch/Year']].map(([k, label]) => (
            <div key={k} className={k === 'name' || k === 'college' ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(form as any)[k] || ''} onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as Status }))}>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Intern</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.assigned_intern_id ?? ''} onChange={e => setForm(prev => ({ ...prev, assigned_intern_id: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">None</option>
              {interns.map(i => <option key={i.id} value={i.id}>{i.name} ({i.intern_code})</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={form.notes || ''} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
          {err && <p className="col-span-2 text-red-600 text-sm">{err}</p>}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-3 h-3 animate-spin" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Student Row ─────────────────────────────────────────────────── */
function StudentRow({ student, interns, isAdmin, internCode, token, onUpdated, onDeleted }: {
  student: Student; interns: InternOption[]; isAdmin: boolean; internCode: string | null;
  token: string; onUpdated: (s: Student) => void; onDeleted: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [applyingCode, setApplyingCode] = useState(false);

  const changeStatus = async (newStatus: Status) => {
    if (newStatus === student.status) return;
    setStatusChanging(true);
    const prev = student.status;
    // Optimistic update
    onUpdated({ ...student, status: newStatus });
    try {
      const r = await fetch(`${API_BASE_URL}/crm/students/${student.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!r.ok) throw new Error();
    } catch { onUpdated({ ...student, status: prev }); }
    finally { setStatusChanging(false); }
  };

  const applyCode = async () => {
    setApplyingCode(true);
    try {
      const r = await fetch(`${API_BASE_URL}/crm/students/${student.id}/intern-code`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ intern_code: internCode }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      onUpdated({ ...student, intern_code: d.intern_code });
    } catch { }
    finally { setApplyingCode(false); }
  };

  const deleteStudent = async () => {
    if (!window.confirm(`Delete "${student.name}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API_BASE_URL}/crm/students/${student.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      onDeleted(student.id);
    } catch { }
  };

  const td = 'px-4 py-3 text-sm text-gray-700 align-top';
  const truncate = (s: string | null, n = 22) => s ? (s.length > n ? s.slice(0, n) + '…' : s) : <span className="text-gray-300">—</span>;

  return (
    <>
      {editing && (
        <EditStudentModal
          student={student} interns={interns} token={token}
          onClose={() => setEditing(false)}
          onSaved={s => { onUpdated(s); setEditing(false); }}
        />
      )}
      <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
        <td className={td + ' font-semibold text-gray-900'}>{truncate(student.name, 20)}</td>
        <td className={td + ' text-blue-600'}>{truncate(student.email, 22)}</td>
        <td className={td}>{truncate(student.phone, 14)}</td>
        <td className={td}>{truncate(student.college, 18)}</td>
        <td className={td}>{truncate(student.course, 15)}</td>
        <td className={td}>{student.batch_year || <span className="text-gray-300">—</span>}</td>
        <td className={td}>{student.assigned_intern_name || student.intern_code || <span className="text-gray-300">—</span>}</td>
        <td className={td}>
          {student.intern_code
            ? <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">{student.intern_code}</span>
            : (internCode && !isAdmin
              ? <button onClick={applyCode} disabled={applyingCode}
                  className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
                  {applyingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />} Apply Mine
                </button>
              : <span className="text-gray-300">—</span>)
          }
        </td>
        <td className={td + ' max-w-[140px]'}>
          <span title={student.notes || ''} className="line-clamp-2 text-xs text-gray-500">{student.notes || <span className="text-gray-300">—</span>}</span>
        </td>
        <td className={td}>
          <select
            value={student.status}
            disabled={statusChanging}
            onChange={e => changeStatus(e.target.value as Status)}
            className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 ${STATUS_CONFIG[student.status].bg} ${STATUS_CONFIG[student.status].color} font-semibold cursor-pointer`}
          >
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
        </td>
        <td className={td}>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button onClick={() => setEditing(true)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={deleteStudent} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

/* ─── Status Table Section ────────────────────────────────────────── */
function StatusSection({ status, students, interns, isAdmin, internCode, token, onUpdated, onDeleted }: {
  status: Status; students: Student[]; interns: InternOption[]; isAdmin: boolean; internCode: string | null;
  token: string; onUpdated: (s: Student) => void; onDeleted: (id: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const cfg = STATUS_CONFIG[status];

  return (
    <div id={`section-${status}`} className={`rounded-2xl border ${cfg.border} overflow-hidden shadow-sm`}>
      <button
        onClick={() => setCollapsed(c => !c)}
        className={`w-full flex items-center justify-between px-6 py-4 ${cfg.bg} ${cfg.color} font-bold text-sm`}
      >
        <div className="flex items-center gap-2">
          {cfg.icon}
          <span>{cfg.label}</span>
          <span className={`ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/60 ${cfg.color}`}>{students.length}</span>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {!collapsed && (
        students.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No students in this category yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Name','Email','Phone','College','Course','Batch','Intern','Code','Notes','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <StudentRow key={s.id} student={s} interns={interns} isAdmin={isAdmin}
                    internCode={internCode} token={token} onUpdated={onUpdated} onDeleted={onDeleted} />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────────── */
export default function CRMDashboard() {
  const { user, token, isAdmin, internCode, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [interns, setInterns] = useState<InternOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status[]>([]);
  const [internFilter, setInternFilter] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (internFilter) params.set('intern_id', internFilter);
      const r = await fetch(`${API_BASE_URL}/crm/students?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch { showToast('Failed to load students', 'error'); }
    finally { setLoading(false); }
  }, [token, search, internFilter]);

  const fetchInterns = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const r = await fetch(`${API_BASE_URL}/crm/interns`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setInterns(Array.isArray(data) ? data : []);
    } catch { }
  }, [token, isAdmin]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { fetchInterns(); }, [fetchInterns]);

  // Debounce search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => fetchStudents(), 400);
  };

  const onUpdated = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  };
  const onDeleted = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast('Student deleted');
  };

  const filteredStudents = students.filter(s => {
    if (statusFilter.length > 0 && !statusFilter.includes(s.status)) return false;
    return true;
  });

  const byStatus = (st: Status) => filteredStudents.filter(s => s.status === st);

  const counts = ALL_STATUSES.reduce((acc, st) => {
    acc[st] = students.filter(s => s.status === st).length;
    return acc;
  }, {} as Record<Status, number>);

  const exportPDF = async () => {
    if (!token) return;
    setExporting(true);
    try {
      const r = await fetch(`${API_BASE_URL}/crm/students/export/pdf`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `students-export-${Date.now()}.pdf`; a.click();
      URL.revokeObjectURL(url);
      showToast('PDF exported successfully');
    } catch { showToast('Export failed', 'error'); }
    finally { setExporting(false); }
  };

  const toggleStatusFilter = (st: Status) => {
    setStatusFilter(prev => prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar-style top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">NSV CRM</h1>
                <p className="text-xs text-gray-400">Student Management</p>
              </div>
            </div>
            {isAdmin && (
              <nav className="flex items-center gap-1 ml-4">
                <Link to="/crm" className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">Dashboard</Link>
                <Link to="/crm/interns" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Intern Management</Link>
                <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 inline -mt-0.5 mr-1" />Admin Panel
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{user?.name}</span>
              <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>
                {isAdmin ? 'Admin' : 'Intern'}
              </span>
              {internCode && <span className="ml-1 text-xs text-gray-400">({internCode})</span>}
            </span>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ALL_STATUSES.map(st => {
            const cfg = STATUS_CONFIG[st];
            return (
              <button key={st} onClick={() => document.getElementById(`section-${st}`)?.scrollIntoView({ behavior: 'smooth' })}
                className={`p-5 rounded-2xl border ${cfg.border} ${cfg.bg} text-left hover:shadow-md transition-all group`}>
                <div className={`flex items-center justify-between mb-3`}>
                  <div className={`p-2 rounded-xl bg-white/80 ${cfg.color}`}>{cfg.icon}</div>
                  <span className={`text-3xl font-black ${cfg.color}`}>{counts[st]}</span>
                </div>
                <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input placeholder="Search name, email, college, course…" value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center"><Filter className="w-3 h-3 inline mr-1" />Status:</span>
            {ALL_STATUSES.map(st => {
              const active = statusFilter.includes(st);
              const cfg = STATUS_CONFIG[st];
              return (
                <button key={st} onClick={() => toggleStatusFilter(st)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {cfg.label}
                </button>
              );
            })}
            {statusFilter.length > 0 && (
              <button onClick={() => setStatusFilter([])} className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
            )}
          </div>

          {isAdmin && interns.length > 0 && (
            <select value={internFilter} onChange={e => setInternFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All interns</option>
              {interns.map(i => <option key={i.id} value={i.id}>{i.name} ({i.intern_code})</option>)}
            </select>
          )}

          <div className="ml-auto flex gap-2">
            {isAdmin && (
              <>
                <button onClick={exportPDF} disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export PDF
                </button>
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                  <Plus className="w-4 h-4" /> Add Students
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tables */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {ALL_STATUSES.map(st => (
              <StatusSection key={st} status={st} students={byStatus(st)} interns={interns}
                isAdmin={isAdmin} internCode={internCode} token={token!}
                onUpdated={onUpdated} onDeleted={(id) => { onDeleted(id); showToast('Student deleted'); }} />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddStudentModal token={token!} onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchStudents(); showToast('Students added successfully'); }} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ─── Add Student Modal ───────────────────────────────────────────── */
function AddStudentModal({ token, onClose, onSuccess }: { token: string; onClose: () => void; onSuccess: () => void }) {
  const [tab, setTab] = useState<'manual'|'csv'|'pdf'>('manual');
  const [form, setForm] = useState({ name:'', email:'', phone:'', college:'', course:'', batch_year:'', status:'no_updates', notes:'' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<any[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState(false);

  const saveManual = async () => {
    if (!form.name.trim()) { setErr('Name is required'); return; }
    setSaving(true); setErr('');
    try {
      const r = await fetch(`${API_BASE_URL}/crm/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      onSuccess();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const previewFile = async () => {
    if (!file) return;
    setPreviewing(true); setPreview([]); setParseErrors([]);
    const fd = new FormData();
    fd.append('file', file);
    const endpoint = tab === 'csv' ? 'upload/csv' : 'upload/pdf';
    try {
      const r = await fetch(`${API_BASE_URL}/crm/students/${endpoint}?preview=true`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPreview(d.preview || []);
      setParseErrors(d.errors || []);
      setSelectedRows(new Set(d.preview?.map((_: any, i: number) => i)));
    } catch (e: any) { setErr(e.message); }
    finally { setPreviewing(false); }
  };

  const submitUpload = async () => {
    if (!file) return;
    const rows = preview.filter((_, i) => selectedRows.has(i));
    if (rows.length === 0) { setErr('No rows selected'); return; }
    setUploading(true); setErr('');
    // Build a new CSV from selected rows and upload
    const headers = ['name','email','phone','college','course','batch_year','status','notes'];
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const fd = new FormData();
    fd.append('file', new File([blob], 'selected.csv', { type: 'text/csv' }));
    try {
      const r = await fetch(`${API_BASE_URL}/crm/students/upload/csv`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      onSuccess();
    } catch (e: any) { setErr(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add Students</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {(['manual','csv','pdf'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setFile(null); setPreview([]); setErr(''); }}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'manual' ? 'Manual Entry' : t === 'csv' ? 'CSV Upload' : 'PDF Upload'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'manual' && (
            <div className="grid grid-cols-2 gap-4">
              {[['name','Name *'], ['email','Email'], ['phone','Phone'], ['college','College'], ['course','Course'], ['batch_year','Batch/Year']].map(([k, label]) => (
                <div key={k} className={k === 'name' || k === 'college' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              {err && <p className="col-span-2 text-red-600 text-sm">{err}</p>}
              <div className="col-span-2 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveManual} disabled={saving} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />} Add Student
                </button>
              </div>
            </div>
          )}

          {(tab === 'csv' || tab === 'pdf') && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <input type="file" id="fileUpload" accept={tab === 'csv' ? '.csv' : '.pdf'}
                  className="hidden" onChange={e => { setFile(e.target.files?.[0] || null); setPreview([]); }} />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <Plus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{file ? file.name : `Click to upload a .${tab} file`}</p>
                  <p className="text-xs text-gray-400 mt-1">{tab === 'csv' ? 'Columns: name, email, phone, college, course, batch_year, status, notes' : 'PDF with structured student data'}</p>
                </label>
              </div>
              {file && preview.length === 0 && (
                <button onClick={previewFile} disabled={previewing}
                  className="w-full py-2.5 text-sm bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {previewing && <Loader2 className="w-4 h-4 animate-spin" />} Preview Rows
                </button>
              )}
              {parseErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  <strong>{parseErrors.length} row(s) skipped:</strong>
                  {parseErrors.slice(0, 5).map((e, i) => <p key={i}>Row {e.row}: {e.reason}</p>)}
                </div>
              )}
              {preview.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">{preview.length} rows parsed — deselect any you don't want to import</p>
                    <button onClick={() => setSelectedRows(prev => prev.size === preview.length ? new Set() : new Set(preview.map((_, i) => i)))}
                      className="text-xs text-blue-600 underline">Toggle all</button>
                  </div>
                  <div className="overflow-x-auto max-h-64 rounded-xl border border-gray-200">
                    <table className="w-full text-xs min-w-[600px]">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">✓</th>
                          {['name','email','college','course','status'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className={`border-b border-gray-100 ${selectedRows.has(i) ? '' : 'opacity-40 line-through'} ${(row as any)._uncertain ? 'bg-amber-50' : ''}`}>
                            <td className="px-3 py-2">
                              <input type="checkbox" checked={selectedRows.has(i)}
                                onChange={e => setSelectedRows(prev => { const next = new Set(prev); e.target.checked ? next.add(i) : next.delete(i); return next; })} />
                            </td>
                            {['name','email','college','course','status'].map(h => <td key={h} className="px-3 py-2 text-gray-700">{(row as any)[h] || '—'}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {err && <p className="text-red-600 text-sm">{err}</p>}
                  <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={submitUpload} disabled={uploading || selectedRows.size === 0}
                      className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                      {uploading && <Loader2 className="w-3 h-3 animate-spin" />} Import {selectedRows.size} Row{selectedRows.size !== 1 ? 's' : ''}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
