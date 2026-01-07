export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  enhanced_title: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  user_id: string;
}

export interface UpdateTaskPayload {
  id: string;
  title?: string;
  enhanced_title?: string;
  completed?: boolean;
}

export interface WebhookPayload {
  action: 'create_task' | 'list_tasks' | 'complete_task' | 'update_enhanced_title';
  user_email?: string;
  task_id?: string;
  title?: string;
  enhanced_title?: string;
  completed?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
