import { NextRequest, NextResponse } from 'next/server';
import { generateResumeContent, resumeSystemPrompt } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { messages, useReasoning = true } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add system prompt if it's the first message
    const enhancedMessages = messages.length === 1 
      ? [{ role: 'system', content: resumeSystemPrompt }, ...messages]
      : messages;

    const aiResponse = await generateResumeContent(enhancedMessages, useReasoning);
    
    return NextResponse.json({
      message: aiResponse.content || '',
      reasoning_details: aiResponse.reasoning_details,
      role: 'assistant'
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}