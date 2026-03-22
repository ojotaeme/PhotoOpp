import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

/**
 * Exibe métricas de forma clara com ênfase no valor numérico.
 */
export const StatCard = ({ title, value, icon }: StatCardProps) => (
  <div className="bg-white p-6 rounded-sm shadow-md border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
    <div className="p-3 bg-gray-50 text-black rounded-sm border border-gray-100 flex items-center justify-center">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 truncate">
        {title}
      </p>
      <p className="text-2xl font-black text-black leading-none">
        {value}
      </p>
    </div>
  </div>
);