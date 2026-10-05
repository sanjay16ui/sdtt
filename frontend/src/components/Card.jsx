import React from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("bg-[#0b0c10] border border-[#1e2330] shadow-sm rounded-lg overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1 p-4 border-b border-[#1e2330]/60 bg-[#0d0e12]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-sm font-semibold tracking-wide text-slate-200", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
