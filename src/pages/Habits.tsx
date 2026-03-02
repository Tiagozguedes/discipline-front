import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check, Flame, Target } from 'lucide-react';

interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: string;
  category: string;
  color: string;
  active: boolean;
  completions: HabitCompletion[];
}

interface HabitCompletion {
  id: number;
  completedDate: string;
}

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
    api.del(`/api/habits/${id}`).then(loadHabits).catch(console.error);
  };

  const toggleToday = (habitId: number) => {
    const today = new Date().toISOString().split('T')[0];
    api.post(`/api/habits/${habitId}/toggle?date=${today}`, {}).then(loadHabits).catch(console.error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Habitos</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {completedToday}/{habits.length} completados hoje
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
        >
          <Plus size={18} className="mr-1" /> Novo Habito
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="Nome do habito..."
                className="bg-neutral-800 border-neutral-700 text-white flex-1"
                onKeyDown={(e) => e.key === 'Enter' && createHabit()}
              />
              <select
                value={newHabit.category}
                onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <Button onClick={createHabit} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                Criar
              </Button>
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
            <Card key={habit.id} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Toggle button */}
                  <button
                    onClick={() => toggleToday(habit.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      completed
                        ? 'bg-yellow-500 text-black'
                        : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
                    }`}
                  >
                    <Check size={20} />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${completed ? 'text-neutral-500 line-through' : 'text-white'}`}>
                        {habit.name}
                      </span>
                      <Badge variant="outline" className={`text-xs border-neutral-700 ${cat?.color ?? 'text-neutral-400'}`}>
                        {cat?.label ?? habit.category}
                      </Badge>
                    </div>
                    {/* Weekly heatmap */}
                    <div className="flex gap-1 mt-2">
                      {last7Days.map((date, i) => {
                        const done = isCompletedOnDate(habit, date);
                        return (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                              done ? 'bg-yellow-500/20 text-yellow-500' : 'bg-neutral-800 text-neutral-600'
                            }`}
                            title={date.toLocaleDateString('pt-BR')}
                          >
                            {date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                          </div>
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
                    className="p-2 rounded hover:bg-neutral-800 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {habits.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            <Target size={48} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum habito criado ainda</p>
            <p className="text-sm mt-1">Clique em "Novo Habito" para comecar</p>
          </div>
        )}
      </div>
    </div>
  );
}
