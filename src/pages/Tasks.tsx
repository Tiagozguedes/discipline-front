import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  GripVertical,
  Circle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  tag: string;
  tagColor: string;
  dueDate: string | null;
  orderIndex: number;
  createdAt: string;
  subtasks: SubTask[];
}

interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

const STATUS_COLS = [
  { key: 'todo', label: 'A Fazer', icon: Circle, color: 'text-neutral-400' },
  { key: 'in_progress', label: 'Em Progresso', icon: Clock, color: 'text-yellow-500' },
  { key: 'done', label: 'Concluido', icon: CheckCircle2, color: 'text-green-400' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
};

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [showForm, setShowForm] = useState(false);

  const loadTasks = () => {
    api.get<Task[]>('/api/tasks').then(setTasks).catch(console.error);
  };

  useEffect(() => { loadTasks(); }, []);

  const createTask = () => {
    if (!newTaskTitle.trim()) return;
    api.post('/api/tasks', {
      title: newTaskTitle,
      status: 'todo',
      priority: newTaskPriority,
    }).then(() => {
      setNewTaskTitle('');
      setShowForm(false);
      loadTasks();
    }).catch(console.error);
  };

  const updateStatus = (taskId: number, status: string) => {
    api.put(`/api/tasks/${taskId}`, { status }).then(loadTasks).catch(console.error);
  };

  const deleteTask = (taskId: number) => {
    api.del(`/api/tasks/${taskId}`).then(loadTasks).catch(console.error);
  };

  const tasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tarefas</h1>
          <p className="text-neutral-400 text-sm mt-1">Gerencie suas tarefas no formato Kanban</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
        >
          <Plus size={18} className="mr-1" /> Nova Tarefa
        </Button>
      </div>

      {/* New task form */}
      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Titulo da tarefa..."
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                onKeyDown={(e) => e.key === 'Enter' && createTask()}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm"
              >
                <option value="low">Baixa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
              <Button onClick={createTask} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                Criar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Icon size={16} className={color} />
              <h3 className="text-sm font-medium text-neutral-300">{label}</h3>
              <Badge variant="outline" className="ml-auto text-xs bg-neutral-800 text-neutral-400 border-neutral-700">
                {tasksByStatus(key).length}
              </Badge>
            </div>

            <div className="space-y-2 min-h-32">
              {tasksByStatus(key).map((task) => (
                <Card
                  key={task.id}
                  className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer group"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="text-neutral-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                            {PRIORITY_LABELS[task.priority] || 'Media'}
                          </Badge>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="text-xs text-neutral-500">
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {key !== 'done' && (
                          <button
                            onClick={() => updateStatus(task.id, key === 'todo' ? 'in_progress' : 'done')}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-yellow-500"
                            title={key === 'todo' ? 'Iniciar' : 'Concluir'}
                          >
                            {key === 'todo' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
