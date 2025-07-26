import React from 'react';
import { login } from '../api/auth';
import { FcGoogle } from 'react-icons/fc';
import { RiMessage3Line } from 'react-icons/ri';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#181C14] p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-[#697565]/5 rounded-2xl backdrop-blur-sm" />
        
        <div className="relative bg-[#2A2E24]/80 border border-[#4D5147] shadow-2xl rounded-2xl p-8 flex flex-col items-center">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#697565] to-[#3C3D37] rounded-2xl flex items-center justify-center shadow-xl">
              <RiMessage3Line className="text-[#ECDFCC] w-8 h-8 drop-shadow-[0_0_8px_rgba(236,223,204,0.3)]" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[#ECDFCC] mb-2 drop-shadow-[0_0_8px_rgba(236,223,204,0.2)]">meAI</h1>
              <p className="text-[#D4C5B3] text-sm">Your AI-powered personal assistant</p>
            </div>
          </div>

          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-4 px-4 py-2.5 bg-[#52584E] hover:bg-[#646F60] rounded-xl text-[#e2ded7] transition-all duration-300 border border-[#697565]/30 hover:border-[#697565] shadow-lg hover:shadow-[0_0_25px_rgba(105,117,101,0.2)] group relative overflow-hidden"
          >
            <FcGoogle className="text-xl" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 