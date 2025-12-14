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