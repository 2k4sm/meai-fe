import React from 'react';
import { login } from '../api/auth';
import { FaGoogle } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl backdrop-blur-sm" />
        
        <div className="relative bg-gray-900/80 border border-gray-800 shadow-2xl rounded-2xl p-8 flex flex-col items-center">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
              <FiMessageSquare className="text-white w-8 h-8" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">meAI</h1>
              <p className="text-gray-400 text-sm">Your AI-powered chat companion</p>
            </div>
          </div>

          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-lg font-medium text-white transition-all duration-200 border border-gray-700 hover:border-blue-500 shadow-lg group"
          >
            <FaGoogle className="text-xl text-blue-400 group-hover:text-blue-300" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 