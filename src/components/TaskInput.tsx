'use client';

import { useState } from 'react';

interface TaskInputProps {
  onAddTask: (title: string) => Promise<void>;
  disabled?: boolean;
}

export default function TaskInput({ onAddTask, disabled }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      await onAddTask(title.trim());
      setTitle('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-4 items-end">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="add a new task..."
          className="input-hand flex-1 text-3xl"
          disabled={disabled || loading}
        />
        <button
          type="submit"
          disabled={disabled || loading || !title.trim()}
          className="btn-hand primary text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'add'}
        </button>
      </div>
    </form>
  );
}
