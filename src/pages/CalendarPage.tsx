import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  color: string;
  allDay: boolean;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
    api.get<CalendarEvent[]>(`/api/calendar?startDate=${start}&endDate=${end}`)
      .then(setEvents)
      .catch(console.error);
  }, [year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const createEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    api.post('/api/calendar', {
      title: newEvent.title,
      startTime: `${newEvent.date}T${newEvent.startTime}:00`,
      endTime: `${newEvent.date}T${newEvent.endTime}:00`,
      color: '#FABE00',
    }).then(() => {
      setShowForm(false);
      setNewEvent({ title: '', date: '', startTime: '09:00', endTime: '10:00' });
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
      api.get<CalendarEvent[]>(`/api/calendar?startDate=${start}&endDate=${end}`).then(setEvents);
    }).catch(console.error);
  };

  const deleteEvent = (id: number) => {
    api.del(`/api/calendar/${id}`).then(() => {
      setEvents(events.filter(e => e.id !== id));
    }).catch(console.error);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.startTime.startsWith(dateStr));
  };

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-neutral-400 text-sm mt-1">Organize seus compromissos</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
        >
          <Plus size={18} className="mr-1" /> Novo Evento
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex gap-3 flex-wrap">
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Titulo do evento..."
                className="bg-neutral-800 border-neutral-700 text-white flex-1 min-w-48"
              />
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white w-40"
              />
              <Input
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white w-28"
              />
              <Input
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white w-28"
              />
              <Button onClick={createEvent} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                Criar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <CardTitle className="text-lg text-white">
              {MONTHS_PT[month]} {year}
            </CardTitle>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white">
              <ChevronRight size={20} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-neutral-500 py-2">
                {d}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 bg-neutral-950 rounded p-1" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className={`min-h-24 bg-neutral-950 rounded p-1.5 border ${
                    isToday(day) ? 'border-yellow-500/50' : 'border-transparent'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${
                    isToday(day) ? 'text-yellow-500' : 'text-neutral-400'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="group relative text-xs px-1.5 py-0.5 rounded truncate"
                        style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                      >
                        {ev.title}
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="absolute right-0.5 top-0.5 opacity-0 group-hover:opacity-100"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-neutral-500">+{dayEvents.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
