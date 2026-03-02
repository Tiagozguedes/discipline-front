import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

interface PomodoroStats {
  totalMinutes: number;
  totalSessions: number;
  period: string;
}

type SessionType = 'focus' | 'short_break' | 'long_break';

const DURATIONS: Record<SessionType, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export function Pomodoro() {
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessions] = useState(0);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string | null>(null);

  const loadStats = useCallback(() => {
    api.get<PomodoroStats>('/api/pomodoro/stats?period=today').then(setStats).catch(console.error);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (sessionType === 'focus') {
        // Save completed session
        api.post('/api/pomodoro', {
          durationMinutes: DURATIONS.focus / 60,
          startedAt: startTimeRef.current,
          endedAt: new Date().toISOString(),
          completed: true,
          sessionType: 'focus',
        }).then(() => {
          loadStats();
          setSessions((s) => s + 1);
        }).catch(console.error);
      }
      // Auto-switch
      if (sessionType === 'focus') {
        const nextType = (sessionsCompleted + 1) % 4 === 0 ? 'long_break' : 'short_break';
        setSessionType(nextType);
        setTimeLeft(DURATIONS[nextType]);
      } else {
        setSessionType('focus');
        setTimeLeft(DURATIONS.focus);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, sessionType, sessionsCompleted, loadStats]);

  const toggleTimer = () => {
    if (!isRunning) {
      startTimeRef.current = new Date().toISOString();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[sessionType]);
  };

  const switchSession = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(DURATIONS[type]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = DURATIONS[sessionType];
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pomodoro</h1>
        <p className="text-neutral-400 text-sm mt-1">Mantenha o foco com sessoes cronometradas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-8">
              {/* Session type tabs */}
              <div className="flex gap-2 justify-center mb-8">
                {([
                  { type: 'focus' as SessionType, label: 'Foco', icon: Brain },
                  { type: 'short_break' as SessionType, label: 'Pausa Curta', icon: Coffee },
                  { type: 'long_break' as SessionType, label: 'Pausa Longa', icon: Coffee },
                ]).map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => switchSession(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sessionType === type
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Timer display */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-64 h-64">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 240 240">
                    <circle cx="120" cy="120" r="105" stroke="#262626" strokeWidth="8" fill="none" />
                    <circle
                      cx="120" cy="120" r="105"
                      stroke="#FABE00"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 6.597} ${659.7 - progress * 6.597}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-bold text-white tabular-nums">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                    <span className="text-neutral-500 text-sm mt-2 capitalize">
                      {sessionType === 'focus' ? 'Foco' : sessionType === 'short_break' ? 'Pausa Curta' : 'Pausa Longa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  <RotateCcw size={20} />
                </Button>
                <Button
                  onClick={toggleTimer}
                  className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black"
                >
                  {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </Button>
                <div className="w-12 h-12" /> {/* spacer */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">Sessoes Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {stats?.totalSessions ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">Tempo Focado Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatTime(stats?.totalMinutes ?? 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">Ciclos Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < sessionsCompleted % 4
                        ? 'bg-yellow-500 text-black'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
