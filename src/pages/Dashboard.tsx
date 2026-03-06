import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Timer,
  CheckSquare,
  Target,
  DollarSign,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { DashboardData } from '@/types';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>('/api/dashboard').then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const taskCompletion = data.tasks.total > 0
    ? Math.round((data.tasks.done / data.tasks.total) * 100)
    : 0;

  const habitCompletion = data.habits.totalActive > 0
    ? Math.round((data.habits.completedToday / data.habits.totalActive) * 100)
    : 0;

  // Discipline Score calculation
  const pomodoroScore = Math.min(data.pomodoro.todaySessions * 10, 30);
  const taskScore = Math.min(taskCompletion * 0.3, 30);
  const habitScore = Math.min(habitCompletion * 0.4, 40);
  const disciplineScore = Math.round(pomodoroScore + taskScore + habitScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Visao geral do seu progresso
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <Zap size={18} className="text-yellow-500" />
            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Discipline Score</span>
            <span className="text-lg font-bold text-yellow-500">{disciplineScore}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Pomodoro Card */}
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Foco Hoje</CardTitle>
            <Timer size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatTime(data.pomodoro.todayMinutes)}</div>
            <p className="text-xs mt-1 hidden sm:block" style={{ color: 'var(--text-muted)' }}>{data.pomodoro.todaySessions} sessoes completadas</p>
            <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{formatTime(data.pomodoro.weekMinutes)} esta semana</p>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tarefas</CardTitle>
            <CheckSquare size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.tasks.done}/{data.tasks.total}</div>
            <Progress value={taskCompletion} className="mt-2 h-1.5" style={{ backgroundColor: 'var(--bg-input)' }} />
            <p className="text-xs mt-1 hidden sm:block" style={{ color: 'var(--text-muted)' }}>{data.tasks.inProgress} em progresso</p>
          </CardContent>
        </Card>

        {/* Habits Card */}
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Habitos Hoje</CardTitle>
            <Target size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {data.habits.completedToday}/{data.habits.totalActive}
            </div>
            <Progress value={habitCompletion} className="mt-2 h-1.5" style={{ backgroundColor: 'var(--bg-input)' }} />
            <p className="text-xs mt-1 hidden sm:block" style={{ color: 'var(--text-muted)' }}>{habitCompletion}% completado</p>
          </CardContent>
        </Card>

        {/* Finance Card */}
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Balanco Mensal</CardTitle>
            <DollarSign size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${data.finance.monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(data.finance.monthBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-400" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Investido: {formatCurrency(data.finance.totalInvested)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receitas</span>
              <span className="text-sm font-medium text-green-400">{formatCurrency(data.finance.monthIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Despesas</span>
              <span className="text-sm font-medium text-red-400">{formatCurrency(data.finance.monthExpense)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Saldo</span>
              <span className={`text-sm font-bold ${data.finance.monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(data.finance.monthBalance)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Patrimonio Investido</span>
              <span className="text-sm font-medium text-yellow-500">{formatCurrency(data.finance.totalInvestmentValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Discipline Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="#262626" strokeWidth="10" fill="none" />
                  <circle
                    cx="60" cy="60" r="50"
                    stroke="#FABE00"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${disciplineScore * 3.14} ${314 - disciplineScore * 3.14}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-yellow-500">{disciplineScore}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Pomodoro</span>
                <span style={{ color: 'var(--text-primary)' }}>{Math.round(pomodoroScore)}/30</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Tarefas</span>
                <span style={{ color: 'var(--text-primary)' }}>{Math.round(taskScore)}/30</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Habitos</span>
                <span style={{ color: 'var(--text-primary)' }}>{Math.round(habitScore)}/40</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
