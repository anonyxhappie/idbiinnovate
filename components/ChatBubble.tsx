import React from 'react';

interface ChatBubbleProps {
  role: 'user' | 'model';
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  return (
    <div className={`bubble-container ${role}`}>
      <div className={`bubble ${role}`}>
        {content}
      </div>
    </div>
  );
}
