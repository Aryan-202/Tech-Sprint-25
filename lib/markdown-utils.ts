import { ResumeData } from '@/types';

export function generateMarkdownFromResumeData(resumeData: ResumeData): string {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

  let markdown = `# ${personalInfo.name}\n\n`;

  // Contact Information
  markdown += `**Contact Information**  \n`;
  markdown += `Email: ${personalInfo.email}  \n`;
  if (personalInfo.phone) markdown += `Phone: ${personalInfo.phone}  \n`;
  if (personalInfo.location) markdown += `Location: ${personalInfo.location}  \n`;
  
  const links = [];
  if (personalInfo.linkedin) links.push(`[LinkedIn](${personalInfo.linkedin})`);
  if (personalInfo.github) links.push(`[GitHub](${personalInfo.github})`);
  if (personalInfo.portfolio) links.push(`[Portfolio](${personalInfo.portfolio})`);
  
  if (links.length > 0) {
    markdown += `${links.join(' | ')}\n`;
  }
  
  markdown += `\n`;

  // Professional Summary
  if (summary) {
    markdown += `## Professional Summary\n`;
    markdown += `${summary}\n\n`;
  }

  // Work Experience
  if (experience.length > 0) {
    markdown += `## Work Experience\n\n`;
    experience.forEach(exp => {
      markdown += `### ${exp.title}\n`;
      markdown += `**${exp.company}** | ${exp.location} | ${exp.startDate} - ${exp.endDate}\n`;
      exp.achievements.forEach(achievement => {
        markdown += `- ${achievement}\n`;
      });
      markdown += `\n`;
    });
  }

  // Education
  if (education.length > 0) {
    markdown += `## Education\n\n`;
    education.forEach(edu => {
      markdown += `### ${edu.degree}\n`;
      markdown += `**${edu.institution}** | ${edu.location} | ${edu.startDate} - ${edu.endDate}\n`;
      if (edu.gpa) markdown += `- GPA: ${edu.gpa}\n`;
      if (edu.relevantCourses && edu.relevantCourses.length > 0) {
        markdown += `- Relevant Courses: ${edu.relevantCourses.join(', ')}\n`;
      }
      markdown += `\n`;
    });
  }

  // Skills
  if (skills.length > 0) {
    markdown += `## Skills\n\n`;
    skills.forEach(skillCategory => {
      markdown += `**${skillCategory.category}:** ${skillCategory.items.join(', ')}\n`;
    });
    markdown += `\n`;
  }

  // Projects
  if (projects.length > 0) {
    markdown += `## Projects\n\n`;
    projects.forEach(project => {
      markdown += `### ${project.name}\n`;
      markdown += `${project.description}\n`;
      if (project.technologies.length > 0) {
        markdown += `- **Technologies:** ${project.technologies.join(', ')}\n`;
      }
      if (project.link) {
        markdown += `- **Link:** [${project.link}](${project.link})\n`;
      }
      markdown += `\n`;
    });
  }

  // Certifications
  if (certifications.length > 0) {
    markdown += `## Certifications\n\n`;
    certifications.forEach(cert => {
      markdown += `- **${cert.name}** - ${cert.issuer} (${cert.date})\n`;
    });
  }

  return markdown;
}

export function downloadMarkdown(markdown: string, filename: string = 'resume.md'): void {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateMarkdownFromAI(messages: any[]): Promise<{ markdown: string; filename: string }> {
  const response = await fetch('/api/generate-markdown', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate markdown');
  }

  return response.json();
}