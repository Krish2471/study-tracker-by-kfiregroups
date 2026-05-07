import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40, showText = false }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_8px_rgba(255,0,0,0.15)]"
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="46" stroke="#222" strokeWidth="0.5" />
          
          {/* Glowing Red Dots */}
          <g className="animate-pulse">
            <circle cx="50" cy="4" r="3.5" fill="#ff0000" />
            <circle cx="50" cy="4" r="6" fill="#ff0000" opacity="0.2" />
            
            <circle cx="50" cy="96" r="3.5" fill="#ff0000" />
            <circle cx="50" cy="96" r="6" fill="#ff0000" opacity="0.2" />
            
            <circle cx="4" cy="50" r="3.5" fill="#ff0000" />
            <circle cx="4" cy="50" r="6" fill="#ff0000" opacity="0.2" />
            
            <circle cx="96" cy="50" r="3.5" fill="#ff0000" />
            <circle cx="96" cy="50" r="6" fill="#ff0000" opacity="0.2" />
          </g>

          {/* Middle Ring */}
          <circle cx="50" cy="50" r="38" stroke="#333" strokeWidth="1" />
          
          {/* Inner Ring with Red Arcs */}
          <circle cx="50" cy="50" r="28" stroke="#444" strokeWidth="1.5" />
          
          {/* Decorative Red Arcs (from image) */}
          <path 
            d="M 72 32 A 28 28 0 0 1 78 50" 
            stroke="#ff0000" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
            className="opacity-80"
          />
          <path 
            d="M 28 68 A 28 28 0 0 1 22 50" 
            stroke="#ff0000" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
            className="opacity-80"
          />

          {/* Inner Dots */}
          <circle cx="34" cy="34" r="1.5" fill="white" opacity="0.8" />
          <circle cx="66" cy="34" r="1.5" fill="white" opacity="0.8" />
          <circle cx="34" cy="66" r="1.5" fill="white" opacity="0.8" />
          <circle cx="66" cy="66" r="1.5" fill="white" opacity="0.8" />

          {/* Stylized 'K' (more accurate to the image) */}
          <path 
            d="M 40 32 V 68 M 40 50 L 58 32 M 45 54 L 62 68" 
            stroke="white" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeJoin="round" 
            className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="mt-4 text-center">
          <div className="text-white font-black tracking-[-0.05em] text-2xl uppercase leading-none italic">KFIRE</div>
          <div className="text-red-600 font-bold text-[9px] uppercase tracking-[0.4em] leading-none mt-1.5 ml-1">GROUPS</div>
        </div>
      )}
    </div>
  );
};
