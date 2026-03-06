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
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop / Tablet sidebar */}
      <aside
        className={cn(
          'hidden md:flex h-screen sticky top-0 flex-col border-r transition-all duration-300',
          collapsed ? 'w-16' : 'lg:w-60 w-16'
        )}
        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-primary)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">D</span>
          </div>
          {!collapsed && (
            <span className="hidden lg:inline text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
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
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                )
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--text-secondary)' }}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="hidden lg:inline">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle + Collapse */}
        <div className="p-2 border-t space-y-1" style={{ borderColor: 'var(--border-primary)' }}>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span className="hidden lg:inline text-sm">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]"
        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-primary)' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium transition-colors min-w-0',
                isActive ? 'text-yellow-500' : ''
              )
            }
            style={({ isActive }) => isActive ? {} : { color: 'var(--text-muted)' }}
          >
            <item.icon size={20} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>Tema</span>
        </button>
      </nav>
    </>
  );
}
