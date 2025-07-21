import { supabase } from '@/lib/supabase';

export async function GET() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');   // You can limit or filter if needed

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}
