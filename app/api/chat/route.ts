import { NextRequest, NextResponse } from 'next/server';
import { generateResumeContent, resumeSystemPrompt } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { messages, useReasoning = true } = await request.json();

    // Add system prompt if it's the first message
    const enhancedMessages = messages.length === 1 
      ? [{ role: 'system', content: resumeSystemPrompt }, ...messages]
      : messages;

    const aiResponse = await generateResumeContent(enhancedMessages, useReasoning);
    
    return NextResponse.json({
      message: aiResponse.content,
      reasoning_details: aiResponse.reasoning_details,
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}