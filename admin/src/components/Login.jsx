import React, { useState } from 'react';
import axiosInstance from '../customize/axios';
import {toast} from 'react-toastify'

const Login = ({setToken}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = async(e) => {
    try {
      e.preventDefault();
      const data = await axiosInstance.post('/user/admin', {email, password})
      if(data.success) {
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
      </div>
    </div>
  );
};

export default Login;