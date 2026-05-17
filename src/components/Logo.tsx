import React from 'react';

export function Logo({ 
  className = "h-10", 
  textClassName = "text-xl", 
  lightText = false 
}: { 
  className?: string, 
  textClassName?: string, 
  lightText?: boolean 
}) {
  return (
    <div className="flex items-center space-x-3">
      {/* Icon: Floating colored squares */}
      <div className={className} style={{ aspectRatio: '1/1' }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
           <g transform="translate(50, 50) rotate(45) translate(-50, -50)">
              {/* Blue */}
              <rect x="50" y="10" width="30" height="30" rx="4" fill="#0ea5e9" transform="rotate(12 65 25)" opacity="0.9" />
              {/* Purple */}
              <rect x="15" y="15" width="30" height="30" rx="4" fill="#a855f7" transform="rotate(-15 30 30)" opacity="0.9" />
              {/* Yellow */}
              <rect x="55" y="45" width="28" height="28" rx="4" fill="#f59e0b" transform="rotate(-5 69 59)" opacity="0.9" />
              {/* Green (Front) */}
              <rect x="25" y="40" width="35" height="35" rx="6" fill="#84cc16" />
              {/* Red */}
              <rect x="15" y="65" width="25" height="25" rx="4" fill="#ef4444" transform="rotate(10 27.5 77.5)" opacity="0.9" />
              {/* Pink */}
              <rect x="50" y="70" width="25" height="25" rx="4" fill="#ec4899" transform="rotate(-20 62.5 82.5)" opacity="0.9" />
           </g>
        </svg>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <div className={`${textClassName} font-black tracking-widest text-[#84cc16] uppercase leading-none`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          LAGUNYA PRINT
        </div>
        <div className={`text-[0.65em] tracking-[0.15em] font-medium ${lightText ? 'text-white/80' : 'text-gray-500'} uppercase leading-[1.2] mt-1`}>
          Your imagination, our print
        </div>
      </div>
    </div>
  );
}
