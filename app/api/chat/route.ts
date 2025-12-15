import { NextRequest, NextResponse } from 'next/server';
import { generateResumeContent, resumeSystemPrompt } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { messages, useReasoning = true, format = 'json' } = await request.json();

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
    
    // Check if the response contains JSON (only for JSON format)
    let jsonResponse = null;
    if (format === 'json') {
      try {
        const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error parsing JSON from AI response:', error);
      }
    }
    
    return NextResponse.json({
      message: aiResponse.content || '',
      reasoning_details: aiResponse.reasoning_details,
      json_data: jsonResponse,
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