import React from 'react'
import { NavLink } from "react-router-dom"
import { assets } from '../assets/assets'
import { LayoutDashboard, PlusCircle, ListOrdered, ShoppingBag, Ticket } from 'lucide-react'

const Sidebar = () => {
  // Style chung cho NavLink
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-l-lg transition-all duration-300 group ${isActive
      ? "bg-slate-100 border-r-4 border-slate-900 text-black font-semibold"
      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-r-4 border-transparent"
    }`;

  return (
    <div className="w-[18%] min-h-screen border-r bg-white">
      <div className="flex flex-col gap-2 pt-8 pl-6">

        {/* Dashboard */}
        <NavLink to="/" className={navLinkClass}>
          <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
          <p className="hidden md:block">Dashboard</p>
        </NavLink>

        {/* Add Items */}
        <NavLink to="/add" className={navLinkClass}>
          <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        {/* List Products */}
        <NavLink to="/list" className={navLinkClass}>
          <ListOrdered size={20} className="group-hover:scale-110 transition-transform" />
          <p className="hidden md:block">List Products</p>
        </NavLink>

        {/* Orders */}
        <NavLink to="/order" className={navLinkClass}>
          <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
          <p className="hidden md:block">Orders</p>
        </NavLink>

        {/* Promotions */}
        <NavLink to="/promotion" className={navLinkClass}>
          <Ticket size={20} className="group-hover:scale-110 transition-transform" />
          <p className="hidden md:block">Khuyến mãi</p>
        </NavLink>

      </div>
    </div>
  )
}

export default Sidebar