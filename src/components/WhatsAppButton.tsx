import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5511978584270"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#20BA5C] transition-all duration-300 z-50 flex items-center space-x-2 group hover:pr-6"
      style={{
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
      }}
    >
      <MessageCircle className="w-7 h-7" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-sm font-medium">
        Fale Comigo
      </span>
    </a>
  );
}