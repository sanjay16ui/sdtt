import React from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, CheckCircle2, Hash, Download, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { mockAuditLedger } from '@/mock/data';

export default function AuditLedger() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Lock className="w-6 h-6 text-cyan-400" />
            Cryptographic Audit Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">Immutable, tamper-evident cryptographic log of all differential transformations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Signed Proof
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-[#0e1017] text-slate-400 border-b border-[#1e2330]">
              <tr>
                <th className="px-5 py-3 font-medium">Tx Hash</th>
                <th className="px-5 py-3 font-medium">Block #</th>
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Merkle Hash</th>
                <th className="px-5 py-3 font-medium">Attested Operator</th>
                <th className="px-5 py-3 font-medium text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]/50 font-mono">
              {mockAuditLedger.map((tx, idx) => (
                <tr key={idx} className="hover:bg-[#14161f] transition-colors">
                  <td className="px-5 py-3.5 text-cyan-400 font-semibold">{tx.txId}</td>
                  <td className="px-5 py-3.5 text-slate-300">#{tx.block}</td>
                  <td className="px-5 py-3.5 text-slate-400">{tx.timestamp}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-[#1e2330] text-slate-200 text-[10px]">
                      {tx.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{tx.hash}</td>
                  <td className="px-5 py-3.5 text-slate-300">{tx.operator}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Badge variant="success" className="text-[9px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> VALID
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
