import { useEffect, useState, useCallback } from "react";
import { MdAdd, MdDeleteOutline, MdCheck, MdClose } from "react-icons/md";
import { FiShield, FiUser, FiUsers, FiHash, FiSearch } from "react-icons/fi";
import Avatar from "../Components/Common/Avatar";
import moment from "moment";

// ─── Permission groups ────────────────────────────────────────────────────────

const SIDEBAR_PERMS = [
  { key: "notes",        label: "Notes",        icon: "📝" },
  { key: "callbacks",    label: "Callbacks",     icon: "📞" },
  { key: "attendance",   label: "Attendance",    icon: "📅" },
  { key: "transfer",     label: "Transfer",      icon: "🔄" },
  { key: "sales",        label: "Sales",         icon: "💼" },
  { key: "activity",     label: "Activity",      icon: "👥" },
  { key: "concern",      label: "Concerns",      icon: "🔔" },
  { key: "notification", label: "Notifications", icon: "🔔" },
  { key: "tasks",        label: "Tasks",         icon: "✅" },
  { key: "salary",       label: "Salary",        icon: "💰" },
];

const ACTION_PERMS = [
  { group: "task",        actions: [{ key: "create", label: "Create tasks" }, { key: "delete", label: "Delete tasks" }], label: "Tasks" },
  { group: "channel",     actions: [{ key: "create", label: "Create channels" }, { key: "delete", label: "Delete channels" }, { key: "edit", label: "Edit channels" }], label: "Channels" },
  { group: "salarySheet", actions: [{ key: "upload", label: "Upload salary" }, { key: "revoke", label: "Revoke salary" }], label: "Salary Sheet" },
  { group: "payslip",     actions: [{ key: "upload", label: "Upload payslip" }, { key: "revoke", label: "Revoke payslip" }], label: "Payslips" },
  { group: "report",      actions: [{ key: "add", label: "Add reports" }, { key: "delete", label: "Delete reports" }], label: "Reports" },
  { group: "taskManagement", actions: [{ key: "access", label: "Access task management" }], label: "Task Mgmt" },
  { group: "employee",    actions: [{ key: "create", label: "Create employee" }, { key: "edit", label: "Edit employee" }, { key: "delete", label: "Delete employee" }], label: "Employee Mgmt" },
];

const EMPTY_PERMS = {
  notes: { access: false }, callbacks: { access: false }, attendance: { access: false },
  transfer: { access: false }, sales: { access: false }, activity: { access: false },
  concern: { access: false }, notification: { access: false }, tasks: { access: false },
  salary: { access: false },
  task: { create: false, delete: false },
  channel: { create: false, delete: false, edit: false },
  salarySheet: { upload: false, revoke: false },
  payslip: { upload: false, revoke: false },
  report: { add: false, delete: false },
  taskManagement: { access: false },
  employee: { create: false, edit: false, delete: false },
};

