import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { CreateTaskPayload, UpdateTaskPayload, ApiResponse, Task } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'user_id is required'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json<ApiResponse<Task[]>>({
      success: true,
      data
    });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch tasks'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: CreateTaskPayload = await request.json();

    if (!body.title || !body.user_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'title and user_id are required'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: body.title,
        user_id: body.user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Task>>({
      success: true,
      data
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create task'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: UpdateTaskPayload = await request.json();

    if (!body.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'id is required'
      }, { status: 400 });
    }

    const updateData: Partial<Task> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.enhanced_title !== undefined) updateData.enhanced_title = body.enhanced_title;
    if (body.completed !== undefined) updateData.completed = body.completed;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Task>>({
      success: true,
      data
    });
  } catch (error) {
    console.error('PATCH /api/tasks error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update task'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'id is required'
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json<ApiResponse>({
      success: true
    });
  } catch (error) {
    console.error('DELETE /api/tasks error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete task'
    }, { status: 500 });
  }
}
