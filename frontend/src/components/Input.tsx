import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Ícone da biblioteca lucide-react exibido à direita */
  icon: LucideIcon;
}

/**
 * Input estilizado com foco em legibilidade e acessibilidade.
 */
export const Input = ({ icon: Icon, ...props }: InputProps) => (
  <div className="relative w-full">
    <input
      {...props}
      className="w-full bg-[#2a2a2a] text-white px-4 py-4 pr-12 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all placeholder:text-gray-500"
    />
    <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
  </div>
);