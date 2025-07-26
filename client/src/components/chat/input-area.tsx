import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Zap, Search, Shield } from "lucide-react";

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything - from simple questions to complex research..."
              className="auto-resize-textarea resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-sofeia-blue focus:border-transparent placeholder-sofeia-slate-500"
              disabled={isLoading}
            />
            
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="absolute right-2 bottom-2 w-8 h-8 bg-sofeia-blue hover:bg-blue-700 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </form>
        
        {/* AI Provider Info */}
        <div className="flex items-center justify-between mt-3 text-xs text-sofeia-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-sofeia-emerald" />
              <span>Groq: Fast responses</span>
            </span>
            <span className="flex items-center space-x-1">
              <Search className="w-3 h-3 text-sofeia-amber" />
              <span>Perplexity: Research mode</span>
            </span>
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-sofeia-blue" />
              <span>Anthropic: Fallback</span>
            </span>
          </div>
          <div className="text-right">
            <span>Powered by C.R.A.F.T Framework</span>
          </div>
        </div>
      </div>
    </div>
  );
}
