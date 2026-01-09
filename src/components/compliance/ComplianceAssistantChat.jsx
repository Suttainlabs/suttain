import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MessageBubble from '../shared/MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

const ComplianceAssistantChat = ({ onBack }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef();

  const initConversation = async () => {
    setIsLoading(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "compliance_agent",
        metadata: { name: `Compliance Chat - ${new Date().toLocaleString()}` }
      });
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    let unsubscribe;
    if (conversation) {
      unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages);
        setIsLoading(data.status === 'running');
      });
    }
    return () => unsubscribe && unsubscribe();
  }, [conversation]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom after render
        setTimeout(() => {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if(viewport) viewport.scrollTop = viewport.scrollHeight;
        }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !conversation) return;
    const messageContent = input;
    setInput('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: messageContent,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    }
  };

  const promptExamples = [
    "Is this ingredient allowed in Europe?",
    "Generate a GHS label for this formula.",
    "Show me Prop 65 changes in 2024.",
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>
      <div className="bg-white border rounded-lg shadow-lg h-[75vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Bot /> Regulatory Assistant</h2>
        </div>
        
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            {isLoading && messages[messages.length-1]?.role === 'user' && (
                <div className="flex gap-3">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
                        <Bot className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin text-slate-500"/>
                        <span className="text-sm text-slate-500">Analyzing...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-slate-50">
           <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a compliance question..."
              disabled={isLoading || !conversation}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !conversation || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2">
            Examples:
            {promptExamples.map(p => (
                <button key={p} onClick={() => setInput(p)} className="hover:underline">{p}</button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplianceAssistantChat;