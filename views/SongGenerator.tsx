
import React, { useState, useRef } from 'react';
import { BabyProfile, Lullaby } from '../types';
import { generateLullabyLyrics, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Music, Play, Pause, Loader2, Volume2, Moon } from 'lucide-react';

interface SongGeneratorProps {
  profile: BabyProfile;
}

const SongGenerator: React.FC<SongGeneratorProps> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [lullaby, setLullaby] = useState<Lullaby | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setLullaby(null);
    try {
      const data = await generateLullabyLyrics({ ...profile, mood: 'sleepy' });
      setLullaby(data);
    } catch (error) {
      console.error(error);
      alert('The sleep fairy is busy. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async () => {
    if (playing) {
      sourceRef.current?.stop();
      setPlaying(false);
      return;
    }

    if (!lullaby) return;

    setLoading(true);
    try {
      const audioDataUri = await generateSpeech(lullaby.lyrics);
      const base64Data = audioDataUri.split(',')[1];
      const audioBytes = decode(base64Data);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlaying(false);
      source.start();
      
      sourceRef.current = source;
      setPlaying(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Music size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Bedtime Lullabies</h1>
        <p className="text-gray-500 text-lg">Personalized melodies for {profile.name}'s sweet dreams.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[40px] soft-shadow border border-peach-50 text-center">
        {lullaby ? (
          <div className="animate-in zoom-in-95 duration-500">
             <div className="inline-block p-6 bg-indigo-50 rounded-full text-indigo-500 mb-8 animate-pulse">
                <Moon size={48} />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-6 font-baby">"{profile.name}'s Sleepy Tune"</h2>
             <div className="max-w-md mx-auto p-8 bg-gray-50 rounded-3xl mb-8">
               <p className="text-xl text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                 {lullaby.lyrics}
               </p>
             </div>
             
             <div className="flex flex-col items-center space-y-4">
               <button
                 onClick={togglePlay}
                 disabled={loading}
                 className="w-20 h-20 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:bg-indigo-300"
               >
                 {loading ? <Loader2 className="animate-spin" /> : (playing ? <Pause size={32} /> : <Play size={32} fill="currentColor" />)}
               </button>
               <span className="text-indigo-500 font-bold uppercase tracking-widest text-xs">
                 {playing ? 'Singing now...' : 'Play Singing Voice'}
               </span>
               <button 
                 onClick={() => setLullaby(null)}
                 className="mt-8 text-gray-400 text-sm hover:underline"
               >
                 Create New Lyrics
               </button>
             </div>
          </div>
        ) : (
          <div className="py-12">
            <p className="text-gray-400 mb-12 italic">Click below to generate a lullaby infused with {profile.name}'s name.</p>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-12 py-5 bg-indigo-500 text-white rounded-full font-bold text-xl hover:bg-indigo-600 transition-all flex items-center justify-center space-x-3 mx-auto shadow-xl shadow-indigo-100 disabled:bg-indigo-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Volume2 />}
              <span>Generate Personalized Lullaby</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongGenerator;
