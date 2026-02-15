
import React, { useState, useRef, useEffect } from 'react';
import { BabyProfile } from '../types';
import { analyzeVideo, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Camera, RefreshCcw, Sparkles, Loader2, StopCircle, PlayCircle, Heart, Star, Music, Award } from 'lucide-react';

interface BabyCamProps {
  profile: BabyProfile;
}

const BabyCam: React.FC<BabyCamProps> = ({ profile }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [observation, setObservation] = useState<string | null>(null);
  const [filter, setFilter] = useState<'none' | 'sepia' | 'pink' | 'bubbles'>('none');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access failed", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    setRecordedChunks([]);
    const recorder = new MediaRecorder(videoRef.current.srcObject as MediaStream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
    };
    recorder.onstop = processVideo;
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processVideo = async () => {
    setAnalyzing(true);
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeVideo(base64, 'video/webm');
        setObservation(result);
        playObservationSound(result);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const playObservationSound = async (text: string) => {
    const audioDataUri = await generateSpeech(`I saw ${profile.name}! ${text.substring(0, 40)}`, "Kore");
    const base64Data = audioDataUri.split(',')[1];
    const audioBytes = decode(base64Data);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  };

  const getFilterStyle = () => {
    switch (filter) {
      case 'sepia': return { filter: 'sepia(0.8)' };
      case 'pink': return { filter: 'hue-rotate(300deg) saturate(1.5)' };
      case 'bubbles': return { filter: 'contrast(1.2) brightness(1.2)' };
      default: return {};
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto h-screen flex flex-col no-scrollbar">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 font-baby">Interactive BabyCam</h1>
        <p className="text-gray-500">Play, record, and get cute AI insights.</p>
      </header>

      <div className="relative flex-1 bg-black rounded-[48px] overflow-hidden shadow-2xl border-8 border-white group">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transition-all duration-300"
          style={getFilterStyle()}
        />

        {/* Floating AI Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-pink-400 opacity-60 animate-bounce"><Heart size={64} fill="currentColor" /></div>
          <div className="absolute bottom-10 right-10 text-yellow-300 opacity-60 animate-pulse"><Star size={64} fill="currentColor" /></div>
          {filter === 'bubbles' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="absolute border-2 border-white/30 rounded-full animate-ping" style={{
                   width: 50 + i * 40, height: 50 + i * 40, animationDelay: `${i * 0.2}s`
                 }} />
               ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-6">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl border-4 border-white ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-pink-500 hover:bg-pink-600'}`}
          >
            {isRecording ? <StopCircle size={40} className="text-white" /> : <Camera size={40} className="text-white" />}
          </button>
        </div>

        {analyzing && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center z-30">
            <Loader2 className="animate-spin text-pink-500 mb-4" size={64} />
            <p className="text-pink-900 font-bold text-xl animate-pulse">Clark AI is watching the magic...</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        {(['none', 'pink', 'sepia', 'bubbles'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-2xl font-bold capitalize transition-all ${filter === f ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-peach-100'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {observation && (
        <div className="mt-8 p-6 bg-white rounded-3xl soft-shadow border border-pink-100 animate-in slide-in-from-top-4">
           <div className="flex items-center space-x-3 mb-2 text-pink-600">
             <Award size={24} />
             <h3 className="font-bold text-xl font-baby">New Growth Moment!</h3>
           </div>
           <p className="text-gray-700 italic">"{observation}"</p>
           <button onClick={() => setObservation(null)} className="mt-4 text-xs font-bold text-gray-400 hover:text-pink-500">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default BabyCam;
