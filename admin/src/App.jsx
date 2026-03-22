import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Add from "./pages/Add";
import List from "./pages/List";
import Order from "./pages/Order";
import Login from './components/Login';
import { Routes, Route } from "react-router-dom";
import Home from './pages/home';

export const currency = "$";

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])
  return (
    <div className='bg-gray-50 min-h-screen'>
      {
        token === ""
          ? <Login setToken={setToken} />
          :
          <>
            <Navbar setToken={setToken} />
            <hr />
            <div className='flex w-full'>
              <Sidebar />
              <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/add" element={<Add />} />
                  <Route path="/list" element={<List />} />
                  <Route path="/order" element={<Order token={token}/>} />
                </Routes>
              </div>
            </div>
          </>
      }

    </div>
  )
}

export default App