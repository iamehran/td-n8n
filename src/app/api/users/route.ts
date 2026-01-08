import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { ApiResponse, User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { email, name, phone } = await request.json();

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'email is required'
      }, { status: 400 });
    }

    // Try to find existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json<ApiResponse<User>>({
        success: true,
        data: existingUser
      });
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        phone: phone ? formatPhone(phone) : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: newUser
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get or create user'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { id, phone } = await request.json();

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'id is required'
      }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        phone: phone ? formatPhone(phone) : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('PATCH /api/users error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// Format phone to E.164-like format (digits only with country code)
function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If starts with 0, assume local and add country code might be needed
  // For simplicity, just store digits - N8N can handle format matching
  return digits;
}
