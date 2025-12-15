# app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

---

# app/api/chat/route.ts

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
    
    return NextResponse.json({
      message: aiResponse.content,
      reasoning_details: aiResponse.reasoning_details,
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

---

# app/api/generate-resume/route.ts

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

---

# app/dashboard/page.tsx

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, History, Settings, Download } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  const user = session.user

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Manage your resumes and templates</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create New Resume
            </CardTitle>
            <CardDescription>Start building a new resume from scratch</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/resume">
                Start Building
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Resumes
            </CardTitle>
            <CardDescription>Your previously created resumes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">No recent resumes yet</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <Button variant="outline" className="w-full">
                Account Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <Link href="/templates">
              Browse Templates
            </Link>
          </Button>
          <Button variant="outline">
            Import from LinkedIn
          </Button>
          <Button variant="outline">
            Resume Tips
          </Button>
        </div>
      </div>
    </div>
  )
}

---

# app/globals.css

@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}


---

# app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Inter } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] })

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

---

# app/page.tsx

import Link from 'next/link'
import { ArrowRight, Sparkles, FileText, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'AI-Powered Generation',
      description: 'Get professionally crafted resumes using advanced AI algorithms'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Multiple Templates',
      description: 'Choose from various professional resume templates'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Fast & Efficient',
      description: 'Generate a complete resume in under 2 minutes'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Privacy Focused',
      description: 'Your data is never stored or shared with third parties'
    }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Create Your Perfect Resume with{' '}
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                V Place
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Transform your career profile into a professional resume that stands out. 
              Powered by advanced AI to highlight your strengths and achievements.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={session ? "/dashboard" : "/api/auth/signin"}>
                  {session ? "Go to Dashboard" : "Start Building Free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Why Choose Our AI Resume Builder</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to create a professional resume
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to land your dream job?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of successful job seekers who used our AI Resume Builder
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-blue-600 hover:bg-gray-100"
            asChild
          >
            <Link href={session ? "/dashboard" : "/api/auth/signin"}>
              {session ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

---

# app/resume/actions.ts



---

# app/resume/loading.tsx

import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg font-medium">Loading resume builder...</p>
      </div>
    </div>
  )
}

---

# app/resume/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ResumePreview from '@/components/ResumePreview';
import { Message, ResumeData, PersonalInfo, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificationItem } from '@/types';
import { parseAIResponse } from '@/lib/resume-parser';

const initialResumeData: ResumeData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

