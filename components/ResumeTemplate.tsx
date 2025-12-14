'use client';

import { ResumeData } from '@/types';

interface ResumeTemplateProps {
  resumeData: ResumeData;
}

export default function ResumeTemplate({ resumeData }: ResumeTemplateProps) {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {resumeData.personalInfo.name}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {resumeData.personalInfo.email}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {resumeData.personalInfo.phone}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {resumeData.personalInfo.location}
          </span>
        </div>
        <div className="flex justify-center gap-4">
          {resumeData.personalInfo.linkedin && (
            <a href={resumeData.personalInfo.linkedin} className="text-blue-600 hover:text-blue-800">
              LinkedIn
            </a>
          )}
          {resumeData.personalInfo.github && (
            <a href={resumeData.personalInfo.github} className="text-gray-700 hover:text-black">
              GitHub
            </a>
          )}
          {resumeData.personalInfo.portfolio && (
            <a href={resumeData.personalInfo.portfolio} className="text-purple-600 hover:text-purple-800">
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {resumeData.summary && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resumeData.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Experience</h2>
          <div className="space-y-6">
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company} • {exp.location}</p>
                  </div>
                  <span className="text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Education</h2>
          <div className="space-y-4">
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution} • {edu.location}</p>
                  {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Relevant Courses: {edu.relevantCourses.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-gray-600 block">
                    {edu.startDate} - {edu.endDate}
                  </span>
                  {edu.gpa && (
                    <span className="text-gray-600">GPA: {edu.gpa}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Skills</h2>
          <div className="space-y-4">
            {resumeData.skills.map((skillCategory, idx) => (
              <div key={idx}>
                <h3 className="font-medium text-gray-700 mb-2">{skillCategory.category}:</h3>
                <div className="flex flex-wrap gap-2">
                  {skillCategory.items.map((skill, skillIdx) => (
                    <span
                      key={skillIdx}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resumeData.projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Projects</h2>
          <div className="space-y-4">
            {resumeData.projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.link && (
                    <a href={project.link} className="text-blue-600 hover:text-blue-800 text-sm">
                      View Project
                    </a>
                  )}
                </div>
                <p className="text-gray-700 mt-1">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {resumeData.certifications.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Certifications</h2>
          <div className="space-y-3">
            {resumeData.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-700">{cert.issuer}</p>
                </div>
                <span className="text-gray-600">{cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}