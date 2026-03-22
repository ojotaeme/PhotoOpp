import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão para hierarquia de ações */
  variant?: 'primary' | 'outline' | 'secondary';
  /** Texto exibido no centro do botão */
  label: string;
}

/**
 * Componente de botão padronizado com feedback tátil e transições suaves.
 */
export const Button = ({ variant = 'primary', label, ...props }: ButtonProps) => {
  const baseClass = "w-full font-bold py-4 rounded-sm transition-all active:scale-95 uppercase tracking-widest text-lg";
  
  const variants = {
    primary: "bg-[#666666] hover:bg-[#555555] text-white",
    outline: "bg-white border border-black text-black",
    secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400"
  };

  return (
    <button className={`${baseClass} ${variants[variant]}`} {...props}>
      {label}
    </button>
  );
};