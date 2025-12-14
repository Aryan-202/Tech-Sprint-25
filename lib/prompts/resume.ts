import type { ResumeData } from '../types'

export function generateResumePrompt(data: ResumeData): string {
  const { personalInfo, education, experience, skills, projects, certifications, objective } = data

  return `You are an expert resume writer and career coach. Create a professional resume based on the following information.

PERSONAL INFORMATION:
- Name: ${personalInfo.fullName}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone}
- Location: ${personalInfo.location}
- LinkedIn: ${personalInfo.linkedin}
- Portfolio: ${personalInfo.portfolio}

EDUCATION:
${education.map(edu => `- ${edu.degree} at ${edu.institution} (${edu.year})${edu.gpa ? `, GPA: ${edu.gpa}` : ''}`).join('\n')}

WORK EXPERIENCE:
${experience.map(exp => `- ${exp.position} at ${exp.company} (${exp.duration})\n  ${exp.description}`).join('\n')}

SKILLS:
${skills.map(skill => `- ${skill}`).join('\n')}

PROJECTS:
${projects.map(proj => `- ${proj.name}: ${proj.description}\n  Technologies: ${proj.technologies}`).join('\n')}

CERTIFICATIONS:
${certifications.map(cert => `- ${cert.name} from ${cert.issuer} (${cert.year})`).join('\n')}

CAREER OBJECTIVE:
${objective}

INSTRUCTIONS:
1. Create a professional resume in proper resume format
2. Use bullet points for achievements and responsibilities
3. Quantify achievements where possible (e.g., "Increased efficiency by 30%")
4. Use action verbs (e.g., Developed, Managed, Implemented)
5. Keep it concise but comprehensive
6. Format with clear sections and proper headings
7. Include a professional summary at the top based on the career objective
8. Tailor the language to be professional and impactful

RESUME FORMAT:
[Name] - [Professional Title based on experience]
[Contact Information]

PROFESSIONAL SUMMARY
[2-3 sentences summarizing career goals and key strengths]

WORK EXPERIENCE
[Company] | [Position] | [Duration]
- [Achievement 1]
- [Achievement 2]

EDUCATION
[Degree] | [Institution] | [Year]
[Relevant details]

SKILLS
[Category 1]: [Skill 1], [Skill 2]
[Category 2]: [Skill 3], [Skill 4]

PROJECTS
[Project Name]
- [Description and achievements]

CERTIFICATIONS
[Certification Name] | [Issuer] | [Year]

Also provide 3-5 suggestions for improving this resume (format, content, keywords, etc.) as bullet points.`
}

export function generateSuggestionsPrompt(resumeContent: string, originalData: ResumeData): string {
  return `Analyze this resume and provide constructive feedback:

RESUME CONTENT:
${resumeContent}

ORIGINAL INFORMATION:
${JSON.stringify(originalData, null, 2)}

Provide 3-5 specific, actionable suggestions for improvement in these areas:
1. Content enhancement (achievements, keywords, action verbs)
2. Formatting and readability improvements
3. Missing information that should be included
4. Optimization for Applicant Tracking Systems (ATS)
5. Industry-specific recommendations

Format as a list of bullet points.`
}