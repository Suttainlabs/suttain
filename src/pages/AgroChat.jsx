import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mic, Loader2, MessageCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';
import { LANGUAGE_NAMES } from '@/components/agro/translations';

function ChatContent() {
  const { t, language, activeFarmer, activeFarm } = useAgro();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildPrompt = (question) => {
    return `You are AgroPocket, an AI agronomist assistant for small family farmers.

Farmer profile:
- Name: ${activeFarmer?.name || 'Farmer'}
- Location: ${activeFarmer?.location_name || 'Not specified'}
- Language: ${LANGUAGE_NAMES[language]}

Farm profile:
- Crops: ${activeFarm?.crops?.join(', ') || activeFarm?.primary_crop || 'Not specified'}
- Primary crop: ${activeFarm?.primary_crop || 'Not specified'}
- Size: ${activeFarm?.size_acres ? activeFarm.size_acres + ' acres' : 'Not specified'}
- Soil type: ${activeFarm?.soil_type || 'Not specified'}

The farmer asks: "${question}"

Instructions:
1. Respond in ${LANGUAGE_NAMES[language]} language only.
2. Give practical, locally-relevant advice based on the farmer's profile.
3. Use simple, non-technical language. Be warm and encouraging, never condescending.
4. If the question involves high-stakes decisions (large pesticide purchases, suspected disease outbreaks), include: "For this kind of decision, we recommend consulting a local agricultural expert."
5. Keep the response concise (3-5 short paragraphs maximum).`;
  };

  const handleSend = async (questionText) => {
    const question = (questionText || input).trim();
    if (!question || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(question)
      });
      const aiResponse = typeof response === 'string' ? response : (response?.response || response?.text || String(response));

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

      await base44.entities.AdvisorySession.create({
        farm_id: activeFarm.id,
        farmer_id: activeFarmer?.id,
        question,
        ai_response: aiResponse,
        session_type: 'chat',
        language
      });
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: t('error') + ' ' + t('retry') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('voice_not_supported'));
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    const langMap = { en: 'en-US', hi: 'hi-IN', sw: 'sw-KE', es: 'es-ES' };
    recognition.lang = langMap[language] || 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  if (!activeFarm) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AgroHeader title={t('ask_agronomist')} />
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#2D5016] font-semibold mb-4">{t('no_farm_selected')}</p>
          <Link to="/AgroFarmerProfile" className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px]">
            {t('go_to_profile')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <AgroHeader title={t('ask_agronomist')} />

      <div className="flex-1 bg-white rounded-2xl border border-[#D4C5B0] p-4 mb-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-[#D4C5B0] mx-auto mb-3" />
            <p className="text-[#5B7553]">{t('type_question')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#4A7C2A] text-white' : 'bg-[#F0EBE0] text-[#2D5016]'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F0EBE0] text-[#2D5016] px-4 py-3 rounded-2xl">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <p className="text-xs text-[#8B6F47] mb-3 px-1">{t('chat_disclaimer')}</p>

      <div className="flex gap-2 items-end">
        <button
          onClick={handleVoice}
          className={`p-3 rounded-xl border min-h-[44px] min-w-[44px] flex-shrink-0 transition-colors ${listening ? 'bg-red-100 border-red-300 text-red-600' : 'bg-white border-[#D4C5B0] text-[#5B7553] hover:bg-[#F0EBE0]'}`}
        >
          <Mic className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
          placeholder={listening ? t('listening') : t('type_question')}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-3 bg-[#4A7C2A] text-white rounded-xl hover:bg-[#2D5016] transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function AgroChat() {
  return <AgroProvider><ChatContent /></AgroProvider>;
}