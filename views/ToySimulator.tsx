
import React, { useState, useRef } from 'react';
import { BabyProfile, Toy, ToyInteraction } from '../types';
import { generateToy, getToyInteraction, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Gamepad2, Loader2, Sparkles, Hand, Mic, Music, RotateCcw, ChevronLeft, Wrench, Hammer, Wand2 } from 'lucide-react';

interface ToySimulatorProps {
  profile: BabyProfile;
}

const ToySimulator: React.FC<ToySimulatorProps> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null);
  const [interaction, setInteraction] = useState<ToyInteraction | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const toyTypes = ['Teddy', 'Bunny', 'Robot', 'Dino', 'Fruit'];

  const handleSelectToy = async (type: string, prompt?: string) => {
    setLoading(true);
    setVoiceMode(false);
    try {
      const toy = await generateToy(type, profile, prompt);
      setSelectedToy(toy);
      setInteraction(null);
    } catch (error) {
      console.error(error);
      alert('The pixel factory is calibrating. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (action: string) => {
    if (!selectedToy || loading) return;
    setLoading(true);
    setIsAnimating(true);
    
    try {
      const result = await getToyInteraction(selectedToy, action, profile);
      setInteraction(result);
      
      if (result.animation === 'shatter') {
        setSelectedToy({ ...selectedToy, status: 'broken' });
      } else if (result.animation === 'repair') {
        setSelectedToy({ ...selectedToy, status: 'happy' });
      }

      // Play voice response
      const audioDataUri = await generateSpeech(result.response, 'Puck');
      const base64Data = audioDataUri.split(',')[1];
      const audioBytes = decode(base64Data);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      sourceRef.current = source;
      
      setTimeout(() => setIsAnimating(false), 2000);
    } catch (error) {
      console.error(error);
      setIsAnimating(false);
    } finally {
      setLoading(false);
    }
  };

  const getAnimationClass = () => {
    if (!isAnimating || !interaction) return '';
    switch (interaction.animation) {
      case 'bounce': return 'animate-bounce';
      case 'shake': return 'animate-[wiggle_0.5s_ease-in-out_infinite]';
      case 'glow': return 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]';
      case 'wiggle': return 'animate-[wiggle_0.3s_ease-in-out_infinite]';
      case 'repair': return 'animate-pulse scale-110 rotate-3';
      case 'shatter': return 'grayscale opacity-50 -translate-y-4 rotate-12';
      default: return '';
    }
  };

  if (selectedToy) {
    return (
      <div className="p-6 md:p-12 h-screen flex flex-col animate-in slide-in-from-bottom duration-500">
        <style>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
        `}</style>
        
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => setSelectedToy(null)} className="flex items-center text-orange-500 font-bold hover:underline">
            <ChevronLeft size={20} /> Library
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold font-baby text-gray-800">{selectedToy.name}</h2>
            <p className={`text-xs uppercase tracking-widest font-bold ${selectedToy.status === 'broken' ? 'text-red-400' : 'text-orange-400'}`}>
              {selectedToy.status === 'broken' ? 'Oh no! Needs Fixing' : selectedToy.personality}
            </p>
          </div>
          <div className="w-24"></div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className={`relative w-72 h-72 md:w-96 md:h-96 rounded-[60px] overflow-hidden soft-shadow transition-all duration-700 bg-white border-8 ${selectedToy.status === 'broken' ? 'border-red-100' : 'border-orange-50'} ${getAnimationClass()}`}>
            <img 
              src={selectedToy.imageUrl} 
              alt={selectedToy.name} 
              className={`w-full h-full object-cover transition-all duration-500 ${selectedToy.status === 'broken' ? 'sepia hue-rotate-180 brightness-75 blur-sm' : ''}`}
            />
            {loading && (
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-400" size={48} />
              </div>
            )}
            {selectedToy.status === 'broken' && !loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-red-500/80 text-white p-4 rounded-full animate-bounce">
                    <AlertCircle size={32} />
                 </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center max-w-md h-24">
            {interaction && (
              <p className="text-xl font-medium text-gray-700 bg-white px-8 py-4 rounded-3xl soft-shadow border border-orange-50 animate-in fade-in slide-in-from-top-2">
                "{interaction.response}"
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
          {selectedToy.status === 'happy' ? (
            <>
              <button onClick={() => handleInteraction('Tickle the toy')} className="flex flex-col items-center p-6 bg-white rounded-[32px] soft-shadow hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100">
                <Hand size={32} className="text-orange-500 mb-2" />
                <span className="font-bold text-gray-700">Tickle</span>
              </button>
              <button onClick={() => handleInteraction('Sing a happy song')} className="flex flex-col items-center p-6 bg-white rounded-[32px] soft-shadow hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100">
                <Music size={32} className="text-orange-500 mb-2" />
                <span className="font-bold text-gray-700">Song</span>
              </button>
              <button onClick={() => handleInteraction('Bump the toy gently')} className="flex flex-col items-center p-6 bg-white rounded-[32px] soft-shadow hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100">
                <RotateCcw size={32} className="text-orange-500 mb-2" />
                <span className="font-bold text-gray-700">Spin</span>
              </button>
              <button onClick={() => handleInteraction('Oh no, I accidentally bumped it too hard!')} className="flex flex-col items-center p-6 bg-red-50 rounded-[32px] soft-shadow hover:bg-red-100 transition-all border-2 border-dashed border-red-200">
                <Hammer size={32} className="text-red-500 mb-2" />
                <span className="font-bold text-red-700">Break!</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleInteraction('Use the magic wand to fix the toy')}
              className="col-span-2 md:col-span-4 flex items-center justify-center space-x-4 p-8 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-[32px] soft-shadow hover:scale-105 transition-all shadow-xl shadow-orange-200 font-bold text-2xl"
            >
              <Wrench size={40} className="animate-spin" />
              <span>Magic Fix Rebuild!</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Gamepad2 size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Advanced Pixel Simulator</h1>
        <p className="text-gray-500 text-lg">Create, Break, and Rebuild your favorite voxel toys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {toyTypes.map(type => (
          <button
            key={type}
            onClick={() => handleSelectToy(type)}
            disabled={loading}
            className="group relative bg-white p-8 rounded-[40px] soft-shadow border border-peach-50 text-center hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-full aspect-square rounded-[32px] bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${type}&backgroundColor=ffdfbf`} alt={type} className="w-2/3 h-2/3" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 font-baby mb-1">{type}</h3>
            {loading ? <Loader2 className="animate-spin mx-auto text-orange-500" /> : <span className="text-xs text-orange-400 font-bold uppercase">Pixel Art</span>}
          </button>
        ))}

        <button
          onClick={() => setVoiceMode(true)}
          className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[40px] soft-shadow text-center hover:-translate-y-2 transition-all duration-300 text-white"
        >
          <div className="w-full aspect-square rounded-[32px] bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Mic size={40} />
          </div>
          <h3 className="text-xl font-bold font-baby mb-1">Magic Voice</h3>
          <span className="text-xs text-white/70 font-bold uppercase">Custom Build</span>
        </button>
      </div>

      {voiceMode && (
        <div className="mt-12 bg-white p-12 rounded-[50px] soft-shadow border-4 border-indigo-100 animate-in zoom-in-95">
           <h2 className="text-3xl font-bold text-indigo-900 mb-6 font-baby flex items-center">
             <Wand2 className="mr-3 text-indigo-500" /> What toy should we dream up?
           </h2>
           <textarea 
             value={customPrompt}
             onChange={(e) => setCustomPrompt(e.target.value)}
             placeholder="Describe a toy! (e.g. A blue space dragon with rainbow wings...)"
             className="w-full p-6 bg-indigo-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-200 text-xl text-indigo-900 mb-6 h-32"
           />
           <button 
             onClick={() => handleSelectToy('Custom', customPrompt)}
             disabled={loading || !customPrompt.trim()}
             className="w-full py-5 bg-indigo-500 text-white rounded-3xl font-bold text-2xl hover:bg-indigo-600 transition-all flex items-center justify-center space-x-4 shadow-xl shadow-indigo-200"
           >
             {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
             <span>Magic Build!</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default ToySimulator;

const AlertCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
