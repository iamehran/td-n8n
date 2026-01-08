'use client';

import { useState, useEffect, useCallback } from 'react';
import UserPrompt from '@/components/UserPrompt';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const { tasks, loading, enhancingIds, addTask, toggleComplete, updateTitle, deleteTask } = useTasks(userId);

  useEffect(() => {
    const storedUserId = localStorage.getItem('todo_user_id');
    const storedEmail = localStorage.getItem('todo_user_email');
    const storedPhone = localStorage.getItem('todo_user_phone');

    if (storedUserId && storedEmail) {
      setUserId(storedUserId);
      setUserEmail(storedEmail);
      setUserPhone(storedPhone);
    }
    setInitializing(false);
  }, []);

  const handleUserSet = useCallback((id: string, email: string) => {
    setUserId(id);
    setUserEmail(email);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('todo_user_id');
    localStorage.removeItem('todo_user_email');
    localStorage.removeItem('todo_user_phone');
    setUserId(null);
    setUserEmail(null);
    setUserPhone(null);
  }, []);

  const handleSavePhone = async () => {
    if (!userId) return;
    setSavingPhone(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, phone: phoneInput.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        const newPhone = data.data.phone;
        setUserPhone(newPhone);
        if (newPhone) {
          localStorage.setItem('todo_user_phone', newPhone);
        } else {
          localStorage.removeItem('todo_user_phone');
        }
        setEditingPhone(false);
      }
    } finally {
      setSavingPhone(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">to-do</h1>
          <p className="text-xl text-gray-400">loading...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return <UserPrompt onUserSet={handleUserSet} />;
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen min-h-dvh flex flex-col">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <header className="flex items-start justify-between mb-8 sm:mb-10 slide-up">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              to-do
            </h1>
            <p className="text-lg sm:text-xl text-[var(--accent)] font-medium mt-0.5">
              (but with AI)
            </p>
            <p className="text-base sm:text-lg text-[var(--muted)] mt-2 truncate max-w-[200px] sm:max-w-none">
              {userEmail}
            </p>
            {/* Phone linking */}
            <div className="mt-2">
              {editingPhone ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1234567890"
                    className="input-hand text-sm sm:text-base py-1 px-2 w-32 sm:w-40"
                    autoFocus
                  />
                  <button
                    onClick={handleSavePhone}
                    disabled={savingPhone}
                    className="btn-hand text-sm py-1 px-2"
                  >
                    {savingPhone ? '...' : 'save'}
                  </button>
                  <button
                    onClick={() => setEditingPhone(false)}
                    className="btn-hand text-sm py-1 px-2"
                  >
                    ×
                  </button>
                </div>
              ) : userPhone ? (
                <button
                  onClick={() => { setPhoneInput(userPhone); setEditingPhone(true); }}
                  className="text-sm sm:text-base text-[var(--success)] hover:underline"
                >
                  WhatsApp linked
                </button>
              ) : (
                <button
                  onClick={() => { setPhoneInput(''); setEditingPhone(true); }}
                  className="text-sm sm:text-base text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  + link WhatsApp
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-hand text-base sm:text-lg mt-1"
          >
            logout
          </button>
        </header>

        {/* Stats bar */}
        {totalCount > 0 && (
          <div className="flex items-center gap-4 mb-6 text-base sm:text-lg text-[var(--muted-dark)] fade-in">
            <span>{totalCount} task{totalCount !== 1 ? 's' : ''}</span>
            <span className="text-[var(--border-dark)]">|</span>
            <span className="text-[var(--success)]">{completedCount} done</span>
          </div>
        )}

        {/* Task Input */}
        <TaskInput onAddTask={addTask} />

        {/* Task List */}
        <TaskList
          tasks={tasks}
          loading={loading}
          enhancingIds={enhancingIds}
          onToggleComplete={toggleComplete}
          onUpdateTitle={updateTitle}
          onDelete={deleteTask}
        />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 border-t border-[var(--border)] safe-bottom">
        <p className="text-base sm:text-lg text-[var(--muted)] text-center">
          send a WhatsApp message with <span className="text-[var(--accent)] font-semibold">#to-do</span> to add tasks
        </p>
      </footer>
    </div>
  );
}
