import { supabase } from '@/lib/supabase-client';



export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400 });
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role, email, xp, created_at, photo_url')
        .eq('id', userId)
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
    
}
