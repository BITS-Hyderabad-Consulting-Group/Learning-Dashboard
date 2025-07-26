import { supabase } from '@/lib/supabase-client';

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const { biodata } = await req.json();

  const { error } = await supabase
    .from('profiles')
    .update({ biodata })
    .eq('id', params.userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
