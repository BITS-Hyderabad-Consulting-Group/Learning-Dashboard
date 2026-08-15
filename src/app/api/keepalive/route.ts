import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const { error } = await supabaseServer
    .from('courses')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Supabase keepalive failed:', error);

    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}