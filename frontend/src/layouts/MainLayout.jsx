import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, LayoutDashboard, Activity, Users, AlertTriangle, 
  Network, FileSearch, Layers, Database, FileText, 
  Lock, BarChart, Server, Settings,
  Bell, Search, ChevronRight, Menu, X, Play, Square, Sparkles
} from 'lucide-react';
import { Badge, Button } from '@/components';
import { cn } from '@/utils/cn';
import { useStore } from '@/store';
import { ROUTES } from '@/config/routes';

const navGroups = [
  {
    title: 'COMMAND CENTER',
    items: [
      { name: 'Overview', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { name: 'Live Protection', path: ROUTES.LIVE, icon: Activity },
      { name: 'Alerts', path: ROUTES.ALERTS, icon: Bell, badge: '4' },
    ]
  },
  {
    title: 'INVESTIGATE',
    items: [
      { name: 'Subjects', path: ROUTES.SUBJECTS, icon: Users },
      { name: 'Releases', path: ROUTES.RELEASES, icon: FileSearch },
      { name: 'Data Journey', path: ROUTES.PROVENANCE, icon: Network },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Risk Intelligence', path: ROUTES.RISK, icon: AlertTriangle },
      { name: 'Scatter Cortex 3D', path: ROUTES.SCATTER_CORTEX, icon: Network, badge: 'LEAK' },
      { name: 'Multimodal', path: ROUTES.MULTIMODAL, icon: Layers },
      { name: 'Memory & Context', path: ROUTES.MEMORY_CACHE, icon: Database },
    ]
  },
  {
    title: 'GOVERNANCE',
    items: [
      { name: 'Policies', path: ROUTES.POLICIES, icon: FileText },
      { name: 'Audit Ledger', path: ROUTES.AUDIT, icon: Lock },
      { name: 'Reports', path: ROUTES.REPORTS, icon: BarChart },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { name: 'Model Providers', path: ROUTES.PROVIDERS, icon: Server },
      { name: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
    ]
  }
];

export function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSimulating, toggleSimulation, startSimulation } = useStore();
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    startSimulation();
    
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [startSimulation]);

  const allNavItems = navGroups.flatMap(g => g.items);
  const filteredNavItems = searchQuery.trim() === '' 
    ? allNavItems 
    : allNavItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#050608] text-slate-300 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Desktop Sidebar */}
      <aside className="w-[240px] border-r border-[#1e2330] bg-[#0b0c10] flex flex-col z-20 hidden md:flex shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-[#1e2330] shrink-0 justify-between">
          <NavLink to={ROUTES.HOME} className="flex items-center gap-3 text-white group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none text-slate-100 flex items-center gap-1.5">
                SDTT
                <span className="text-[10px] font-mono px-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">VITE</span>
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-medium">Privacy Governance</span>
            </div>
          </NavLink>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {navGroups.map((group, i) => (
            <div key={i} className="mb-5 px-3">
              <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-2">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink key={item.path} to={item.path}>
                      <div className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors group relative",
                        isActive ? "text-blue-400 bg-blue-950/30 font-semibold border border-blue-900/40" : "text-slate-400 hover:text-slate-200 hover:bg-[#1e2330]/50"
                      )}>
                        <div className="flex items-center gap-2.5">
                          <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-400 border border-rose-900/50 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Status */}
        <div className="p-3 border-t border-[#1e2330] bg-[#07080a] text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-slate-300">Engine Active</span>
            </div>
            <Badge variant="cyan" className="text-[9px] lowercase">vite hmr</Badge>
          </div>
          <button 
            onClick={toggleSimulation}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer",
              isSimulating 
                ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/50" 
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            )}
          >
            {isSimulating ? <Square className="w-3 h-3 fill-emerald-400" /> : <Play className="w-3 h-3 fill-slate-400" />}
            {isSimulating ? 'Taint Stream Running' : 'Resume Stream'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-[#1e2330] bg-[#0b0c10] flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded border border-[#1e2330]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div 
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#14161f] border border-[#2a3142] text-xs text-slate-400 hover:border-slate-600 transition-colors cursor-pointer w-64 md:w-80"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Quick navigation...</span>
              <kbd className="ml-auto text-[10px] font-mono bg-[#1e2330] px-1.5 py-0.5 rounded text-slate-400 border border-[#2a3142]">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to={ROUTES.ALERTS} className="relative p-2 text-slate-400 hover:text-white rounded-md hover:bg-[#1e2330] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0b0c10]"></span>
            </NavLink>

            <div className="h-4 w-px bg-[#1e2330]"></div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-500/20">
                SD
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-none">Security Ops</span>
                <span className="text-[10px] text-slate-500 leading-none mt-1">Admin Policy Role</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#050608] relative">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              className="relative w-[260px] bg-[#0b0c10] border-r border-[#1e2330] h-full flex flex-col z-10"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-[#1e2330]">
                <span className="font-bold text-white">SDTT Governance</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {navGroups.map((g, i) => (
                  <div key={i}>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">{g.title}</div>
                    <div className="space-y-1">
                      {g.items.map(item => (
                        <NavLink 
                          key={item.path} 
                          to={item.path} 
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2 rounded text-sm",
                            isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0d0f14] border border-[#2a3142] rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-10"
            >
              <div className="flex items-center px-4 border-b border-[#1e2330] gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  autoFocus
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or jump to page..." 
                  className="w-full bg-transparent py-3.5 text-sm text-white placeholder-slate-500 outline-none"
                />
                <kbd className="text-[10px] font-mono bg-[#1e2330] px-1.5 py-0.5 rounded text-slate-400">ESC</kbd>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-1">Pages</div>
                {filteredNavItems.map(item => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-left text-slate-300 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainLayout;
