import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, Bot, User, Loader2
} from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";

export default function ABChemistAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content: "Hi! I'm ABChemist, your 24/7 chemical formulation assistant. I can help you with:\n\n• Chemical safety questions\n• Ingredient compatibility\n• Formulation advice\n• Regulatory guidance\n• Sustainable alternatives\n\nWhat can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await InvokeLLM({
        prompt: `You are ABChemist, a professional chemical formulation assistant available 24/7. You specialize in:

- Chemical safety and compatibility
- Formulation science and ingredient interactions  
- Regulatory compliance (FDA, EU, etc.)
- Sustainable and eco-friendly alternatives
- Risk assessment and hazard identification
- Product development guidance

User question: "${userMessage.content}"

Provide helpful, accurate, and safety-focused advice. If the question involves dangerous chemical combinations, prioritize safety warnings. Be concise but thorough. Use a friendly, professional tone.

If you're unsure about specific chemical data, recommend consulting official safety data sheets or professional chemists.`,
        add_context_from_internet: true
      });

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: response || "I apologize, but I'm having trouble processing your request right now. Please try again, or contact our support team for assistance.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: "I'm experiencing technical difficulties right now. Please try again in a moment, or feel free to use our Chemical Simulator or Formula Generator for immediate assistance.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Is it safe to mix bleach and vinegar?",
    "What are eco-friendly preservatives?",
    "How do I calculate pH in formulations?",
    "What's the shelf life of homemade cosmetics?"
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] z-50"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 h-[500px] flex flex-col">
              <CardHeader className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900">ABChemist</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-500">Online • 24/7 Available</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-teal-600' 
                            : 'bg-gradient-to-r from-teal-600 to-cyan-600'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.type === 'user'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-teal-600 to-cyan-600">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="rounded-2xl px-4 py-2 bg-slate-100">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                            <span className="text-sm text-slate-600">ABChemist is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions (only show when no conversation) */}
                {messages.length === 1 && (
                  <div className="border-t border-slate-200 p-4">
                    <p className="text-xs text-slate-500 mb-3">Quick questions:</p>
                    <div className="space-y-2">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="w-full text-left text-xs text-slate-600 hover:text-teal-600 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-slate-200 p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about chemical safety, formulation, or regulations..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-teal-600 hover:bg-teal-700"
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}