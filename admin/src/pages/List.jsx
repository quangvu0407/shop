import axiosInstance from "../customize/axios";
import { useEffect, useState, useCallback } from "react";
import { currency } from "../App";
import { toast } from "react-toastify";
import {
  Pencil, Trash2, X, User, Users, Baby,
  CheckCircle2, Search, ArrowUpDown, Tag, ChevronLeft, ChevronRight
} from "lucide-react";

const LIMIT = 15;

const List = () => {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortConfig, setSortConfig] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Women");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);

  const categories = ["Women", "Men", "Kids"];
  const subCategories = ["Topwear", "Bottomwear", "Winterwear"];

  const fetchList = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filterCategory) params.append("category", filterCategory);
      if (filterSubcategory) params.append("subCategory", filterSubcategory);
      if (searchTerm) params.append("search", searchTerm);
      if (sortConfig) params.append("sort", sortConfig);

      const res = await axiosInstance.get(`/product/listpage?${params}`);
      if (res.success) {
        setList(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch {
      toast.error("Failed to load inventory");
    }
  }, [page, filterCategory, filterSubcategory, searchTerm, sortConfig]);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => { setPage(1); }, [filterCategory, filterSubcategory, searchTerm, sortConfig]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const requestSort = () => {
    setSortConfig(prev => prev === "low-high" ? "high-low" : "low-high");
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setSubCategory(product.subCategory);
    setBestseller(product.bestseller);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/product/${editingProduct._id}`, {
        name, price: Number(price), category, subCategory, bestseller
      });
      if (res.success) {
        toast.success("Product updated successfully!");
        setIsEditModalOpen(false);
        fetchList();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const removeProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này không?")) return;
    try {
      const data = await axiosInstance.delete(`/product/${productId}`);
      if (data.success) {
        toast.success("Delete product successfully");
        fetchList();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Women": return <User size={14} />;
      case "Men": return <Users size={14} />;
      case "Kids": return <Baby size={14} />;
      default: return <Tag size={14} />;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Product Manager</h1>
          <p className="text-slate-500">Showing {list.length} of {total} items</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative group flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search name... (Enter)"
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 shadow-sm transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-semibold text-slate-600"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-semibold text-slate-600"
            value={filterSubcategory}
            onChange={(e) => setFilterSubcategory(e.target.value)}
          >
            <option value="">All Subcategories</option>
            {subCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Brand</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th
                  className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={requestSort}
                >
                  <div className="flex items-center gap-1">
                    Price <ArrowUpDown size={12} />
                    {sortConfig && <span className="text-indigo-500 text-base">{sortConfig === "low-high" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item) => (
                <tr key={item._id} className="hover:bg-indigo-50/30 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border" src={item.image[0]} alt="" />
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        {item.bestseller && (
                          <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
                            <CheckCircle2 size={10} /> BESTSELLER
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-600">{item.subCategory}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600 text-lg">
                    {currency}{item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEditModal(item)} className="p-2 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 shadow-sm transition-all active:scale-90">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => removeProduct(item._id)} className="p-2 bg-white border border-slate-200 rounded-xl hover:border-red-500 hover:text-red-600 shadow-sm transition-all active:scale-90">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">No products found matching your criteria.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`e-${idx}`} className="px-2 text-slate-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p ? "bg-indigo-600 text-white shadow" : "border border-slate-200 hover:border-indigo-400 text-slate-600"}`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black italic tracking-tight uppercase">Edit Item</h2>
              <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsEditModalOpen(false)} />
            </div>
            <form onSubmit={handleUpdate} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Product Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" required />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl outline-none font-bold">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Brand</label>
                  <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl outline-none font-bold">
                    {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 text-center block">Price ({currency})</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl outline-none font-mono text-center text-xl font-black text-indigo-600" required />
              </div>
              <label className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer group">
                <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Mark as Bestseller</span>
                <input type="checkbox" checked={bestseller} onChange={() => setBestseller(!bestseller)} className="w-6 h-6 rounded-lg accent-indigo-600" />
              </label>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all">UPDATE PRODUCT</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
