import { ResumeData } from '@/types';

export function parseAIResponse(content: string): { resumeData?: ResumeData; message: string } {
  try {
    // First, try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (error) {
        // If parsing fails, try to clean the JSON
        const cleaned = jsonMatch[0]
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        parsed = JSON.parse(cleaned);
      }
      
      if (parsed.resumeData) {
        // Ensure all required fields exist
        const resumeData: ResumeData = {
          personalInfo: {
            name: parsed.resumeData.personalInfo?.name || '',
            email: parsed.resumeData.personalInfo?.email || '',
            phone: parsed.resumeData.personalInfo?.phone || '',
            location: parsed.resumeData.personalInfo?.location || '',
            linkedin: parsed.resumeData.personalInfo?.linkedin || '',
            github: parsed.resumeData.personalInfo?.github || '',
            portfolio: parsed.resumeData.personalInfo?.portfolio || ''
          },
          summary: parsed.resumeData.summary || '',
          experience: parsed.resumeData.experience || [],
          education: parsed.resumeData.education || [],
          skills: parsed.resumeData.skills || [],
          projects: parsed.resumeData.projects || [],
          certifications: parsed.resumeData.certifications || []
        };
        
        return {
          resumeData,
          message: "I've updated your resume. Check the preview!"
        };
      }
    }
    
    // Check if this looks like a resume-related response
    if (content.toLowerCase().includes('resume') || 
        content.toLowerCase().includes('experience') || 
        content.toLowerCase().includes('skill')) {
      return { 
        message: "I understand you want help with your resume. Could you provide more specific details about your work experience, education, or skills?"
      };
    }
    
    // Return the content as a message
    return { message: content };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return { 
      message: content.includes('{') 
        ? "I tried to update your resume but encountered an error. Please try rephrasing your information." 
        : content 
    };
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function validateResumeData(data: any): data is ResumeData {
  return (
    data &&
    typeof data === 'object' &&
    data.personalInfo &&
    typeof data.personalInfo.name === 'string' &&
    typeof data.personalInfo.email === 'string'
  );
}