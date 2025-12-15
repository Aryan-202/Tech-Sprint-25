import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { markdown, filename = 'resume.md' } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    // Create response with markdown file
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create download',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also handle GET for direct download with query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const content = searchParams.get('content');
    const filename = searchParams.get('filename') || 'resume.md';

    if (!content) {
      return NextResponse.json(
        { error: 'Content parameter is required' },
        { status: 400 }
      );
    }

    // Decode the content
    const markdownContent = decodeURIComponent(content);

    // Create response with markdown file
    return new NextResponse(markdownContent, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Download GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create download',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}