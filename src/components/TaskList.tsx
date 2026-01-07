'use client';

import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskList({
  tasks,
  loading,
  onToggleComplete,
  onUpdateTitle,
  onDelete,
}: TaskListProps) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="py-8 sm:py-12 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="w-7 h-7 rounded-md loading-shimmer" />
            <div className="flex-1 h-6 rounded loading-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 slide-up">
        <p className="text-2xl sm:text-3xl text-[var(--muted-dark)] mb-3">no tasks yet</p>
        <p className="text-base sm:text-lg text-[var(--muted)]">
          add one above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Active tasks */}
      {incompleteTasks.length > 0 && (
        <div className="space-y-1 sm:space-y-2">
          {incompleteTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onUpdateTitle={onUpdateTitle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h3 className="text-base sm:text-lg text-[var(--muted)] mb-3 sm:mb-4 pb-2 border-b border-[var(--border)]">
            completed ({completedTasks.length})
          </h3>
          <div className="space-y-1 sm:space-y-2 opacity-70">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onUpdateTitle={onUpdateTitle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
