import React from 'react';
import { cn } from '@/utils/cn';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: "bg-[#1e2330] text-slate-300 border-[#2a3142]",
    success: "bg-emerald-950/50 text-emerald-400 border-emerald-900/60",
    warning: "bg-amber-950/50 text-amber-400 border-amber-900/60",
    danger: "bg-rose-950/50 text-rose-400 border-rose-900/60",
    info: "bg-blue-950/50 text-blue-400 border-blue-900/60",
    purple: "bg-purple-950/50 text-purple-400 border-purple-900/60",
    cyan: "bg-cyan-950/50 text-cyan-400 border-cyan-900/60",
    outline: "bg-transparent text-slate-400 border-[#2a3142]",
  };
  
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors select-none", 
        variants[variant] || variants.default, 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export default Badge;
