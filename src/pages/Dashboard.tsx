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

interface DashboardData {
  tasks: { total: number; todo: number; inProgress: number; done: number };
  pomodoro: { todayMinutes: number; todaySessions: number; weekMinutes: number };
  habits: { totalActive: number; completedToday: number };
  finance: {
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    totalInvested: number;
    totalInvestmentValue: number;
  };
}

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Visao geral do seu progresso
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-xl border border-neutral-800">
            <Zap size={18} className="text-yellow-500" />
            <span className="text-sm font-medium text-neutral-300">Discipline Score</span>
            <span className="text-lg font-bold text-yellow-500">{disciplineScore}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pomodoro Card */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Foco Hoje</CardTitle>
            <Timer size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatTime(data.pomodoro.todayMinutes)}</div>
            <p className="text-xs text-neutral-500 mt-1">{data.pomodoro.todaySessions} sessoes completadas</p>
            <p className="text-xs text-neutral-500">{formatTime(data.pomodoro.weekMinutes)} esta semana</p>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Tarefas</CardTitle>
            <CheckSquare size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.tasks.done}/{data.tasks.total}</div>
            <Progress value={taskCompletion} className="mt-2 h-1.5 bg-neutral-800" />
            <p className="text-xs text-neutral-500 mt-1">{data.tasks.inProgress} em progresso</p>
          </CardContent>
        </Card>

        {/* Habits Card */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Habitos Hoje</CardTitle>
            <Target size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.habits.completedToday}/{data.habits.totalActive}
            </div>
            <Progress value={habitCompletion} className="mt-2 h-1.5 bg-neutral-800" />
            <p className="text-xs text-neutral-500 mt-1">{habitCompletion}% completado</p>
          </CardContent>
        </Card>

        {/* Finance Card */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Balanco Mensal</CardTitle>
            <DollarSign size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.finance.monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(data.finance.monthBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-400" />
              <p className="text-xs text-neutral-500">
                Investido: {formatCurrency(data.finance.totalInvested)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base text-white">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Receitas</span>
              <span className="text-sm font-medium text-green-400">{formatCurrency(data.finance.monthIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Despesas</span>
              <span className="text-sm font-medium text-red-400">{formatCurrency(data.finance.monthExpense)}</span>
            </div>
            <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-300">Saldo</span>
              <span className={`text-sm font-bold ${data.finance.monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(data.finance.monthBalance)}
              </span>
            </div>
            <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
              <span className="text-sm text-neutral-400">Patrimonio Investido</span>
              <span className="text-sm font-medium text-yellow-500">{formatCurrency(data.finance.totalInvestmentValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base text-white">Discipline Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
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
                  <span className="text-3xl font-bold text-yellow-500">{disciplineScore}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Pomodoro</span>
                <span className="text-neutral-300">{Math.round(pomodoroScore)}/30</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Tarefas</span>
                <span className="text-neutral-300">{Math.round(taskScore)}/30</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Habitos</span>
                <span className="text-neutral-300">{Math.round(habitScore)}/40</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
