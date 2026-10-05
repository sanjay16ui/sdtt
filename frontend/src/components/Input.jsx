import React from 'react';
import { cn } from '@/utils/cn';

export function Input({ className, type = 'text', ...props }) {
  return (
    <input 
      type={type}
      className={cn(
        "w-full bg-[#14161f] border border-[#2a3142] rounded-md py-1.5 px-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors",
        className
      )}
      {...props}
    />
  );
}

export default Input;
