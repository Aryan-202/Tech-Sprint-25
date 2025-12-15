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