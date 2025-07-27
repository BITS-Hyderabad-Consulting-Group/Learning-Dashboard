import { supabase } from '@/lib/supabase-client';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const signInWithGoogle = async () => {
    const { error } = await 
supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        console.error('Error signing in with Google:', 
error);
    }
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    window.location.href = '/';
    if (error) {
        console.error('Error signing out:', error);
    }
};

export async function verifyAdminAuth(request: 
NextRequest) {
  try {
    const supabaseUrl = 
process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = 
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Create Supabase client for server-side with cookies
    const supabase = createServerClient(supabaseUrl, 
supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // For API routes, we can't set cookies in the response here
          // This will be handled by the response in the route handler
        },
        remove(name: string, options: any) {
          // Similar to set, this would be handled in the route handler
        },
      },
    });

    // Get the current user instead of session for better reliability
    const { data: { user }, error: userError } = await 
supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', 
userError);
      return { error: 'Authentication required', status: 
401 };
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await 
supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', 
profileError);
      return { error: 'Failed to fetch user profile', 
status: 500 };
    }

    if (profile?.role !== 'admin') {
      console.error('User is not admin:', { userId: 
user.id, role: profile?.role });
      return { error: 'Admin access required', status: 
403 };
    }

    return { 
      success: true,
      user, 
      profile,
      supabase // Return supabase client for further use if needed
    };
  } catch (error) {
    console.error('Admin auth error:', error);
    return { error: 'Authentication failed', status: 500 
};
  }
}
