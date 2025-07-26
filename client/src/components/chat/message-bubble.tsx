import { Message } from "@shared/schema";
import { User, Brain, Search, Zap, Shield } from "lucide-react";
import MessageContent from "@/components/ui/message-content";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const getProviderIcon = (provider: string | null) => {
    switch (provider) {
      case 'groq':
        return <Zap className="text-white text-sm" />;
      case 'perplexity':
        return <Search className="text-white text-sm" />;
      case 'anthropic':
        return <Shield className="text-white text-sm" />;
      default:
        return <Brain className="text-white text-sm" />;
    }
  };

  const getProviderName = (provider: string | null) => {
    switch (provider) {
      case 'groq':
        return 'Groq';
      case 'perplexity':
        return 'Perplexity Research';
      case 'anthropic':
        return 'Anthropic';
      default:
        return 'Sofeia AI';
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'now';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (isUser) {
    return (
      <div className="flex items-start space-x-3 flex-row-reverse">
        <div className="flex-shrink-0 w-8 h-8 bg-sofeia-slate-500 rounded-full flex items-center justify-center">
          <User className="text-white text-sm" />
        </div>
        <div className="flex-1 text-right">
          <div className="bg-sofeia-blue rounded-2xl rounded-tr-md shadow-sm px-6 py-4 inline-block max-w-xl">
            <p className="text-white whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center justify-end space-x-2 mt-2 text-xs text-sofeia-slate-500">
            <span>{formatTime(message.createdAt)}</span>
            <span>•</span>
            <span>You</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAssistant) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-sofeia-blue to-sofeia-emerald rounded-full flex items-center justify-center">
          {getProviderIcon(message.provider)}
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border px-6 py-4">
            {/* Research Mode Indicator */}
            {message.provider === 'perplexity' && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-sofeia-amber bg-opacity-10 rounded-lg border border-sofeia-amber border-opacity-20">
                <Search className="w-4 h-4 text-sofeia-amber" />
                <span className="text-sm font-medium text-sofeia-amber">Research Mode Activated</span>
                <span className="text-xs text-sofeia-slate-500">
                  • {getProviderName(message.provider)} • 
                  {message.metadata?.targetCountry && ` Country: ${message.metadata.targetCountry.toUpperCase()}`}
                </span>
              </div>
            )}

            {/* C.R.A.F.T Framework Applied */}
            {message.processingSteps && message.processingSteps.length > 0 && (
              <div className="bg-sofeia-slate-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-sofeia-slate-800 mb-2">🎯 C.R.A.F.T Framework Applied:</h4>
                <ul className="text-sm text-sofeia-slate-600 space-y-1">
                  {message.processingSteps.map((step: any, index: number) => (
                    <li key={index}>
                      <strong>{step.step.toUpperCase()}:</strong> {step.description}
                      {step.applied && <span className="text-sofeia-emerald ml-1">✓</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keyword Research Table */}
            {message.keywordData && message.keywordData.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sofeia-slate-800 mb-2">
                  📊 Keyword Research ({message.metadata?.targetCountry?.toUpperCase() || 'USA'} Market):
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-sofeia-slate-50">
                        <th className="border border-gray-200 px-3 py-2 text-left">Keyword</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Volume</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Difficulty</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Intent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {message.keywordData.slice(0, 5).map((keyword: any, index: number) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-3 py-2">{keyword.keyword}</td>
                          <td className="border border-gray-200 px-3 py-2">{keyword.volume}</td>
                          <td className="border border-gray-200 px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              keyword.difficulty === 'High' ? 'bg-red-100 text-red-800' :
                              keyword.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {keyword.difficulty}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-3 py-2">{keyword.intent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Message Content */}
            <MessageContent content={message.content} />

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sofeia-slate-800 mb-2">📚 Sources:</h4>
                <ul className="text-sm text-sofeia-slate-600 space-y-1">
                  {message.citations.map((citation: any, index: number) => (
                    <li key={index}>
                      • <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-sofeia-blue hover:underline">
                        {citation.title} - {citation.source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2 text-xs text-sofeia-slate-500">
            <span>{getProviderName(message.provider)}</span>
            <span>•</span>
            <span>{formatTime(message.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              {getProviderIcon(message.provider)}
              <span>
                {message.provider === 'perplexity' ? 'Research Complete' : 
                 message.provider === 'anthropic' ? 'Analysis Complete' : 
                 'Response Complete'}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
