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
        {/* Compact Header */}
        <header className="mb-6 slide-up">
          {/* Title row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">to-do</h1>
              <span className="text-sm sm:text-base text-[var(--accent)] font-medium">(but with AI)</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              logout
            </button>
          </div>
          {/* Info row */}
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <span className="truncate max-w-[150px] sm:max-w-[200px]">{userEmail}</span>
            <span className="text-[var(--border-dark)]">•</span>
            {editingPhone ? (
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+1234567890"
                  className="input-hand text-sm py-0.5 px-2 w-28"
                  autoFocus
                />
                <button
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  {savingPhone ? '...' : 'save'}
                </button>
                <button
                  onClick={() => setEditingPhone(false)}
                  className="text-sm hover:text-[var(--foreground)]"
                >
                  ×
                </button>
              </div>
            ) : userPhone ? (
              <button
                onClick={() => { setPhoneInput(userPhone); setEditingPhone(true); }}
                className="text-sm text-[var(--success)] hover:underline"
              >
                WhatsApp linked
              </button>
            ) : (
              <button
                onClick={() => { setPhoneInput(''); setEditingPhone(true); }}
                className="text-sm hover:text-[var(--accent)]"
              >
                + link WhatsApp
              </button>
            )}
          </div>
        </header>

        {/* Stats bar */}
        {totalCount > 0 && (
          <div className="flex items-center gap-3 mb-4 text-sm text-[var(--muted-dark)] fade-in">
            <span>{totalCount} task{totalCount !== 1 ? 's' : ''}</span>
            <span className="text-[var(--border-dark)]">•</span>
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
