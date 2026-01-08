import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { WebhookPayload, ApiResponse, Task } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: WebhookPayload = await request.json();

    // Optional: Verify webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (expectedSecret && webhookSecret !== expectedSecret) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    switch (body.action) {
      case 'create_task': {
        if ((!body.user_email && !body.user_phone) || !body.title) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'user_email or user_phone, and title are required'
          }, { status: 400 });
        }

        // Get user by email or phone
        let user: { id: string } | null = null;

        if (body.user_phone) {
          // Format phone (digits only) for lookup
          const phoneDigits = body.user_phone.replace(/\D/g, '');
          const { data: phoneUser } = await supabase
            .from('users')
            .select('id')
            .eq('phone', phoneDigits)
            .single();
          user = phoneUser;
        }

        if (!user && body.user_email) {
          const { data: emailUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', body.user_email.toLowerCase())
            .single();
          user = emailUser;

          if (!user) {
            // Create new user with email
            const { data: newUser, error: userError } = await supabase
              .from('users')
              .insert({ email: body.user_email.toLowerCase() })
              .select('id')
              .single();

            if (userError) throw userError;
            user = newUser;
          }
        }

        if (!user) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'User not found. Link your WhatsApp number in the web app first.'
          }, { status: 404 });
        }

        // Create task
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            title: body.title,
            enhanced_title: body.enhanced_title || null,
            user_id: user.id,
          })
          .select()
          .single();

        if (taskError) throw taskError;

        return NextResponse.json<ApiResponse<Task>>({
          success: true,
          data: task
        }, { status: 201 });
      }

      case 'list_tasks': {
        if (!body.user_email) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'user_email is required'
          }, { status: 400 });
        }

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', body.user_email.toLowerCase())
          .single();

        if (!user) {
          return NextResponse.json<ApiResponse<Task[]>>({
            success: true,
            data: []
          });
        }

        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json<ApiResponse<Task[]>>({
          success: true,
          data: tasks
        });
      }

      case 'complete_task': {
        if (!body.task_id) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'task_id is required'
          }, { status: 400 });
        }

        const { data: task, error } = await supabase
          .from('tasks')
          .update({
            completed: body.completed ?? true,
            updated_at: new Date().toISOString()
          })
          .eq('id', body.task_id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json<ApiResponse<Task>>({
          success: true,
          data: task
        });
      }

      case 'update_enhanced_title': {
        if (!body.task_id || !body.enhanced_title) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'task_id and enhanced_title are required'
          }, { status: 400 });
        }

        const { data: task, error } = await supabase
          .from('tasks')
          .update({
            enhanced_title: body.enhanced_title,
            updated_at: new Date().toISOString()
          })
          .eq('id', body.task_id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json<ApiResponse<Task>>({
          success: true,
          data: task
        });
      }

      default:
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/webhook/n8n error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}

// Allow GET for webhook testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'N8N webhook endpoint is active'
  });
}
