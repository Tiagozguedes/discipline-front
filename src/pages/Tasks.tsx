import { useEffect, useState, useMemo, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Task } from '@/types';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const STATUS_COLS = [
  { key: 'todo', label: 'A Fazer', shortLabel: 'A Fazer', icon: Circle, color: 'text-neutral-400' },
  { key: 'in_progress', label: 'Em Progresso', shortLabel: 'Progresso', icon: Clock, color: 'text-yellow-500' },
  { key: 'done', label: 'Concluido', shortLabel: 'Concluído', icon: CheckCircle2, color: 'text-green-400' },
];

const STATUS_ORDER = ['todo', 'in_progress', 'done'];

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

// ---------- Sortable Task Card ----------
function SortableTaskCard({
  task,
  onDelete,
  onMove,
}: {
  task: Task;
  onDelete: (id: number) => void;
  onMove: (id: number, newStatus: string) => void;
}) {
  const statusIdx = STATUS_ORDER.indexOf(task.status);
  const canMoveLeft = statusIdx > 0;
  const canMoveRight = statusIdx < STATUS_ORDER.length - 1;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className="transition-colors cursor-grab active:cursor-grabbing group"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: isDragging ? 'var(--accent)' : 'var(--border-primary)',
        }}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div {...listeners} className="mt-1 cursor-grab active:cursor-grabbing hidden md:block" style={{ color: 'var(--text-muted)' }}>
              <GripVertical size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                  {PRIORITY_LABELS[task.priority] || 'Media'}
                </Badge>
                {task.subtasks && task.subtasks.length > 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                  </span>
                )}
              </div>
            </div>
            {/* Mobile move arrows */}
            <div className="flex items-center gap-0.5 md:hidden">
              <button
                onClick={() => canMoveLeft && onMove(task.id, STATUS_ORDER[statusIdx - 1])}
                className={`p-1 rounded transition-colors ${canMoveLeft ? 'hover:text-yellow-500 active:bg-yellow-500/10' : 'opacity-20 cursor-default'}`}
                style={{ color: 'var(--text-muted)' }}
                disabled={!canMoveLeft}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => canMoveRight && onMove(task.id, STATUS_ORDER[statusIdx + 1])}
                className={`p-1 rounded transition-colors ${canMoveRight ? 'hover:text-yellow-500 active:bg-yellow-500/10' : 'opacity-20 cursor-default'}`}
                style={{ color: 'var(--text-muted)' }}
                disabled={!canMoveRight}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Drag Overlay Card (visual feedback while dragging) ----------
