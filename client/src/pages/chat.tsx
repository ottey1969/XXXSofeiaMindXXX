import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Message, Conversation } from "@shared/schema";
import MessageBubble from "@/components/chat/message-bubble";
import TypingIndicator from "@/components/chat/typing-indicator";
import InputArea from "@/components/chat/input-area";
import ProviderStatus from "@/components/chat/provider-status";
import { Brain, Sparkles } from "lucide-react";

export default function Chat() {
  const { id: conversationId } = useParams();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentProvider, setCurrentProvider] = useState("Groq Ready");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create new conversation if no ID provided
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: null
      });
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  // Get messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentConversationId) throw new Error("No conversation ID");
      
      const response = await apiRequest("POST", `/api/conversations/${currentConversationId}/messages`, {
        content
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data: any) => {
      setIsTyping(false);
      setCurrentProvider(`${data.analysis.provider} Complete`);
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", currentConversationId, "messages"] 
      });
      
      // Reset provider status after delay
      setTimeout(() => {
        setCurrentProvider("Ready");
      }, 2000);
    },
    onError: () => {
      setIsTyping(false);
      setCurrentProvider("Error - Retrying");
    }
  });

  // Initialize conversation
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
    } else if (!currentConversationId) {
      createConversationMutation.mutate();
    }
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    if (content.trim() && currentConversationId) {
      // Update provider status based on query analysis
      const lowercaseContent = content.toLowerCase();
      if (lowercaseContent.includes('research') || lowercaseContent.includes('seo') || lowercaseContent.includes('keyword')) {
        setCurrentProvider("Perplexity Research");
      } else if (lowercaseContent.length > 100 || lowercaseContent.includes('write') || lowercaseContent.includes('create')) {
        setCurrentProvider("Anthropic Processing");
      } else {
        setCurrentProvider("Groq Responding");
      }
      
      sendMessageMutation.mutate(content);
    }
  };

  if (messagesLoading && (!Array.isArray(messages) || messages.length === 0)) {
    return (
      <div className="min-h-screen bg-sofeia-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-sofeia-blue to-sofeia-emerald rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-sofeia-slate-600">Loading Sofeia AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-sofeia-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sofeia-blue to-sofeia-emerald rounded-xl flex items-center justify-center">
            <Brain className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-sofeia-slate-800">Sofeia AI</h1>
            <p className="text-sm text-sofeia-slate-500">ContentScale Powered Agent</p>
          </div>
        </div>
        
        <ProviderStatus currentProvider={currentProvider} />
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          {/* Welcome Message - only show if no messages */}
          {Array.isArray(messages) && messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-sofeia-blue to-sofeia-emerald rounded-full flex items-center justify-center">
                <Sparkles className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border px-6 py-4">
                  <div className="message-content">
                    <p className="text-sofeia-slate-800 mb-3">👋 <strong>Welcome to Sofeia AI!</strong></p>
                    <p className="text-sofeia-slate-600 mb-4">I'm your autonomous content agent, powered by the C.R.A.F.T framework. I can help you with:</p>
                    <ul className="text-sofeia-slate-600 space-y-1 mb-4">
                      <li>✅ Simple questions (instant Groq responses)</li>
                      <li>✅ Complex research (Perplexity-powered)</li>
                      <li>✅ Content optimization with C.R.A.F.T methodology</li>
                      <li>✅ SEO research and E-E-A-T optimization</li>
                      <li>✅ Grant writing and structured proposals</li>
                    </ul>
                    <p className="text-sofeia-slate-600 text-sm">Just ask me anything - I'll automatically route to the best AI provider for your needs!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2 text-xs text-sofeia-slate-500">
                  <span>Sofeia AI</span>
                  <span>•</span>
                  <span>Just now</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Brain className="w-3 h-3 text-sofeia-blue" />
                    <span>System Ready</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {Array.isArray(messages) && messages.map((message: Message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator currentProvider={currentProvider} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <InputArea 
          onSendMessage={handleSendMessage} 
          isLoading={sendMessageMutation.isPending}
        />
      </main>
    </div>
  );
}
