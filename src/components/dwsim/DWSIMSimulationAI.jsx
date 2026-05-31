import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Copy, Check, Download, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const EXAMPLE_PROMPTS = [
  'Simulate a distillation column separating ethanol and water at atmospheric pressure',
  'Model a heat exchanger cooling hot oil from 150°C to 80°C using cooling water',
  'Set up ammonia synthesis: compress hydrogen and nitrogen, equilibrium reactor at 450°C and 200 bar',
  'Simulate a flash drum separating a methane/propane mixture at -40°C and 10 bar',
  'Model a refrigeration cycle using R-134a with compressor, condenser, expansion valve, and evaporator',
];

const SYSTEM_PROMPT = `You are an expert DWSIM process simulation engineer and Python developer. 
When a user describes a chemical process, you:
1. Generate a complete, working DWSIM Python FluentAPI script
2. Explain what the simulation does and what results to expect
3. Suggest the correct thermodynamic property package
4. Note any important assumptions or limitations

DWSIM Python FluentAPI requirements:
- Import: clr, sys; add dwsim_path to sys.path
- References: DWSIM.Automation, DWSIM.Interfaces, DWSIM.Thermodynamics, DWSIM.UnitOperations
- Use Automation3() to create flowsheet
- AddObject(ObjectType.X, x, y, "name") to add objects
- Use correct ObjectType enum values: MaterialStream, EnergyStream, Mixer, NodeIn (splitter), Heater, Cooler, HeatExchanger, DistillationColumn, Flash2, Compressor, Pump, Valve, ConversionReactor, EquilibriumReactor
- Connect streams: flowsheet.ConnectObjects(source_name, dest_name, source_port, dest_port)
- Set compound mole fractions, temperature (K), pressure (Pa), mass flow (kg/s)
- Call sim.SolveFlowsheet() and print results
- Save as .dwxml

Always wrap your script in a code block with python syntax highlighting.
Be concise but thorough. Flag if a process needs special handling.`;

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dwsim_simulation.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 my-3">
      <div className="flex items-center justify-between bg-slate-800 px-3 py-2">
        <span className="text-xs text-slate-400 font-mono">python</span>
        <div className="flex gap-2">
          <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={download} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            <Download className="w-3 h-3" /> .py
          </button>
        </div>
      </div>
      <pre className="bg-slate-950 text-green-400 text-xs p-4 overflow-x-auto max-h-96 leading-relaxed font-mono">
        {code}
      </pre>
    </div>
  );
}

function MessageContent({ content }) {
  // Parse content: split on ```python ... ``` blocks
  const parts = [];
  const regex = /```(?:python)?\n([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: content.slice(last, match.index) });
    }
    parts.push({ type: 'code', content: match[1] });
    last = match.index + match[0].length;
  }
  if (last < content.length) {
    parts.push({ type: 'text', content: content.slice(last) });
  }

  return (
    <div>
      {parts.map((part, i) =>
        part.type === 'code' ? (
          <CodeBlock key={i} code={part.content} />
        ) : (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">{part.content}</p>
        )
      )}
    </div>
  );
}

export default function DWSIMSimulationAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Describe any chemical process or unit operation and I will generate a complete, ready-to-run DWSIM Python FluentAPI script for you. I can also explain simulation results, suggest property packages, and help troubleshoot convergence issues.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = newMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nConversation so far:\n${conversationHistory}\n\nRespond as the assistant:`,
        model: 'claude_sonnet_4_6',
      });

      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#00281E] to-[#007850]">
        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">DWSIM AI Simulation Assistant</p>
          <p className="text-white/60 text-xs">Describe your process — get a complete FluentAPI script</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#007850] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-[#007850] text-white'
                : msg.error
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-slate-50 text-slate-800 border border-slate-100'
            }`}>
              {msg.role === 'assistant' ? (
                <MessageContent content={msg.content} />
              ) : (
                <p className="leading-relaxed">{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#007850] flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-[#007850] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#007850] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#007850] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 ml-1">Generating script...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Example prompts */}
      {messages.length === 1 && (
        <div className="px-5 pb-3">
          <p className="text-xs text-slate-400 mb-2 font-medium">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.slice(0, 3).map(p => (
              <button
                key={p}
                onClick={() => send(p)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl hover:border-[#007850] hover:text-[#007850] transition-colors text-left"
              >
                {p.length > 60 ? p.slice(0, 57) + '...' : p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 px-4 py-3 flex gap-3 items-end bg-white">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your chemical process or ask about DWSIM..."
          rows={2}
          className="flex-1 resize-none text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#007850] focus:border-transparent"
        />
        <Button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="bg-[#007850] hover:bg-[#005f3e] text-white h-10 w-10 p-0 rounded-xl flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}