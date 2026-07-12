import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mic, Loader2, MessageCircle, AlertCircle, Image as ImageIcon, X, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';
import { LANGUAGE_NAMES } from '@/components/agro/translations';

function ChatContent() {
  const { t, language, activeFarmer, activeFarm } = useAgro();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildPrompt = (question) => {
    return `You are Suttain Farm, an AI agronomist assistant for small family farmers.

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

  const buildImagePrompt = (question) => {
    return `You are Suttain Farm, an AI agronomist assistant for small family farmers.

Farmer profile:
- Name: ${activeFarmer?.name || 'Farmer'}
- Location: ${activeFarmer?.location_name || 'Not specified'}
- Language: ${LANGUAGE_NAMES[language]}

Farm profile:
- Crops: ${activeFarm?.crops?.join(', ') || activeFarm?.primary_crop || 'Not specified'}
- Primary crop: ${activeFarm?.primary_crop || 'Not specified'}
- Soil type: ${activeFarm?.soil_type || 'Not specified'}

The farmer has uploaded a photo of their crop for diagnosis. ${question ? `They also wrote: "${question}"` : 'No additional text was provided.'}

Instructions:
1. Analyze the image for signs of disease, pest damage, nutrient deficiency, or other crop health issues.
2. Respond in ${LANGUAGE_NAMES[language]} language only.
3. Describe what you observe (crop type, visible symptoms, possible disease/pest/deficiency).
4. Provide practical, locally-relevant treatment or management advice.
5. If the diagnosis is uncertain or involves high-stakes decisions, include: "For this kind of decision, we recommend consulting a local agricultural expert."
6. Keep the response concise (3-5 short paragraphs maximum).`;
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPendingImage(file_url);
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (questionText, imageUrl = null) => {
    const question = (questionText || input).trim();
    if ((!question && !imageUrl) || loading) return;

    const userMessage = { role: 'user', content: question || '(Photo uploaded for diagnosis)', image_url: imageUrl };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPendingImage(null);
    setLoading(true);

    try {
      let llmParams;
      if (imageUrl) {
        llmParams = {
          prompt: buildImagePrompt(question),
          file_urls: [imageUrl],
          model: 'claude_sonnet_4_6'
        };
      } else {
        llmParams = { prompt: buildPrompt(question) };
      }

      const response = await base44.integrations.Core.InvokeLLM(llmParams);
      const aiResponse = typeof response === 'string' ? response : (response?.response || response?.text || String(response));

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

      await base44.entities.AdvisorySession.create({
        farm_id: activeFarm.id,
        farmer_id: activeFarmer?.id,
        question: question || '(Photo diagnosis)',
        photo_url: imageUrl || undefined,
        ai_response: aiResponse,
        session_type: imageUrl ? 'photo' : 'chat',
        language
      });
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: t('error') + ' ' + t('retry') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecording(false);
        setTranscribing(true);
        try {
          const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
          const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
          const transcriptText = typeof transcript === 'string' ? transcript : (transcript?.text || transcript?.transcript || String(transcript));
          if (transcriptText.trim()) {
            setInput(transcriptText.trim());
          }
        } catch (err) {
          console.error('Audio transcription error:', err);
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      setRecording(false);
    }
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
                  {msg.image_url && (
                    <img src={msg.image_url} alt="Uploaded crop" className="rounded-lg mb-2 max-w-full max-h-48 object-cover" />
                  )}
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

      {pendingImage && (
        <div className="mb-2 flex items-center gap-2 bg-white rounded-xl border border-[#D4C5B0] p-2">
          <img src={pendingImage} alt="Pending" className="w-12 h-12 rounded-lg object-cover" />
          <span className="text-sm text-[#5B7553] flex-1">Image ready to send</span>
          <button
            onClick={() => setPendingImage(null)}
            className="p-1 rounded-lg hover:bg-[#F0EBE0] text-[#8B6F47]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || uploadingImage || recording}
          className="p-3 rounded-xl border bg-white border-[#D4C5B0] text-[#5B7553] hover:bg-[#F0EBE0] transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex-shrink-0"
        >
          {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
        </button>
        <button
          onClick={handleVoice}
          disabled={loading || uploadingImage || transcribing}
          className={`p-3 rounded-xl border min-h-[44px] min-w-[44px] flex-shrink-0 transition-colors disabled:opacity-50 ${recording ? 'bg-red-100 border-red-300 text-red-600' : 'bg-white border-[#D4C5B0] text-[#5B7553] hover:bg-[#F0EBE0]'}`}
        >
          {recording ? <Square className="w-5 h-5" /> : transcribing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !pendingImage) handleSend(); }}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
          placeholder={recording ? 'Recording...' : transcribing ? 'Transcribing...' : t('type_question')}
        />
        <button
          onClick={() => handleSend(null, pendingImage)}
          disabled={loading || (!input.trim() && !pendingImage)}
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