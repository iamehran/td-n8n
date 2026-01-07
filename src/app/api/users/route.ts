import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { ApiResponse, User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { email, name } = await request.json();

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
