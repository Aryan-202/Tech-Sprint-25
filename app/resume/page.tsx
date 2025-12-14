'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ResumePreview from '@/components/ResumePreview';
import { Message, ResumeData } from '@/types';

const initialResumeData: ResumeData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

export default function Home() {
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

  // Try to load saved data from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('resumeChatMessages');
    const savedResumeData = localStorage.getItem('resumeData');
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedResumeData) {
      setResumeData(JSON.parse(savedResumeData));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeChatMessages', JSON.stringify(messages));
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [messages, resumeData]);

  const parseAIResponse = (content: string) => {
    try {
      // Check if the response contains JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.resumeData) {
          setResumeData(parsed.resumeData);
          return "I've updated your resume with the information you provided. Check the preview on the right!";
        }
      }
      return content;
    } catch (error) {
      return content;
    }
  };

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
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
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const processedContent = parseAIResponse(data.message);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: processedContent,
        timestamp: new Date(),
        reasoning_details: data.reasoning_details,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

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
              <a 
                href="https://openrouter.ai/models/allenai/olmo-3-32b-think" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Powered by OpenRouter
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
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
                Mention specific achievements, numbers, and results from your experience
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Provide Details</h4>
              <p className="text-sm text-green-700">
                Share your skills, projects, certifications, and career goals
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Ask for Help</h4>
              <p className="text-sm text-purple-700">
                Ask the AI to improve specific sections or suggest better wording
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