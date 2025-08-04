import { supabase } from '@/lib/supabase-client';

// Define the params type as a Promise for Next.js 15
type Params = Promise<{ userId: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
    const { biodata } = await req.json();
    const { userId } = await params;

    const { error } = await supabase.from('profiles').update({ biodata }).eq('id', userId);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
