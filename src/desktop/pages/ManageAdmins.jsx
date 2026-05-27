import { useEffect, useState } from "react";
import { MdAdd, MdDeleteOutline, MdEdit, MdCheck, MdClose } from "react-icons/md";
import { FiShield, FiUser } from "react-icons/fi";
import moment from "moment";

const PERMISSION_GROUPS = [
  {
    key: "task",
    label: "Tasks",
    actions: [
      { key: "create", label: "Create tasks" },
      { key: "delete", label: "Delete tasks" },
    ],
  },
  {
    key: "channel",
    label: "Channels",
    actions: [
      { key: "create", label: "Create channels" },
      { key: "delete", label: "Delete channels" },
      { key: "edit",   label: "Edit channels" },
    ],
  },
  {
    key: "salary",
    label: "Salary Sheet",
    actions: [
      { key: "upload", label: "Upload salary" },
      { key: "revoke", label: "Revoke salary" },
    ],
  },
  {
    key: "payslip",
    label: "Payslips",
    actions: [
      { key: "upload", label: "Upload payslip" },
      { key: "revoke", label: "Revoke payslip" },
    ],
  },
  {
    key: "report",
    label: "Task Reports",
    actions: [
      { key: "add",    label: "Add reports" },
      { key: "delete", label: "Delete reports" },
    ],
  },
  {
    key: "taskManagement",
    label: "Task Management",
    actions: [
      { key: "access", label: "Access task management" },
    ],
  },
];

const EMPTY_PERMISSIONS = PERMISSION_GROUPS.reduce((acc, group) => {
  acc[group.key] = group.actions.reduce((a, action) => {
    a[action.key] = false;
    return a;
  }, {});
  return acc;
}, {});

const ALL_PERMISSIONS = PERMISSION_GROUPS.reduce((acc, group) => {
  acc[group.key] = group.actions.reduce((a, action) => {
    a[action.key] = true;
    return a;
  }, {});
  return acc;
}, {});

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
      checked ? "bg-sidebar-active" : "bg-slate-200"
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${
        checked ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPerms, setEditingPerms] = useState(null); // admin being edited
  const [savingPerms, setSavingPerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [creating, setCreating] = useState(false);

  const apiBase = import.meta.env.VITE_BACKEND_API;
  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/superadmin/admins`, { headers: authHeader });
      const data = await res.json();
      if (data?.success) setAdmins(data.admins || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${apiBase}/superadmin/admins`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, permissions: EMPTY_PERMISSIONS }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed");
      setSuccess(`Admin "${form.name}" created.`);
      setForm({ name: "", email: "", phone: "", password: "" });
      setShowCreate(false);
      await fetchAdmins();
    } catch (err) { setError(err.message); }
    setCreating(false);
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Delete admin "${admin.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${apiBase}/superadmin/admins/${admin._id}`, {
        method: "DELETE", headers: authHeader,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed");
      if (selectedAdmin?._id === admin._id) setSelectedAdmin(null);
      await fetchAdmins();
    } catch (err) { alert(err.message); }
  };

  const openPermissions = (admin) => {
    setEditingPerms(JSON.parse(JSON.stringify(
      admin.permissions && Object.keys(admin.permissions).length
        ? admin.permissions
        : EMPTY_PERMISSIONS
    )));
    setSelectedAdmin(admin);
  };

  const togglePerm = (group, action, value) => {
    setEditingPerms((prev) => ({
      ...prev,
      [group]: { ...prev[group], [action]: value },
    }));
  };

  const grantAll = () => setEditingPerms(JSON.parse(JSON.stringify(ALL_PERMISSIONS)));
  const revokeAll = () => setEditingPerms(JSON.parse(JSON.stringify(EMPTY_PERMISSIONS)));

  const savePermissions = async () => {
    setSavingPerms(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${apiBase}/superadmin/admins/${selectedAdmin._id}/permissions`, {
        method: "PATCH",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: editingPerms }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed");
      setSuccess(`Permissions updated for "${selectedAdmin.name}".`);
      setAdmins((prev) => prev.map((a) => a._id === selectedAdmin._id ? { ...a, permissions: editingPerms } : a));
    } catch (err) { setError(err.message); }
    setSavingPerms(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FiShield className="text-sidebar" />
              Manage Admins
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Create admins and control their permissions</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowCreate((v) => !v); setError(""); setSuccess(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sidebar text-white text-sm font-semibold hover:opacity-90"
          >
            <MdAdd size={18} />
            {showCreate ? "Cancel" : "New Admin"}
          </button>
        </div>

        {/* Feedback */}
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">{success}</p>}

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4">Create new admin</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sidebar-active" />
              <input required type="email" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sidebar-active" />
              <input required placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sidebar-active" />
              <input required type="password" placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sidebar-active" />
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={creating}
                  className="px-5 py-2 rounded-xl bg-sidebar text-white text-sm font-semibold disabled:opacity-50">
                  {creating ? "Creating…" : "Create admin"}
                </button>
              </div>
            </form>
            <p className="text-xs text-slate-400 mt-2">New admin starts with all permissions off — grant them below after creation.</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
          {/* Admin list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Admins ({admins.length})</p>
            </div>
            {loading ? (
              <p className="text-sm text-slate-400 px-5 py-4">Loading…</p>
            ) : admins.length === 0 ? (
              <p className="text-sm text-slate-400 px-5 py-4">No admins yet. Create one above.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {admins.map((admin) => {
                  const isSelected = selectedAdmin?._id === admin._id;
                  const grantedCount = Object.values(admin.permissions || {}).reduce(
                    (sum, g) => sum + Object.values(g).filter(Boolean).length, 0
                  );
                  const totalCount = PERMISSION_GROUPS.reduce((s, g) => s + g.actions.length, 0);
                  return (
                    <li key={admin._id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-purple-50" : "hover:bg-slate-50"}`}
                      onClick={() => openPermissions(admin)}>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sidebar to-purple-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {admin.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{admin.name}</p>
                        <p className="text-xs text-slate-400 truncate">{admin.email}</p>
                        <p className="text-[10px] text-slate-400">
                          {grantedCount}/{totalCount} permissions · {moment(admin.createdAt).format("DD MMM YYYY")}
                        </p>
                      </div>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(admin); }}
                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                        <MdDeleteOutline size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Permissions editor */}
          {selectedAdmin ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-base font-bold text-slate-900">
                    {selectedAdmin.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">{selectedAdmin.email}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Toggle permissions on/off</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={grantAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100">
                    <MdCheck size={14} /> Grant all
                  </button>
                  <button type="button" onClick={revokeAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200 hover:bg-red-100">
                    <MdClose size={14} /> Revoke all
                  </button>
                  <button type="button" onClick={savePermissions} disabled={savingPerms}
                    className="px-4 py-1.5 rounded-lg bg-sidebar text-white text-xs font-bold disabled:opacity-50 hover:opacity-90">
                    {savingPerms ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {editingPerms && PERMISSION_GROUPS.map((group) => (
                  <div key={group.key} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">{group.label}</p>
                    <div className="space-y-2.5">
                      {group.actions.map((action) => (
                        <div key={action.key} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-slate-700">{action.label}</span>
                          <Toggle
                            checked={editingPerms[group.key]?.[action.key] || false}
                            onChange={(val) => togglePerm(group.key, action.key, val)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="hidden xl:flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              <div className="text-center">
                <FiUser size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select an admin to manage permissions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