function TaskOverlayCard({ task }: { task: Task }) {
  return (
    <Card
      className="shadow-2xl rotate-2 cursor-grabbing"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)', borderWidth: 2 }}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical size={14} className="mt-1" style={{ color: 'var(--text-muted)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
            <Badge className={`text-xs mt-2 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
              {PRIORITY_LABELS[task.priority] || 'Media'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Droppable Column ----------
function KanbanColumn({
  columnId,
  label,
  icon: Icon,
  color,
  tasks,
  onDelete,
  onMove,
}: {
  columnId: string;
  label: string;
  icon: React.ElementType;
  color: string;
  tasks: Task[];
  onDelete: (id: number) => void;
  onMove: (id: number, newStatus: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2">
        <Icon size={16} className={color} />
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</h3>
        <Badge
          variant="outline"
          className="ml-auto text-xs"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', borderColor: 'var(--border-secondary)' }}
        >
          {tasks.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-2 min-h-32 rounded-lg p-2 transition-colors duration-200"
        style={{
          backgroundColor: isOver ? 'var(--accent)' + '08' : 'transparent',
          border: isOver ? '2px dashed var(--accent)' : '2px dashed transparent',
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onDelete={onDelete} onMove={onMove} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [showForm, setShowForm] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const dragOriginalStatusRef = useRef<string | null>(null);
  const tasksBeforeDragRef = useRef<Task[]>([]);

  const [mobileTab, setMobileTab] = useState('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

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

  const deleteTask = (taskId: number) => {
    const prev = tasks;
    setTasks((t) => t.filter((x) => x.id !== taskId));
    api.del(`/api/tasks/${taskId}`).catch(() => setTasks(prev));
  };

  const moveTask = (taskId: number, newStatus: string) => {
    const prev = [...tasks];
    setTasks((t) => t.map((x) => x.id === taskId ? { ...x, status: newStatus } : x));
    api.put(`/api/tasks/${taskId}`, { status: newStatus }).catch(() => setTasks(prev));
  };

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasks]);

  const COLUMN_IDS = ['todo', 'in_progress', 'done'];

  // Find which column a task or droppable belongs to
  const findColumn = (id: string | number): string | null => {
    // Check if id is a column key directly
    if (COLUMN_IDS.includes(String(id))) return String(id);
    // Otherwise find the task's column
    const task = tasks.find((t) => t.id === Number(id));
    return task?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === Number(event.active.id));
    setActiveTask(task ?? null);
    dragOriginalStatusRef.current = task?.status ?? null;
    tasksBeforeDragRef.current = [...tasks];
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCol = findColumn(active.id);
    const overCol = findColumn(over.id);

    if (!activeCol || !overCol || activeCol === overCol) return;

    // Move task to the new column immediately during drag
    const activeId = Number(active.id);
    setTasks((prev) =>
      prev.map((t) => t.id === activeId ? { ...t, status: overCol } : t)
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const originalStatus = dragOriginalStatusRef.current;
    const snapshot = tasksBeforeDragRef.current;
    setActiveTask(null);
    dragOriginalStatusRef.current = null;

    const { active, over } = event;
    if (!over) {
      // Cancelled — revert to snapshot
      setTasks(snapshot);
      return;
    }

    const activeId = Number(active.id);
    const overId = over.id;

    const activeCol = findColumn(activeId);
    const overCol = findColumn(overId);

    if (!activeCol || !overCol) return;

    if (activeCol === overCol) {
      // Reorder within same column
      const colTasks = [...(tasksByStatus[activeCol] || [])];
      const oldIdx = colTasks.findIndex((t) => t.id === activeId);
      const newIdx = colTasks.findIndex((t) => t.id === Number(overId));
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(colTasks, oldIdx, newIdx);
        const updated = tasks.map((t) => {
          if (t.status !== activeCol) return t;
          const idx = reordered.findIndex((r) => r.id === t.id);
          return { ...t, orderIndex: idx };
        });
        setTasks(updated);
        reordered.forEach((t, i) => {
          if (t.orderIndex !== i) {
            api.put(`/api/tasks/${t.id}`, { orderIndex: i }).catch(() => setTasks(snapshot));
          }
        });
      }
    }

    // Persist the status change if the task moved columns
    const currentTask = tasks.find((t) => t.id === activeId);
    if (currentTask && originalStatus && currentTask.status !== originalStatus) {
      api.put(`/api/tasks/${activeId}`, { status: currentTask.status }).catch(() => setTasks(snapshot));
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setTasks(tasksBeforeDragRef.current);
    dragOriginalStatusRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tarefas</h1>
          <p className="text-sm mt-1 hidden sm:block" style={{ color: 'var(--text-secondary)' }}>Gerencie suas tarefas no formato Kanban</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm"
        >
          <Plus size={18} className="mr-1" /> <span className="hidden sm:inline">Nova </span>Tarefa
        </Button>
      </div>

      {/* New task form */}
      {showForm && (
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Titulo da tarefa..."
                className="flex-1"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                onKeyDown={(e) => e.key === 'Enter' && createTask()}
              />
              <div className="flex gap-3">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg border text-sm"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
                <Button onClick={createTask} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                  Criar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Mobile column tabs */}
        <div className="flex md:hidden gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          {STATUS_COLS.map(({ key, shortLabel, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 px-1 rounded-lg text-[11px] font-medium transition-colors ${mobileTab === key ? 'bg-yellow-500/10 text-yellow-500' : ''
                }`}
              style={mobileTab === key ? {} : { color: 'var(--text-muted)' }}
            >
              <Icon size={13} />
              <span className="truncate">{shortLabel}</span>
              <span className="text-[10px] opacity-60">({(tasksByStatus[key] || []).length})</span>
            </button>
          ))}
        </div>

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {STATUS_COLS.map(({ key, label, icon, color }) => (
            <KanbanColumn
              key={key}
              columnId={key}
              label={label}
              icon={icon}
              color={color}
              tasks={tasksByStatus[key] || []}
              onDelete={deleteTask}
              onMove={moveTask}
            />
          ))}
        </div>

        {/* Mobile: show active tab only */}
        <div className="md:hidden">
          {STATUS_COLS.filter(({ key }) => key === mobileTab).map(({ key, label, icon, color }) => (
            <KanbanColumn
              key={key}
              columnId={key}
              label={label}
              icon={icon}
              color={color}
              tasks={tasksByStatus[key] || []}
              onDelete={deleteTask}
              onMove={moveTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskOverlayCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
