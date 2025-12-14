const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateResumeContent(messages: any[], useReasoning: boolean = true) {
  try {
    const requestBody: any = {
      model: "allenai/olmo-3-32b-think:free",
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
    };

    if (useReasoning) {
      requestBody.reasoning = { enabled: true };
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Resume Generator",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0].message;
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
}

export const resumeSystemPrompt = `You are an expert resume builder AI. Your task is to help users create professional resumes by asking relevant questions and generating structured resume content.

GUIDELINES:
1. Start by asking about their career field, experience level, and target job
2. Ask specific questions to gather comprehensive information
3. Structure the resume data in JSON format with these sections:
   - personalInfo (name, contact, links)
   - summary (professional summary)
   - experience (jobs with descriptions and achievements)
   - education
   - skills (categorized)
   - projects
   - certifications

4. Focus on achievements using action verbs and quantifiable results
5. Keep responses concise and professional
6. After gathering enough information, generate a complete resume

RESPONSE FORMAT:
For regular conversation: Provide helpful, engaging responses
For resume generation: Return JSON only in this exact format:
{
  "resumeData": { ...complete resume structure... }
}

Start by greeting the user and asking about their career field and experience.`;