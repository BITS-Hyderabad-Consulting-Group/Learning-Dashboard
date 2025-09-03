import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type UserLeaderboard = {
  id: string;
  email: string;
  full_name?: string;
  xp: number;
  rank?: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    const supabase = await createSupabaseServerClient();

    // Get all users with XP > 0, ordered by XP in descending order
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, xp')
      .gt('xp', 0)
      .order('xp', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // If userId is provided, add rank to each user
    if (userId) {
      const usersWithRank = users.map((user, index) => ({
        ...user,
        rank: index + 1
      }));

      // Find current user's position
      const currentUser = usersWithRank.find(user => user.id === userId);
      
      return NextResponse.json({
        leaderboard: usersWithRank,
        currentUser: currentUser || null
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a separate endpoint for top 10 and current user
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get top 10 users by XP
    const { data: topUsers, error: topError } = await supabase
      .from('profiles')
      .select('id, email, full_name, xp')
      .gt('xp', 0)
      .order('xp', { ascending: false })
      .limit(10);

    if (topError) {
      console.error('Error fetching top users:', topError);
      return NextResponse.json(
        { error: 'Failed to fetch top users' },
        { status: 500 }
      );
    }

    // Get current user's rank
    const { data: userRank, error: rankError } = await supabase.rpc('get_user_rank', {
      user_id: userId
    });

    // Get current user's data
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name, xp')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching current user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch current user data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      topUsers,
      currentUser: {
        ...currentUser,
        rank: userRank || 0
      }
    });
  } catch (error) {
    console.error('Error in leaderboard top API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
