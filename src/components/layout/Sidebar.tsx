import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Calendar,
  Target,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { path: '/calendar', label: 'Agenda', icon: Calendar },
  { path: '/habits', label: 'Hábitos', icon: Target },
  { path: '/finance', label: 'Financeiro', icon: DollarSign },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col bg-neutral-950 border-r border-neutral-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-neutral-800">
        <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-sm">D</span>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">
            Discipline
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              )
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="p-2 border-t border-neutral-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
