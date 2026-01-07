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

  // Check for existing user session
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

  // Show loading state while checking for existing session
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-3xl text-gray-400">loading...</p>
      </div>
    );
  }

  // Show user prompt if not logged in
  if (!userId) {
    return <UserPrompt onUserSet={handleUserSet} />;
  }

  // Main app
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold">to-do</h1>
            <p className="text-xl text-gray-400 mt-1">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-hand text-lg"
          >
            logout
          </button>
        </header>

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

        {/* Footer hint */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-lg text-gray-400">
            tip: send a WhatsApp message with #to-do to add tasks on the go
          </p>
        </footer>
      </div>
    </div>
  );
}
