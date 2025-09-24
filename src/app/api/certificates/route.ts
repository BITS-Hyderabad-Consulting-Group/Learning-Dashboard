import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth-server';
import { supabaseServer } from '@/lib/supabase-server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// POST /api/certificates
// Body: { name: string, courseId: string }
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { name, courseId } = body as { name?: string; courseId?: string };
    if (!name || !courseId) {
      return NextResponse.json({ error: 'name and courseId are required' }, { status: 400 });
    }

    const { data: course, error } = await supabaseServer
      .from('courses')
      .select('id, title, domain, created_at')
      .eq('id', courseId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
    }
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Create a simple certificate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Background border
    page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderColor: rgb(0.2, 0.6, 0.6), borderWidth: 6 });

    // Title
    const title = 'Certificate of Completion';
    const titleSize = 32;
    const titleWidth = font.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: (842 - titleWidth) / 2,
      y: 480,
      size: titleSize,
      font,
      color: rgb(0.1, 0.35, 0.35),
    });

    // Recipient name
    const nameText = name;
    const nameSize = 28;
    const nameWidth = font.widthOfTextAtSize(nameText, nameSize);
    page.drawText(nameText, {
      x: (842 - nameWidth) / 2,
      y: 400,
      size: nameSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Course line
    const courseLine = `has successfully completed the course: ${course.title}`;
    const courseSize = 16;
    const courseWidth = fontRegular.widthOfTextAtSize(courseLine, courseSize);
    page.drawText(courseLine, {
      x: (842 - courseWidth) / 2,
      y: 360,
      size: courseSize,
      font: fontRegular,
      color: rgb(0.15, 0.15, 0.15),
    });

    // Footer date
    const dateStr = new Date().toLocaleDateString();
    const footer = `Issued on ${dateStr}`;
    const footerWidth = fontRegular.widthOfTextAtSize(footer, 12);
    page.drawText(footer, { x: (842 - footerWidth) / 2, y: 80, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${courseId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const msg = typeof (e as Error).message === 'string' ? (e as Error).message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
