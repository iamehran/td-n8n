'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?user_id=${userId}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      setTasks(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string) => {
    if (!userId) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, user_id: userId }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create task');
      }

      const newTask = data.data;
      setTasks((prev) => [newTask, ...prev]);

      // Poll for AI enhancement (checks every 3 seconds, up to 5 times)
      pollForEnhancement(newTask.id, userId, (updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update task');
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? data.data : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const updateTitle = async (id: string, title: string) => {
    if (!userId) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, enhanced_title: null }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update task');
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? data.data : t))
      );

      // Poll for AI enhancement on updated title
      pollForEnhancement(id, userId, (updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete task');
      }

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleComplete,
    updateTitle,
    deleteTask,
    refetch: fetchTasks,
  };
}

// Poll for AI enhancement after task creation
// Checks every 3 seconds, up to 5 times, stops early if enhanced_title is found
async function pollForEnhancement(
  taskId: string,
  userId: string,
  onUpdate: (task: Task) => void
) {
  const maxAttempts = 5;
  const interval = 3000; // 3 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, interval));

    try {
      const res = await fetch(`/api/tasks?user_id=${userId}`);
      const data = await res.json();

      if (data.success && data.data) {
        const task = data.data.find((t: Task) => t.id === taskId);
        if (task?.enhanced_title) {
          onUpdate(task);
          return; // Stop polling, we got the enhanced title
        }
      }
    } catch {
      // Ignore polling errors, continue trying
    }
  }
}
