import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitMerge, Activity, Key, Users, LogOut, FileText } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils';

export default function Layout() {
  const navigate = useNavigate();
  const { getActiveInstance, setActiveInstance } = useStore();
  const instance = getActiveInstance();

  const handleDisconnect = () => {
    setActiveInstance(null);
    navigate('/instances');
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-white font-bold">
            n
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold leading-tight">{instance?.name}</h1>
            <p className="text-[10px] text-neutral-500 truncate max-w-[150px] leading-tight">{instance?.url}</p>
          </div>
        </div>
        <button onClick={handleDisconnect} className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around bg-white border-t border-neutral-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dash" />
        <NavItem to="/workflows" icon={<GitMerge size={20} />} label="Flows" />
        <NavItem to="/executions" icon={<Activity size={20} />} label="Execs" />
        <NavItem to="/credentials" icon={<Key size={20} />} label="Creds" />
        <NavItem to="/logs" icon={<FileText size={20} />} label="Logs" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-full py-3 gap-1 text-[10px] font-medium transition-colors",
          isActive ? "text-orange-500" : "text-neutral-500 hover:text-neutral-900"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
