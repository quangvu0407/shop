import React, { useState } from 'react';
import axiosInstance from '../customize/axios';
import { toast } from 'react-toastify'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const data = await axiosInstance.post('/user/admin', { email, password })
      if (data.success) {
        setToken(data.token)
      }
      else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 py-10 border ">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          Admin Panel
        </h2>

        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="vuduong@example.com"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5"
          >
            Đăng nhập
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">hoặc</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <a
          href={`${BACKEND_URL}/user/auth/facebook`}
          className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-sm font-medium text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          Đăng nhập bằng Facebook
        </a>
      </div>
    </div>
  );
};

export default Login;