import { useState, useEffect } from "react";
import { Brain, Sparkles, Zap, Search, Cpu } from "lucide-react";

interface TypingIndicatorProps {
  currentProvider: string;
}

const thinkingMessages = [
  "Analyzing your request...",
  "Processing with AI...",
  "Crafting the perfect response...",
  "Optimizing content quality...",
  "Applying C.R.A.F.T framework...",
  "Finalizing your answer..."
];

const providerIcons = {
  "Groq": Zap,
  "Perplexity": Search,
  "Anthropic": Brain,
  "Processing": Cpu
};

export default function TypingIndicator({ currentProvider }: TypingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  // Cycle through thinking messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % thinkingMessages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 20; // Reset to create continuous animation
        return prev + Math.random() * 15 + 5;
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  // Animate dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  // Get provider icon and color
  const getProviderInfo = (provider: string) => {
    if (provider.includes("Groq")) return { Icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" };
    if (provider.includes("Perplexity")) return { Icon: Search, color: "text-blue-500", bg: "bg-blue-100" };
    if (provider.includes("Anthropic")) return { Icon: Brain, color: "text-purple-500", bg: "bg-purple-100" };
    return { Icon: Cpu, color: "text-emerald-500", bg: "bg-emerald-100" };
  };

  const { Icon, color, bg } = getProviderInfo(currentProvider);

  return (
    <div className="flex items-start space-x-3 animate-fadeIn">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-sofeia-blue to-sofeia-emerald rounded-full flex items-center justify-center animate-pulse">
        <Brain className="text-white text-sm" />
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border px-6 py-5">
          {/* Main thinking text with animated dots */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-sofeia-blue rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-sofeia-emerald rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-sofeia-amber rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-sofeia-slate-600 font-medium">
              Sofeia is thinking{dots}
            </span>
            <Sparkles className="w-4 h-4 text-sofeia-amber animate-spin" />
          </div>

          {/* Dynamic thinking message */}
          <div className="mb-3">
            <p className="text-xs text-sofeia-slate-500 animate-pulse">
              {thinkingMessages[messageIndex]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sofeia-blue via-sofeia-emerald to-sofeia-amber h-1.5 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: `${Math.min(progress, 95)}%` }}
              ></div>
            </div>
          </div>

          {/* Provider status with icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 ${bg} rounded-full flex items-center justify-center`}>
                <Icon className={`w-3 h-3 ${color}`} />
              </div>
              <span className="text-xs font-medium text-sofeia-slate-600">
                {currentProvider}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-sofeia-emerald rounded-full animate-ping"></div>
              <span className="text-xs text-sofeia-slate-400">Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
