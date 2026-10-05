import React from 'react';
import { Card, CardContent } from '@/components';
import { cn } from '@/utils/cn';

export function MetricsGrid({ metrics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {metrics.map((metric, i) => (
        <Card key={i} className="hover:border-slate-700 transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[11px] text-slate-400 font-medium">{metric.label}</p>
              {metric.trend && (
                <span className={cn(
                  "text-[10px] font-semibold px-1 py-0.5 rounded", 
                  metric.trendUp && metric.status !== 'warning' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-900/40" : 
                  metric.trendUp && metric.status === 'warning' ? "bg-rose-500/10 text-rose-400 border border-rose-900/40" : 
                  "bg-slate-500/10 text-slate-400"
                )}>
                  {metric.trend}
                </span>
              )}
            </div>
            <div className="text-xl md:text-2xl font-bold text-white font-mono">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default MetricsGrid;
