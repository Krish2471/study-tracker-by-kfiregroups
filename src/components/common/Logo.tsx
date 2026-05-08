import React from 'react';
import { LOGO_DATA } from './LogoData';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40, showText = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className="relative group cursor-pointer" 
        style={{ width: size, height: size }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-contain pointer-events-none"
          >
            <source src={LOGO_DATA} type="video/webm" />
          </video>
        </div>
      </div>
      
      {showText && (
        <div className="mt-2 text-center">
          <div className="text-text font-black tracking-[-0.05em] text-lg uppercase leading-none italic drop-shadow-md">KFIRE</div>
          <div className="text-brand font-bold text-[7px] uppercase tracking-[0.4em] leading-none mt-1 ml-1">GROUPS</div>
        </div>
      )}
    </div>
  );
};
