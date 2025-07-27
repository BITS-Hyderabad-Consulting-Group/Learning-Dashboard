import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminAuth } from '@/lib/auth';
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error 
}, { 
status: authResult.status });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || 
'1');
    const limit = parseInt(searchParams.get('limit') || 
'10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const domain = searchParams.get('domain') || '';
    const offset = (page - 1) * limit;
    // Build query
    let query = supabaseServer
      .from('courses')
      .select(`
        id,
        title,
        description,
        created_at,
        updated_at,
        is_active,
        list_price,
        instructor:profiles(full_name),
        weeks(id),
        user_course_enrollments(id)
      `, { count: 'exact' });
    // Apply filters
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }
    const { data: courses, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ error: 'Failed to fetch 
courses' 
}, { status: 500 });
    }
    const transformedCourses = courses?.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor?.full_name || 'N/A',
      status: course.is_active ? 'active' : 'inactive',
      modules: course.weeks?.length || 0,
      attendees: course.user_course_enrollments?.length 
|| 0,
      created_at: course.created_at,
      updated_at: course.updated_at,
      list_price: course.list_price
    })) || [];
    return NextResponse.json({
      courses: transformedCourses,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Admin courses API error:', error);
    return NextResponse.json({ error: 'Internal server 
error' }, { 
status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error 
}, { 
status: authResult.status });
    }
    const body = await request.json();
    const {
      title,
      description,
      duration,
      prerequisites,
      objectives,
      list_price,
      difficulty_level,
      instructor_id
    } = body;
    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    // Create new course
    const { data: newCourse, error: createError } = 
await 
supabaseServer
      .from('courses')
      .insert([
        {
          title,
          description,
          duration: duration || 0,
          prerequisites: prerequisites || '',
          objectives: objectives || [],
          list_price: list_price || 0,
          difficulty_level: difficulty_level || 
'beginner',
          instructor_id: instructor_id || 
authResult.user.id,
          is_active: false, // Start as draft
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    if (createError) {
      console.error('Error creating course:', 
createError);
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: 'Course created successfully',
      course: newCourse
    }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Internal server 
error' }, { 
status: 500 });
  }
}