// ─── Toggle component ─────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange, size = "md" }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex shrink-0 items-center rounded-full transition-colors ${
      checked ? "bg-sidebar-active" : "bg-slate-200"
    } ${size === "sm" ? "h-4 w-7" : "h-5 w-9"}`}
  >
    <span className={`inline-block rounded-full bg-white shadow transform transition-transform ${
      size === "sm"
        ? `h-3 w-3 ${checked ? "translate-x-3.5" : "translate-x-0.5"}`
        : `h-3.5 w-3.5 ${checked ? "translate-x-5" : "translate-x-1"}`
    }`} />
  </button>
);

// ─── Searchable multi-select picker ──────────────────────────────────────────

function Picker({ items, selected, onToggle, label, icon: Icon, idKey = "_id", nameKey = "name", imageKey = "avatar" }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) =>
    !search || i[nameKey]?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <Icon size={14} className="text-slate-400 shrink-0" />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex-1">{label}</span>
        <span className="text-[11px] text-slate-400">{selected.length} selected</span>
      </div>
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
          <FiSearch size={13} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="text-[13px] flex-1 focus:outline-none placeholder-slate-400"
          />
        </div>
      </div>
      <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <li className="px-3 py-3 text-[13px] text-slate-400 text-center">No results</li>
        ) : filtered.map((item) => {
          const isSelected = selected.includes(item[idKey]);
          return (
            <li key={item[idKey]}
              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${isSelected ? "bg-purple-50" : "hover:bg-slate-50"}`}
              onClick={() => onToggle(item[idKey])}>
              <Avatar name={item[nameKey]} src={item[imageKey] || ""} size={28} fit={imageKey === "image" ? "contain" : "cover"} />
              <span className="text-[13px] text-slate-700 flex-1 truncate">{item[nameKey]}</span>
              {isSelected && <MdCheck size={16} className="text-sidebar-active shrink-0" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("sidebar"); // sidebar | actions | scope
  const [showCreate, setShowCreate] = useState(false);
  const [editingPerms, setEditingPerms] = useState(null);
  const [editingScope, setEditingScope] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [creating, setCreating] = useState(false);

  const apiBase = import.meta.env.VITE_BACKEND_API;
  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/superadmin/admins`, { headers: authHeader });
      const data = await res.json();
      if (data?.success) setAdmins(data.admins || []);
    } catch (_) {}
    setLoading(false);
  }, []);

  const fetchPickerData = useCallback(async () => {
    try {
      const [empRes, chRes] = await Promise.all([
        fetch(`${apiBase}/superadmin/all-employees`, { headers: authHeader }),
        fetch(`${apiBase}/superadmin/all-channels`, { headers: authHeader }),
      ]);
      const [empData, chData] = await Promise.all([empRes.json(), chRes.json()]);
      if (empData?.success) setAllEmployees(empData.users || []);
      if (chData?.success) setAllChannels(chData.channels || []);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchAdmins(); fetchPickerData(); }, []);

  const openAdmin = (admin) => {
    setSelected(admin);
    setActiveTab("sidebar");
    setEditingPerms(JSON.parse(JSON.stringify(admin.permissions && Object.keys(admin.permissions).length ? admin.permissions : EMPTY_PERMS)));
    setEditingScope({
      allEmployees: admin.allEmployees !== false,
      allowedEmployees: (admin.allowedEmployees || []).map((id) => id._id || id.toString()),
      allChannels: admin.allChannels !== false,
      allowedChannels: (admin.allowedChannels || []).map((id) => id._id || id.toString()),
    });
    setError(""); setSuccess("");
  };

  const togglePerm = (group, action, value) => {
    setEditingPerms((prev) => ({ ...prev, [group]: { ...prev[group], [action]: value } }));
  };

  const grantAll = () => {
    const all = JSON.parse(JSON.stringify(EMPTY_PERMS));
    SIDEBAR_PERMS.forEach((p) => { all[p.key] = { access: true }; });
    ACTION_PERMS.forEach((g) => {
      g.actions.forEach((a) => { if (!all[g.group]) all[g.group] = {}; all[g.group][a.key] = true; });
    });
    setEditingPerms(all);
  };
  const revokeAll = () => setEditingPerms(JSON.parse(JSON.stringify(EMPTY_PERMS)));

  const savePermissions = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${apiBase}/superadmin/admins/${selected._id}/permissions`, {
        method: "PATCH",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: editingPerms }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed");
      setAdmins((prev) => prev.map((a) => a._id === selected._id ? { ...a, permissions: editingPerms } : a));
      setSuccess("Permissions saved.");
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const saveScope = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${apiBase}/superadmin/admins/${selected._id}/scope`, {
        method: "PATCH",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify(editingScope),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed");
      setAdmins((prev) => prev.map((a) => a._id === selected._id ? { ...a, ...editingScope } : a));
      setSuccess("Scope saved.");
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const toggleEmployee = (id) => {
    setEditingScope((prev) => ({
      ...prev,
      allowedEmployees: prev.allowedEmployees.includes(id)
        ? prev.allowedEmployees.filter((e) => e !== id)
        : [...prev.allowedEmployees, id],
    }));
  };

  const toggleChannel = (id) => {
    setEditingScope((prev) => ({
      ...prev,
      allowedChannels: prev.allowedChannels.includes(id)
        ? prev.allowedChannels.filter((c) => c !== id)
        : [...prev.allowedChannels, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${apiBase}/superadmin/admins`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, permissions: EMPTY_PERMS }),
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
    if (!window.confirm(`Delete admin "${admin.name}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/superadmin/admins/${admin._id}`, { method: "DELETE", headers: authHeader });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed");
      if (selected?._id === admin._id) setSelected(null);
      await fetchAdmins();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FiShield className="text-sidebar" /> Manage Admins
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Create admins and control their access</p>
          </div>
          <button type="button" onClick={() => { setShowCreate((v) => !v); setError(""); setSuccess(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sidebar text-white text-sm font-semibold hover:opacity-90">
            <MdAdd size={18} />{showCreate ? "Cancel" : "New Admin"}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">{success}</p>}

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4">Create new admin</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[["Full name", "name", "text"], ["Email", "email", "email"], ["Phone", "phone", "text"], ["Password", "password", "password"]].map(([ph, key, type]) => (
                <input key={key} required type={type} placeholder={ph} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sidebar-active" />
              ))}
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={creating}
                  className="px-5 py-2 rounded-xl bg-sidebar text-white text-sm font-semibold disabled:opacity-50">
                  {creating ? "Creating…" : "Create admin"}
                </button>
              </div>
            </form>
            <p className="text-xs text-slate-400 mt-2">New admin starts with all permissions off.</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
          {/* Admin list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Admins ({admins.length})</p>
            </div>
            {loading ? (
              <p className="text-sm text-slate-400 px-5 py-4">Loading…</p>
            ) : admins.length === 0 ? (
              <p className="text-sm text-slate-400 px-5 py-4">No admins yet.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {admins.map((admin) => {
                  const isSelected = selected?._id === admin._id;
                  return (
                    <li key={admin._id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-purple-50" : "hover:bg-slate-50"}`}
                      onClick={() => openAdmin(admin)}>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sidebar to-purple-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {admin.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{admin.name}</p>
                        <p className="text-xs text-slate-400 truncate">{admin.email}</p>
                        <p className="text-[10px] text-slate-400">{moment(admin.createdAt).format("DD MMM YYYY")}</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(admin); }}
                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                        <MdDeleteOutline size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Editor */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Admin header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-base font-bold text-slate-900">{selected.name}</p>
                  <p className="text-xs text-slate-400">{selected.email}</p>
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
                  <button type="button"
                    onClick={activeTab === "scope" ? saveScope : savePermissions}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-lg bg-sidebar text-white text-xs font-bold disabled:opacity-50 hover:opacity-90">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                {[
                  { key: "sidebar", label: "Sidebar Access", icon: FiShield },
                  { key: "actions", label: "Action Permissions", icon: MdCheck },
                  { key: "scope", label: "Employee & Channel Scope", icon: FiUsers },
                ].map((tab) => (
                  <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-sidebar text-sidebar"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}>
                    <tab.icon size={13} />{tab.label}
                  </button>
                ))}
              </div>

              {/* Sidebar Access tab */}
              {activeTab === "sidebar" && editingPerms && (
                <div className="p-5">
                  <p className="text-xs text-slate-400 mb-4">Control which navigation items this admin can see in the sidebar.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SIDEBAR_PERMS.map((p) => (
                      <div key={p.key} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <span className="text-sm text-slate-700 flex items-center gap-2">
                          <span>{p.icon}</span>{p.label}
                        </span>
                        <Toggle
                          checked={editingPerms[p.key]?.access || false}
                          onChange={(val) => togglePerm(p.key, "access", val)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Permissions tab */}
              {activeTab === "actions" && editingPerms && (
                <div className="p-5">
                  <p className="text-xs text-slate-400 mb-4">Control what actions this admin can perform.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ACTION_PERMS.map((group) => (
                      <div key={group.group} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">{group.label}</p>
                        <div className="space-y-2.5">
                          {group.actions.map((action) => (
                            <div key={action.key} className="flex items-center justify-between gap-2">
                              <span className="text-sm text-slate-700">{action.label}</span>
                              <Toggle
                                checked={editingPerms[group.group]?.[action.key] || false}
                                onChange={(val) => togglePerm(group.group, action.key, val)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scope tab */}
              {activeTab === "scope" && editingScope && (
                <div className="p-5 space-y-5">
                  <p className="text-xs text-slate-400">Control which employees and channels this admin can see and manage.</p>

                  {/* Employee scope */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <FiUsers size={14} /> Employee Access
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Which employees this admin can manage</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{editingScope.allEmployees ? "All employees" : `${editingScope.allowedEmployees.length} selected`}</span>
                        <Toggle
                          checked={editingScope.allEmployees}
                          onChange={(val) => setEditingScope((prev) => ({ ...prev, allEmployees: val }))}
                        />
                        <span className="text-xs text-slate-400">Full access</span>
                      </div>
                    </div>
                    {!editingScope.allEmployees && (
                      <Picker
                        items={allEmployees}
                        selected={editingScope.allowedEmployees}
                        onToggle={toggleEmployee}
                        label="Employees"
                        icon={FiUsers}
                      />
                    )}
                  </div>

                  {/* Channel scope */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <FiHash size={14} /> Channel Access
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Which channels this admin can see</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{editingScope.allChannels ? "All channels" : `${editingScope.allowedChannels.length} selected`}</span>
                        <Toggle
                          checked={editingScope.allChannels}
                          onChange={(val) => setEditingScope((prev) => ({ ...prev, allChannels: val }))}
                        />
                        <span className="text-xs text-slate-400">Full access</span>
                      </div>
                    </div>
                    {!editingScope.allChannels && (
                      <Picker
                        items={allChannels}
                        selected={editingScope.allowedChannels}
                        onToggle={toggleChannel}
                        label="Channels"
                        icon={FiHash}
                        imageKey="image"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden xl:flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              <div className="text-center">
                <FiUser size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select an admin from the list to manage</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
