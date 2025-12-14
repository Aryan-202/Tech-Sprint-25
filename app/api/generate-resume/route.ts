import { NextRequest, NextResponse } from 'next/server'
import { generateResume } from '@/lib/ai/openrouter'
import type { ResumeData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const resumeData: ResumeData = await request.json()

    // Validate required fields
    if (!resumeData.personalInfo.fullName || !resumeData.personalInfo.email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      )
    }

    // Generate resume using AI
    const generatedResume = await generateResume(resumeData)

    return NextResponse.json(generatedResume)
  } catch (error) {
    console.error('Error in generate-resume API:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate resume', details: (error as Error).message },
      { status: 500 }
    )
  }
}