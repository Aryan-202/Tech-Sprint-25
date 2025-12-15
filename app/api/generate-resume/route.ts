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
    
    // Check if the response contains JSON
    const responseText = aiResponse.content;
    let jsonResponse = null;
    
    // Try to extract JSON from the response
    try {
      // Look for JSON pattern in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing JSON from AI response:', error);
    }
    
    return NextResponse.json({
      message: responseText,
      reasoning_details: aiResponse.reasoning_details,
      json_data: jsonResponse, // Add parsed JSON separately
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}