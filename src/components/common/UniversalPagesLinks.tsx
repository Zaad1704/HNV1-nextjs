import React from 'react';
import Link from 'next/link';
import { CreditCard, Receipt, Wrench } from 'lucide-react';

const UniversalPagesLinks = () => {
  return (
    <div className="rounded-2xl p-6 border-2 border-white/20 shadow-xl" 
         style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)'}}>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-6">
        Universal Design Pages
      </h2>
      
      <div className="space-y-4">
        <Link 
          to="/dashboard/payments-universal"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all hover:scale-105 transform"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
            <CreditCard size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Payments Universal</h3>
            <p className="text-white/70 text-sm">View payments with universal design</p>
          </div>
        </Link>
        
        <Link 
          to="/dashboard/expenses-universal"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all hover:scale-105 transform"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500">
            <Receipt size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Expenses Universal</h3>
            <p className="text-white/70 text-sm">View expenses with universal design</p>
          </div>
        </Link>
        
        <Link 
          to="/dashboard/maintenance-universal"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all hover:scale-105 transform"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-500">
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Maintenance Universal</h3>
            <p className="text-white/70 text-sm">View maintenance requests with universal design</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default UniversalPagesLinks;