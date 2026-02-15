
import React, { useState, useRef } from 'react';
import { BabyProfile, ParentingAdvice } from '../types';
import { generateParentingGuide, transcribeAudio } from '../services/geminiService';
import { MessageCircle, Shield, Heart, Lightbulb, Loader2, Send, Mic, ExternalLink, Zap } from 'lucide-react';

interface ParentingGuideProps {
  profile: BabyProfile;
}

const ParentingGuide: React.FC<ParentingGuideProps> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<ParentingAdvice | null>(null);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          // Simple PCM simulation for demo purposes; ideally needs actual PCM conversion
          const text = await transcribeAudio(base64);
          setInput(text);
          handleGenerate(text);
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopVoiceInput = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleGenerate = async (queryOverride?: string) => {
    const query = queryOverride || input;
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await generateParentingGuide({
        name: profile.name,
        age: profile.age,
        query
      });
      setAdvice(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto overflow-y-auto h-screen no-scrollbar pb-32">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Clark Parenting Intelligence</h1>
        <p className="text-gray-500 text-lg">Grounded in clinical research & real-time search.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-[32px] soft-shadow border border-peach-50 flex items-center space-x-4">
          <button 
            onClick={isRecording ? stopVoiceInput : startVoiceInput}
            className={`p-4 rounded-2xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-pink-100 text-pink-500 hover:bg-pink-200'}`}
          >
            <Mic size={24} />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Ask Clark anything about developmental milestones..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 text-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={() => handleGenerate()}
            disabled={loading}
            className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
        </div>

        {advice && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-10 rounded-[48px] soft-shadow border border-peach-50">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800 font-baby flex items-center">
                  <Lightbulb className="text-yellow-500 mr-2" /> Clark's Guidance
                </h2>
                <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                  <Zap size={12} className="mr-1" />
                  Grounded with Google Search
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-8">{advice.summary}</p>
              
              {advice.groundingSources && advice.groundingSources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {advice.groundingSources.map((s, i) => s.web && (
                    <a key={i} href={s.web.uri} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs bg-gray-50 hover:bg-peach-50 text-gray-500 px-4 py-2 rounded-full border border-peach-100 transition-colors">
                      <ExternalLink size={10} />
                      <span className="truncate max-w-[150px]">{s.web.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100">
                <h3 className="text-xl font-bold text-emerald-900 mb-6 font-baby flex items-center">
                  <Heart className="text-emerald-500 mr-2" /> Bonding Exercise
                </h3>
                <p className="text-emerald-800/80 leading-relaxed">{advice.bondingActivity}</p>
              </div>

              <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100">
                <h3 className="text-xl font-bold text-amber-900 mb-6 font-baby flex items-center">
                  <Shield className="text-amber-500 mr-2" /> Essential Safety
                </h3>
                <p className="text-amber-800/80 leading-relaxed">{advice.safetyNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentingGuide;
