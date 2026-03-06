import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus, X, CalendarDays, Clock } from 'lucide-react';
import type { CalendarEvent } from '@/types';

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const EVENT_COLORS = [
  { value: '#FABE00', label: 'Amarelo' },
  { value: '#10b981', label: 'Verde' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#ec4899', label: 'Rosa' },
];

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00', color: '#FABE00' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadEvents = useCallback(() => {
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
    api.get<CalendarEvent[]>(`/api/calendar?startDate=${start}&endDate=${end}`)
      .then(setEvents)
      .catch(console.error);
  }, [year, month]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const createEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    api.post('/api/calendar', {
      title: newEvent.title,
      startTime: `${newEvent.date}T${newEvent.startTime}:00`,
      endTime: `${newEvent.date}T${newEvent.endTime}:00`,
      color: newEvent.color,
    }).then(() => {
      setShowForm(false);
      setNewEvent({ title: '', date: '', startTime: '09:00', endTime: '10:00', color: '#FABE00' });
      loadEvents();
    }).catch(console.error);
  };

  const deleteEvent = (id: number) => {
    const prev = events;
    setEvents((e) => e.filter((x) => x.id !== id));
    api.del(`/api/calendar/${id}`).catch(() => setEvents(prev));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.startTime.startsWith(dateStr));
  };

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const handleDayClick = (day: number) => {
    setSelectedDay(selectedDay === day ? null : day);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const formatEventTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Agenda</h1>
          <p className="text-sm mt-1 hidden sm:block" style={{ color: 'var(--text-secondary)' }}>Organize seus compromissos</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm"
        >
          <Plus size={18} className="mr-1" /> <span className="hidden sm:inline">Novo </span>Evento
        </Button>
      </div>

      {showForm && (
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardContent className="p-4">
            <div className="flex gap-3 flex-wrap items-end [&>div]:w-full [&>div]:sm:w-auto">
              <div className="flex-1 min-w-48">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Título</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Titulo do evento..."
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  onKeyDown={(e) => e.key === 'Enter' && createEvent()}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Data</label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-40"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Início</label>
                <Input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-28"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Fim</label>
                <Input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-28"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Cor</label>
                <div className="flex gap-1.5 h-9 items-center">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setNewEvent({ ...newEvent, color: c.value })}
                      className={`w-6 h-6 rounded-full transition-all ${newEvent.color === c.value ? 'ring-2 ring-offset-1 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={createEvent} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                Criar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" >
        {/* Calendar grid */}
        <Card className="lg:col-span-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg transition-colors hover:bg-yellow-500/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>
                {MONTHS_PT[month]} {year}
              </CardTitle>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg transition-colors hover:bg-yellow-500/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToday}
              className="text-xs"
              style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-secondary)' }}
            >
              Hoje
            </Button>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[10px] sm:text-xs font-medium py-1 sm:py-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="sm:hidden">{d[0]}</span>
                  <span className="hidden sm:inline">{d}</span>
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-10 sm:min-h-24 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-secondary)' }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const todayCell = isToday(day);
                const selected = selectedDay === day;
                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-10 sm:min-h-24 rounded-lg p-1 sm:p-1.5 border-2 cursor-pointer transition-all duration-200 hover:border-yellow-500/30 ${selected ? 'border-yellow-500/60' : todayCell ? 'border-yellow-500/30' : 'border-transparent'
                      }`}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      boxShadow: todayCell ? '0 0 12px rgba(250, 190, 0, 0.08)' : undefined,
                    }}
                  >
                    <div className={`text-xs font-semibold mb-1 ${todayCell ? 'text-yellow-500' : ''
                      }`}
                      style={todayCell ? {} : { color: 'var(--text-secondary)' }}
                    >
                      {todayCell ? (
                        <span className="bg-yellow-500 text-black w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]">
                          {day}
                        </span>
                      ) : (
                        day
                      )}
                    </div>
                    {/* Desktop: event titles / Mobile: colored dots */}
                    <div className="hidden sm:block space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium"
                          style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+{dayEvents.length - 3}</div>
                      )}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="sm:hidden flex gap-0.5 mt-0.5 justify-center">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div key={ev.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event detail sidebar */}
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CalendarDays size={16} className="text-yellow-500" />
              {selectedDay
                ? `${selectedDay} de ${MONTHS_PT[month]}`
                : 'Selecione um dia'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDay ? (
              selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg border-l-4 group relative"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderLeftColor: ev.color }}
                    >
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ev.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatEventTime(ev.startTime)} - {formatEventTime(ev.endTime)}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Nenhum evento neste dia
                </p>
              )
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Clique em um dia do calendário para ver os eventos
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
