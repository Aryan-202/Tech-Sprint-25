'use client';

import { ResumeData } from '@/types';
import ResumeTemplate from './ResumeTemplate';

interface ResumePreviewProps {
  resumeData: ResumeData;
  isLoading: boolean;
}

export default function ResumePreview({ resumeData, isLoading }: ResumePreviewProps) {
  const handleDownload = () => {
    // Create a printable version of the resume
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resumeData.personalInfo.name} - Resume</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; }
              .resume { max-width: 800px; margin: 0 auto; }
              .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 30px; }
              .section-title { color: #2c5282; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
              .experience-item, .education-item { margin-bottom: 20px; }
              .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
              .skill-tag { background: #edf2f7; padding: 4px 12px; border-radius: 15px; font-size: 0.9em; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="resume">
              ${document.getElementById('resume-content')?.innerHTML || ''}
            </div>
            <script>
              window.onload = () => window.print();
            </script>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Resume Preview</h2>
            <p className="text-sm text-gray-600">
              {resumeData.personalInfo.name || 'Your resume will appear here'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={!resumeData.personalInfo.name}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Updating resume...</p>
            </div>
          </div>
        ) : resumeData.personalInfo.name ? (
          <div id="resume-content">
            <ResumeTemplate resumeData={resumeData} />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Your Resume Awaits
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Start chatting with the AI assistant on the left to build your resume.
              Answer questions about your experience, skills, and career goals.
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-gray-50 text-sm text-gray-600 rounded-b-xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {resumeData.experience.length} Experience{resumeData.experience.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {resumeData.education.length} Education
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {resumeData.skills.reduce((acc, cat) => acc + cat.items.length, 0)} Skills
            </span>
          </div>
          <div className="text-xs">
            Auto-saved • Updates in real-time
          </div>
        </div>
      </div>
    </div>
  );
}