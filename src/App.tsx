import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Pomodoro } from '@/pages/Pomodoro';
import { Tasks } from '@/pages/Tasks';
import { CalendarPage } from '@/pages/CalendarPage';
import { Habits } from '@/pages/Habits';
import { Finance } from '@/pages/Finance';

function App() {
  return (
    <BrowserRouter basename="/discipline-front">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
