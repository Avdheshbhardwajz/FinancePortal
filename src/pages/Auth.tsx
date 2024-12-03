import React, { useState } from 'react';

 import EditorLogin from '@/components/Editorlogin';

import Smalllogo from "../assets/SM_logo_531x107 2.png";
import logo from "../assets/Logo.png";

const Auth: React.FC = () => {
  
  return (
    <div className="min-h-screen w-full flex font-poppins">
      {/* Left Section - Company Branding (70%) */}
      <div className="hidden lg:flex w-[70%] bg-white relative">
        {/* Overlay with company info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900 z-10 p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            {/* Replace with your company logo */}
            <div className="w-[50%]  bg-white rounded-lg flex items-center justify-center">
              <span className="text-slate-900 text-2xl font-bold">
                <img src={logo} alt="Sundaram Logo" />
              </span>
            </div>
           
          </div>
          
          {/* Main image placeholder */}
          {/* <div className="w-full max-w-3xl p-4  bg-white mb-8 overflow-hidden">
            <img 
              src={logo}
              alt="Company showcase"
              className="w-[100%] r"
            />
          </div> */}
          
          {/* Company description */}
          <div className="text-center max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">Welcome to Your Platform</h1>
            <p className="text-slate-900">
              Access your dashboard to manage content, track analytics, and more.
              Our platform provides powerful tools for both editors and administrators.
            </p>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      {/* Right Section - Auth Forms (30%) */}
      <div className="w-full lg:w-[30%] flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
        <EditorLogin />
          
        </div>
      </div>
    </div>
  );
};

export default Auth;