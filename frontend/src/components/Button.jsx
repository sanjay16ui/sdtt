import React from 'react';
import { cn } from '@/utils/cn';

export function Button({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}) {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-950",
    outline: "border border-[#2a3142] bg-transparent hover:bg-[#1e2330] text-slate-300 hover:text-white",
    ghost: "bg-transparent hover:bg-[#1e2330] text-slate-300 hover:text-white",
    danger: "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/30",
    success: "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30",
  };
  
  const sizes = {
    default: "h-8 px-3 py-1.5 text-xs",
    sm: "h-7 rounded px-2 text-[11px]",
    lg: "h-10 rounded-md px-6 text-sm",
    icon: "h-8 w-8 flex items-center justify-center p-0",
  };
  
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 font-medium select-none", 
        variants[variant] || variants.default, 
        sizes[size] || sizes.default, 
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