// ... rest of the file remains the same
export default function ResumePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Resume Assistant. Let's create an amazing resume together. What field are you in, and what kind of job are you targeting?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('resumeChatMessages');
      const savedResumeData = localStorage.getItem('resumeData');
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert date strings back to Date objects
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
      if (savedResumeData) {
        setResumeData(JSON.parse(savedResumeData));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('resumeChatMessages', JSON.stringify(messages));
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [messages, resumeData]);

  const handleSendMessage = useCallback(async (content: string) => {// In your handleSendMessage function, update the fetch handling:
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [...messages.map(m => ({ role: m.role, content: m.content })), userMessage],
    useReasoning: true,
  }),
});

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Failed to send message: ${response.status} ${errorText}`);
}

const data = await response.json();

// Check if we have JSON data directly in the response
let newResumeData = null;
let aiMessageContent = data.message;

if (data.json_data?.resumeData) {
  // Use the JSON data directly
  newResumeData = data.json_data.resumeData;
  aiMessageContent = "I've updated your resume with the information you provided. Check the preview on the right!";
} else {
  // Try to parse JSON from the message content
  const parsed = parseAIResponse(data.message);
  if (parsed.resumeData) {
    newResumeData = parsed.resumeData;
  }
}

if (newResumeData) {
  setResumeData(prev => ({
    ...prev,
    ...newResumeData,
    personalInfo: { ...prev.personalInfo, ...newResumeData.personalInfo },
    experience: [...prev.experience, ...(newResumeData.experience || [])],
    education: [...prev.education, ...(newResumeData.education || [])],
    skills: [...prev.skills, ...(newResumeData.skills || [])],
    projects: [...prev.projects, ...(newResumeData.projects || [])],
    certifications: [...prev.certifications, ...(newResumeData.certifications || [])]
  }));
}}, [messages, isLoading]);

  const handleReset = () => {
    if (confirm('Are you sure you want to start a new resume? This will clear all current progress.')) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "Hello! I'm your AI Resume Assistant. Let's create an amazing resume together. What field are you in, and what kind of job are you targeting?",
          timestamp: new Date(),
        },
      ]);
      setResumeData(initialResumeData);
      localStorage.removeItem('resumeChatMessages');
      localStorage.removeItem('resumeData');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Resume Generator</h1>
              <p className="text-gray-600 mt-1">Build your perfect resume with AI assistance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                AI Assistant Online
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                New Resume
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
          {/* Left Panel - Chat */}
          <div className="h-full">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onReset={handleReset}
            />
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="h-full">
            <ResumePreview
              resumeData={resumeData}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">💡 Tips for Best Results:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Be Specific</h4>
              <p className="text-sm text-blue-700">
                Example: "I increased sales by 30% by implementing a new CRM system"
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Provide Structure</h4>
              <p className="text-sm text-green-700">
                Share: Job titles, companies, dates, responsibilities, and achievements
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Ask Directly</h4>
              <p className="text-sm text-purple-700">
                Try: "Generate a resume for a software engineer with 5 years of experience"
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Your data is stored locally and never shared. The AI may make mistakes. Always verify your resume.</p>
            <p className="mt-2">Using OpenRouter's OLMo 3 32B Think model with reasoning capabilities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

---

# codes.md



---

# components/auth/auth-button.tsx

"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <Button variant="ghost" disabled>Loading...</Button>
  }

  return <UserNav />
}

---

# components/auth/user-nav.tsx

"use client"

import { useSession, signOut } from "next-auth/react"
import { User, LogOut, Settings } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserNav() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <Button asChild variant="ghost">
        <Link href="/api/auth/signin">Sign In</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

---

# components/ChatInterface.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onReset: () => void;
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading,
  onReset 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const examplePrompts = [
    "I want to create a resume for a software engineer role",
    "Help me improve my marketing resume",
    "I'm a recent graduate with no experience",
    "Convert my experience to a project manager resume",
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Resume Assistant</h2>
            <p className="text-sm text-gray-600">Ask me anything about your resume</p>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            New Resume
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Start Building Your Resume
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Tell me about your background and the job you're targeting. I'll help you create a professional resume step by step.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(prompt)}
                  className="p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
            <span className="ml-2">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 rounded-b-xl">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your experience or ask for resume help..."
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
}

---

# components/DebugPanel.tsx

'use client';
import { useState } from "react";
interface DebugPanelProps {
  messages: any[];
  resumeData: any;
}

export default function DebugPanel({ messages, resumeData }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-lg"
      >
        Debug
      </button>
      
      {isOpen && (
        <div className="fixed inset-4 bg-white p-4 rounded-lg shadow-lg overflow-auto">
          <h3 className="text-lg font-bold mb-4">Debug Panel</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Messages ({messages.length})</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(messages, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Resume Data</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

---

# components/Footer.tsx

import Link from 'next/link'
import { FileText, Github, Twitter } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { name: 'Build Resume', href: '/resume' },
      { name: 'Templates', href: '#' },
      { name: 'Pricing', href: '#' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  }

  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{APP_CONFIG.name}</span>
            </div>
            <p className="mt-4 max-w-md text-muted-foreground">
              Create professional, AI-powered resumes that help you stand out and land your dream job.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 font-semibold">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Made with ❤️ for job seekers worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}

---

# components/layout/navbar.tsx

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth/auth-button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pl-1.5 pr-1.5">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
            <span className="font-bold">AI Resume</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/resume" className="text-sm font-medium hover:text-primary">
              Builder
            </Link>
            <Link href="/templates" className="text-sm font-medium hover:text-primary">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

---

# components/MessageBubble.tsx

'use client';

import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        <div className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'} text-gray-500`}>
          {time}
        </div>
        {!isUser && message.reasoning_details && (
          <details className="mt-2 text-xs text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">
              🤔 Show AI reasoning
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(message.reasoning_details, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

---

# components/providers/auth-provider.tsx

"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

---

# components/providers/theme-provider.tsx

"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

---

# components/ResumePreview.tsx

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

---

# components/ResumeTemplate.tsx

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

---

# components/theme-toggle.tsx

"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

---

# components/ui/avatar.tsx

"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

---

# components/ui/button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }


---

# components/ui/card.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}


---

# components/ui/dropdown-menu.tsx

"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}


---

# components/ui/input.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }


---

# components/ui/label.tsx

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }


---

# components/ui/tabs.tsx

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }


---

# components/ui/textarea.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }


---

# components.json

{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}


---

# lib/constants.ts

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

---

# lib/openrouter.ts

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";


// Define as named export
export const generateResumeContent = async (messages: any[], useReasoning: boolean = true) => {
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
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error("No response from AI model");
    }
    
    return result.choices[0].message;
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
};



