import { Brain } from "lucide-react";

interface TypingIndicatorProps {
  currentProvider: string;
}

export default function TypingIndicator({ currentProvider }: TypingIndicatorProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-sofeia-blue to-sofeia-emerald rounded-full flex items-center justify-center">
        <Brain className="text-white text-sm animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-sofeia-slate-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-sofeia-slate-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-sofeia-slate-400 rounded-full typing-dot"></div>
            </div>
            <span className="text-sm text-sofeia-slate-500">Sofeia is thinking...</span>
            <span className="text-xs text-sofeia-amber">{currentProvider}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
