import React from 'react';
import logoVid from '../../assets/logo.webm';

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
        <div className="absolute inset-0 bg-brand/20 blur-xl group-hover:bg-brand/30 transition-all rounded-full" />
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
          <video 
            src={logoVid} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
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
