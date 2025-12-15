import { NextRequest, NextResponse } from 'next/server';
import { resumeSystemPrompt } from '@/lib/openrouter';

const MARKDOWN_SYSTEM_PROMPT = `You are an expert resume builder AI. Your task is to generate a professional resume in clean, structured Markdown format.

IMPORTANT: When I provide enough information about my resume, you MUST respond with ONLY a markdown document in this exact format - NO extra text before or after:

# [Full Name]

**Contact Information**  
Email: [email]  
Phone: [phone]  
Location: [city, state/country]  
[LinkedIn: [linkedin-url]](linkedin-url) | [GitHub: [github-url]](github-url) | [Portfolio: [portfolio-url]](portfolio-url)

## Professional Summary
[2-3 sentence professional summary highlighting key skills, experience, and career objectives.]

## Work Experience

### [Job Title]
**[Company Name]** | [Location] | [Start Date] - [End Date]
- [Achievement 1 with metrics if possible]
- [Achievement 2 with metrics if possible]
- [Achievement 3 with metrics if possible]

### [Job Title]
**[Company Name]** | [Location] | [Start Date] - [End Date]
- [Achievement 1]
- [Achievement 2]
- [Achievement 3]

## Education

### [Degree Name]
**[Institution Name]** | [Location] | [Graduation Date]
- GPA: [GPA if available]
- Relevant Courses: [Course 1], [Course 2], [Course 3]

## Skills

**Technical Skills:** [Skill 1], [Skill 2], [Skill 3], [Skill 4]  
**Tools & Technologies:** [Tool 1], [Tool 2], [Tool 3]  
**Soft Skills:** [Skill 1], [Skill 2], [Skill 3]

## Projects

### [Project Name]
[Brief description of the project and your role]
- **Technologies:** [Tech 1], [Tech 2], [Tech 3]
- **Key Contributions:** [Contribution 1], [Contribution 2]
- **Link:** [Project URL if available]

## Certifications

- **[Certification Name]** - [Issuing Organization] ([Date])
- **[Certification Name]** - [Issuing Organization] ([Date])

---

**RULES:**
1. Use proper markdown formatting with headers (##, ###), bullet points, and bold text
2. Include ALL sections even if some are empty
3. Use consistent formatting throughout
4. Make achievements action-oriented and quantified when possible
5. Use proper markdown links for URLs
6. DO NOT include any explanations before or after the markdown
7. Fill in with actual user information or use placeholders if information is missing

Now, generate a markdown resume based on the conversation history.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add markdown system prompt
    const enhancedMessages = [
      { role: 'system', content: MARKDOWN_SYSTEM_PROMPT },
      ...messages
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Resume Generator - Markdown',
      },
      body: JSON.stringify({
        model: "allenai/olmo-3-32b-think:free",
        messages: enhancedMessages,
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error("No response from AI model");
    }
    
    const markdownContent = result.choices[0].message.content;
    
    // Clean up the markdown (remove any code blocks if present)
    let cleanMarkdown = markdownContent;
    if (markdownContent.includes('```markdown')) {
      cleanMarkdown = markdownContent.replace(/```markdown\n?|\n?```/g, '');
    } else if (markdownContent.includes('```')) {
      cleanMarkdown = markdownContent.replace(/```\n?|\n?```/g, '');
    }
    
    return NextResponse.json({
      markdown: cleanMarkdown,
      filename: generateFilename(markdownContent),
    });
  } catch (error: any) {
    console.error('Markdown generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate markdown resume',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateFilename(markdownContent: string): string {
  // Try to extract name from markdown
  const nameMatch = markdownContent.match(/^# (.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : 'resume';
  
  // Clean filename
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${cleanName || 'resume'}-${new Date().toISOString().split('T')[0]}.md`;
}