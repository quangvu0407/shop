import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../customize/axios";
import { toast } from "react-toastify";
import { Trash2, Pencil, Plus, X, Tag, Truck, Globe, User } from "lucide-react";

const empty = {
  code: "",
  type: "percent",
  value: 0,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 0,
  startDate: "",
  endDate: "",
  isActive: true,
  isGlobal: true,
  assignedUsers: [],
};

const Promotion = () => {
  const [promos, setPromos] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const fetchPromos = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/promotion/list");
      if (res.success) setPromos(res.promos);
    } catch { toast.error("Không thể tải danh sách khuyến mãi"); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/user/list");
      if (res.success) setUsers(res.users);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchPromos(); fetchUsers(); }, [fetchPromos, fetchUsers]);

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      code: p.code,
      type: p.type,
      value: p.value,
      minOrderAmount: p.minOrderAmount,
      maxDiscount: p.maxDiscount,
      usageLimit: p.usageLimit,
      startDate: p.startDate?.slice(0, 10),
      endDate: p.endDate?.slice(0, 10),
      isActive: p.isActive,
      isGlobal: p.assignedUsers?.length === 0,
      assignedUsers: p.assignedUsers || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      assignedUsers: form.isGlobal ? [] : form.assignedUsers,
    };
    try {
      if (editing) {
        const res = await axiosInstance.put(`/promotion/${editing}`, payload);
        if (res.success) { toast.success("Đã cập nhật"); setShowModal(false); fetchPromos(); }
        else toast.error(res.message);
      } else {
        const res = await axiosInstance.post("/promotion/create", payload);
        if (res.success) { toast.success("Đã tạo mã"); setShowModal(false); fetchPromos(); }
        else toast.error(res.message);
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa mã khuyến mãi này?")) return;
    try {
      const res = await axiosInstance.delete(`/promotion/${id}`);
      if (res.success) { toast.success("Đã xóa"); fetchPromos(); }
      else toast.error(res.message);
    } catch (err) { toast.error(err.message); }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleUser = (userId) => {
    setForm((f) => ({
      ...f,
      assignedUsers: f.assignedUsers.includes(userId)
        ? f.assignedUsers.filter((id) => id !== userId)
        : [...f.assignedUsers, userId],
    }));
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Quản lý Khuyến mãi</h1>
          <p className="text-slate-500 text-sm mt-1">Mỗi đơn hàng áp dụng tối đa 1 mã % và 1 mã freeship</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
          <Plus size={18} /> Tạo mã
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Mã", "Loại", "Giá trị", "Đơn tối thiểu", "Giảm tối đa", "Lượt dùng", "Phạm vi", "Hiệu lực", "Trạng thái", ""].map((h) => (
                <th key={h} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {promos.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-mono font-bold text-indigo-700">{p.code}</td>
                <td className="px-4 py-3">
                  {p.type === "percent"
                    ? <span className="flex items-center gap-1 text-orange-600 font-semibold"><Tag size={14} /> Giảm %</span>
                    : <span className="flex items-center gap-1 text-green-600 font-semibold"><Truck size={14} /> Freeship</span>}
                </td>
                <td className="px-4 py-3">{p.type === "percent" ? `${p.value}%` : "—"}</td>
                <td className="px-4 py-3">${p.minOrderAmount}</td>
                <td className="px-4 py-3">{p.maxDiscount > 0 ? `$${p.maxDiscount}` : "—"}</td>
                <td className="px-4 py-3">{p.usedCount}/{p.usageLimit > 0 ? p.usageLimit : "∞"}</td>
                <td className="px-4 py-3">
                  {p.assignedUsers?.length === 0
                    ? <span className="flex items-center gap-1 text-blue-600 font-semibold"><Globe size={13} /> Global</span>
                    : <span className="flex items-center gap-1 text-purple-600 font-semibold"><User size={13} /> {p.assignedUsers.length} user</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(p.startDate).toLocaleDateString()} – {new Date(p.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {p.isActive ? "Hoạt động" : "Tắt"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 border rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 border rounded-lg hover:border-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr><td colSpan={10} className="text-center py-12 text-slate-400">Chưa có mã khuyến mãi nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-8 py-5 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black">{editing ? "Chỉnh sửa mã" : "Tạo mã khuyến mãi"}</h2>
              <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Mã code</label>
                  <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none font-mono font-bold focus:ring-2 focus:ring-indigo-400"
                    required placeholder="VD: SALE20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Loại</label>
                  <select value={form.type} onChange={(e) => set("type", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-indigo-400">
                    <option value="percent">Giảm theo %</option>
                    <option value="freeship">Miễn phí vận chuyển</option>
                  </select>
                </div>
              </div>

              {form.type === "percent" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Giảm (%)</label>
                    <input type="number" min={1} max={100} value={form.value} onChange={(e) => set("value", e.target.value)}
                      className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Giảm tối đa ($, 0=∞)</label>
                    <input type="number" min={0} value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)}
                      className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Đơn tối thiểu ($)</label>
                  <input type="number" min={0} value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Giới hạn lượt (0=∞)</label>
                  <input type="number" min={0} value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Ngày bắt đầu</label>
                  <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Ngày kết thúc</label>
                  <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400" required />
                </div>
              </div>

              {/* Phạm vi áp dụng */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Phạm vi áp dụng</label>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => set("isGlobal", true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition
                      ${form.isGlobal ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
                    <Globe size={15} /> Global
                  </button>
                  <button type="button" onClick={() => set("isGlobal", false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition
                      ${!form.isGlobal ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
                    <User size={15} /> Chọn user
                  </button>
                </div>
              </div>

              {/* Danh sách user khi chọn Assigned */}
              {!form.isGlobal && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Chọn user ({form.assignedUsers.length} đã chọn)
                  </label>
                  <div className="mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {users.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-4">Không có user</p>
                    )}
                    {users.map((u) => (
                      <label key={u._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={form.assignedUsers.includes(String(u._id))}
                          onChange={() => toggleUser(String(u._id))} className="accent-indigo-600 w-4 h-4" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)}
                  className="w-5 h-5 accent-indigo-600" />
                <span className="font-semibold text-slate-700">Kích hoạt mã</span>
              </label>

              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                {editing ? "Cập nhật" : "Tạo mã"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotion;
