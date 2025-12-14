export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
}

export interface Education {
  institution: string
  degree: string
  year: string
  gpa: string
}

export interface Experience {
  company: string
  position: string
  duration: string
  description: string
}

export interface Project {
  name: string
  description: string
  technologies: string
}

export interface Certification {
  name: string
  issuer: string
  year: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  skills: string[]
  projects: Project[]
  certifications: Certification[]
  objective: string
}

export interface GeneratedResume {
  content: string
  suggestions?: string[]
  generatedAt: string
}