export const APP_CONFIG = {
  name: 'AI Resume Builder',
  description: 'Generate professional resumes with AI',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export const AI_CONFIG = {
  model: 'allenai/olmo-3-32b-think:free',
  maxTokens: 2000,
  temperature: 0.7,
}

export const RESUME_TEMPLATES = [
  { id: 'professional', name: 'Professional', description: 'Clean and traditional' },
  { id: 'modern', name: 'Modern', description: 'Contemporary design' },
  { id: 'creative', name: 'Creative', description: 'For creative fields' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
] as const