import React from 'react';

/**
 * Layout especializado para a experiência do Totem.
 * Garante a proporção 9:16 em monitores convencionais e tela cheia em dispositivos verticais.
 */
export const TotemLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] w-full [@media(min-aspect-ratio:2/3)]:bg-black [@media(min-aspect-ratio:2/3)]:p-4 transition-colors duration-500">
      
      {/* Container Responsivo: Simula o hardware do Totem em janelas maiores */}
      <div className="w-full h-[100dvh] flex flex-col relative overflow-hidden bg-gradient-to-b from-white to-[#d4d4d4] [@media(min-aspect-ratio:2/3)]:h-[90vh] [@media(min-aspect-ratio:2/3)]:w-auto [@media(min-aspect-ratio:2/3)]:aspect-[9/16] [@media(min-aspect-ratio:2/3)]:shadow-2xl [@media(min-aspect-ratio:2/3)]:rounded-lg">
        {children}
      </div>
      
    </div>
  );
};