export const resumeSystemPrompt = `You are an expert resume builder AI. Your task is to help users create professional resumes by asking relevant questions and generating structured resume content.

IMPORTANT: When I provide enough information about my resume, you MUST respond with ONLY valid JSON in this exact format - NO extra text before or after:

{
  "resumeData": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "location": "City, State",
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe.com"
    },
    "summary": "Professional summary here...",
    "experience": [
      {
        "id": "1",
        "title": "Job Title",
        "company": "Company Name",
        "location": "City, State",
        "startDate": "Month Year",
        "endDate": "Month Year",
        "achievements": ["Achievement 1", "Achievement 2"]
      }
    ],
    "education": [
      {
        "id": "1",
        "degree": "Degree Name",
        "institution": "Institution Name",
        "location": "City, State",
        "startDate": "Month Year",
        "endDate": "Month Year",
        "gpa": "3.8",
        "relevantCourses": ["Course 1", "Course 2"]
      }
    ],
    "skills": [
      {
        "category": "Technical Skills",
        "items": ["Skill 1", "Skill 2"]
      }
    ],
    "projects": [
      {
        "id": "1",
        "name": "Project Name",
        "description": "Project description...",
        "technologies": ["Tech 1", "Tech 2"],
        "link": "https://project-link.com"
      }
    ],
    "certifications": [
      {
        "id": "1",
        "name": "Certification Name",
        "issuer": "Issuing Organization",
        "date": "Month Year"
      }
    ]
  }
}

CRITICAL RULES:
1. NEVER include reasoning text or explanations when returning resume JSON
2. ALWAYS return ONLY the JSON object - no additional text
3. Fill in the JSON with the user's actual information
4. If information is missing, use reasonable defaults
5. Generate IDs for all array items (use simple numbers like "1", "2", etc.)
6. In regular conversation (not generating resume), respond normally

EXAMPLE RESPONSE FOR USER "I have 3 years at TechCorp as a developer":
{
  "resumeData": {
    "personalInfo": {
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "",
      "location": "",
      "linkedin": "",
      "github": "",
      "portfolio": ""
    },
    "summary": "Experienced software developer with 3 years of experience at TechCorp Inc.",
    "experience": [
      {
        "id": "1",
        "title": "Software Developer",
        "company": "TechCorp Inc",
        "location": "",
        "startDate": "2021",
        "endDate": "Present",
        "achievements": ["Contributed to various development projects at TechCorp"]
      }
    ],
    "education": [],
    "skills": [],
    "projects": [],
    "certifications": []
  }
}

Now, start by greeting the user and asking about their career field.`;

---

# lib/prompts/resume.ts

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

---

# lib/resume-parser.ts

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

---

# lib/types.ts

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

---

# lib/utils.ts

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

---

# next-env.d.ts

/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.


---

# next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;


---

# package.json

{
  "name": "hackathon",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.561.0",
    "next": "16.0.10",
    "next-auth": "^4.24.13",
    "next-themes": "^0.4.6",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.10",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}


---

# README.md

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---

# tsconfig.json

{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}


---

# types/index.ts

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  reasoning_details?: any;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  achievements: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  relevantCourses?: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

// Add these missing types
export interface GeneratedResume {
  content: string;
  suggestions?: string[];
  generatedAt: string;
}

export interface AIResponse {
  message: string;
  reasoning_details?: any;
  role: 'assistant';
}

