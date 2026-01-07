'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskItem({ task, onToggleComplete, onUpdateTitle, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id, !task.completed);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle === task.title) {
      setEditing(false);
      setEditTitle(task.title);
      return;
    }

    setLoading(true);
    try {
      await onUpdateTitle(task.id, editTitle.trim());
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditTitle(task.title);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(task.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`task-item flex items-start gap-4 p-4 rounded-lg fade-in ${
        task.completed ? 'task-completed' : ''
      }`}
    >
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`checkbox-hand flex-shrink-0 mt-1 ${task.completed ? 'checked' : ''}`}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="input-hand w-full text-2xl"
            autoFocus
          />
        ) : (
          <div
            onClick={() => !task.completed && setEditing(true)}
            className={`cursor-pointer ${!task.completed ? 'hover:text-indigo-600' : ''}`}
          >
            <p className="task-title text-2xl break-words">
              {task.enhanced_title || task.title}
            </p>
            {task.enhanced_title && task.enhanced_title !== task.title && (
              <p className="enhanced-badge mt-1">
                original: {task.title}
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex-shrink-0 text-2xl text-gray-400 hover:text-red-500 transition-colors p-2"
        aria-label="Delete task"
      >
        x
      </button>
    </div>
  );
}
