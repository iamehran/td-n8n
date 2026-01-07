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

  const displayTitle = task.enhanced_title || task.title;
  const hasEnhancement = task.enhanced_title && task.enhanced_title !== task.title;

  return (
    <div
      className={`task-item flex items-start gap-3 sm:gap-4 p-3 sm:p-4 fade-in ${
        task.completed ? 'task-completed' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`checkbox-hand flex-shrink-0 mt-0.5 ${task.completed ? 'checked' : ''}`}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="input-hand w-full text-lg sm:text-xl lg:text-2xl"
            autoFocus
          />
        ) : (
          <div
            onClick={() => !task.completed && setEditing(true)}
            className={`cursor-pointer ${!task.completed ? 'active:opacity-70' : ''}`}
          >
            <p className="task-title text-lg sm:text-xl lg:text-2xl break-words leading-relaxed">
              {displayTitle}
              {hasEnhancement && (
                <span className="ai-enhanced ml-2 text-xs sm:text-sm">
                  AI
                </span>
              )}
            </p>
            {hasEnhancement && (
              <p className="text-sm sm:text-base text-[var(--muted)] mt-1 italic">
                was: {task.title}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="delete-btn flex-shrink-0 text-xl sm:text-2xl"
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  );
}
