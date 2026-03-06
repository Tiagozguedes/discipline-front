import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check, X, Flame, Target } from 'lucide-react';
import type { Habit } from '@/types';

const CATEGORIES = [
  { value: 'health', label: 'Saude', color: 'text-green-400' },
  { value: 'study', label: 'Estudo', color: 'text-blue-400' },
  { value: 'work', label: 'Trabalho', color: 'text-yellow-400' },
  { value: 'personal', label: 'Pessoal', color: 'text-purple-400' },
  { value: 'general', label: 'Geral', color: 'text-neutral-400' },
];

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'general' });

  const loadHabits = useCallback(() => {
    api.get<Habit[]>('/api/habits').then(setHabits).catch(console.error);
  }, []);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  const createHabit = () => {
    if (!newHabit.name.trim()) return;
    api.post('/api/habits', {
      name: newHabit.name,
      category: newHabit.category,
      frequency: 'daily',
    }).then(() => {
      setNewHabit({ name: '', category: 'general' });
      setShowForm(false);
      loadHabits();
    }).catch(console.error);
  };

  const deleteHabit = (id: number) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    api.del(`/api/habits/${id}`).catch(() => loadHabits());
  };

  // Optimistic toggle for any date (today or heatmap day)
  const toggleDate = (habitId: number, dateStr: string) => {
    setHabits((current) =>
      current.map((h) => {
        if (h.id !== habitId) return h;
        const alreadyDone = h.completions?.some((c) => c.completedDate === dateStr);
        return {
          ...h,
          completions: alreadyDone
            ? h.completions.filter((c) => c.completedDate !== dateStr)
            : [...(h.completions ?? []), { id: Date.now(), completedDate: dateStr }],
        };
      })
    );
    api.post(`/api/habits/${habitId}/toggle?date=${dateStr}`, {}).catch(() => {
      loadHabits(); // rollback by re-fetching on error
    });
  };

  const toggleToday = (habitId: number) => {
    const today = new Date().toISOString().split('T')[0];
    toggleDate(habitId, today);
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completions?.some((c) => c.completedDate === today) ?? false;
  };

  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const isCompletedOnDate = (habit: Habit, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habit.completions?.some((c) => c.completedDate === dateStr) ?? false;
  };

  const getStreak = (habit: Habit): number => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (habit.completions?.some((c) => c.completedDate === dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const completedToday = habits.filter(isCompletedToday).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Habitos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {completedToday}/{habits.length} completados hoje
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm"
        >
          <Plus size={18} className="mr-1" /> <span className="hidden sm:inline">Novo </span>Habito
        </Button>
      </div>

      {showForm && (
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="Nome do habito..."
                className="flex-1"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                onKeyDown={(e) => e.key === 'Enter' && createHabit()}
              />
              <div className="flex gap-3">
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg border text-sm"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <Button onClick={createHabit} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                  Criar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit list */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const streak = getStreak(habit);
          const completed = isCompletedToday(habit);
          const cat = CATEGORIES.find((c) => c.value === habit.category);

          return (
            <Card key={habit.id} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Toggle button — shows X on hover when completed */}
                  <button
                    onClick={() => toggleToday(habit.id)}
                    className={`group/btn w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90 ${completed
                      ? 'bg-yellow-500 text-black hover:bg-red-500 hover:text-white'
                      : 'text-neutral-500 hover:scale-105 hover:text-yellow-500'
                      }`}
                    style={completed ? {} : { backgroundColor: 'var(--bg-input)' }}
                    title={completed ? 'Desmarcar' : 'Marcar como feito'}
                  >
                    <Check size={20} className={completed ? 'group-hover/btn:hidden' : ''} />
                    {completed && <X size={20} className="hidden group-hover/btn:block" />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium transition-all ${completed ? 'line-through opacity-50' : ''}`}
                        style={{ color: completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
                      >
                        {habit.name}
                      </span>
                      <Badge variant="outline" className={`text-xs ${cat?.color ?? 'text-neutral-400'}`} style={{ borderColor: 'var(--border-secondary)' }}>
                        {cat?.label ?? habit.category}
                      </Badge>
                    </div>
                    {/* Weekly heatmap — clickable */}
                    <div className="flex gap-0.5 sm:gap-1 mt-1.5 sm:mt-2">
                      {last7Days.map((date, i) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const done = isCompletedOnDate(habit, date);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleDate(habit.id, dateStr)}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded text-[10px] sm:text-xs flex items-center justify-center transition-all duration-150 hover:scale-110 cursor-pointer ${done ? 'bg-yellow-500/20 text-yellow-500' : ''
                              }`}
                            style={done ? {} : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}
                            title={date.toLocaleDateString('pt-BR')}
                          >
                            {date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Streak */}
                  {streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame size={16} />
                      <span className="text-sm font-bold">{streak}</span>
                    </div>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1.5 sm:p-2 rounded hover:text-red-400 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} className="sm:hidden" />
                    <Trash2 size={16} className="hidden sm:block" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {habits.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <Target size={48} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum habito criado ainda</p>
            <p className="text-sm mt-1">Clique em "Novo Habito" para comecar</p>
          </div>
        )}
      </div>
    </div>
  );
}
