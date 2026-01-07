'use client';

import { useState, useEffect, useCallback } from 'react';
import UserPrompt from '@/components/UserPrompt';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const { tasks, loading, addTask, toggleComplete, updateTitle, deleteTask } = useTasks(userId);

  useEffect(() => {
    const storedUserId = localStorage.getItem('todo_user_id');
    const storedEmail = localStorage.getItem('todo_user_email');

    if (storedUserId && storedEmail) {
      setUserId(storedUserId);
      setUserEmail(storedEmail);
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
    setUserId(null);
    setUserEmail(null);
  }, []);

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
