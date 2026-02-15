
import React, { useState, useRef, useEffect } from 'react';
import { BabyProfile, Friend, FriendMessage } from '../types';
import { generateFriendMessage, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Users, Send, Loader2, Sparkles, Heart, Smile, Frown, Coffee } from 'lucide-react';

interface CompanionFriendProps {
  profile: BabyProfile;
}

const CompanionFriend: React.FC<CompanionFriendProps> = ({ profile }) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<{ sender: 'user' | 'friend', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<FriendMessage['mood']>('happy');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const friends: Friend[] = [
    { 
      id: 'lumi', 
      name: 'Lumi', 
      tagline: 'The Storytelling Bear', 
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lumi&backgroundColor=b6e3f4',
      personality: 'Calm, wise, loves bedtime stories and soft hugs.',
      voiceName: 'Kore'
    },
    { 
      id: 'pip', 
      name: 'Pip', 
      tagline: 'The Jumping Bunny', 
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Pip&backgroundColor=ffdfbf',
      personality: 'High energy, loves counting carrots and singing fast songs.',
      voiceName: 'Puck'
    },
    { 
      id: 'rex', 
      name: 'Rex', 
      tagline: 'The Tiny Dino', 
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rex&backgroundColor=d1fae5',
      personality: 'Friendly, a bit clumsy, loves teaching about nature.',
      voiceName: 'Charon'
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!selectedFriend || !text.trim() || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const result = await generateFriendMessage(selectedFriend, text, profile);
      setCurrentMood(result.mood);
      setMessages(prev => [...prev, { sender: 'friend', text: result.text }]);

      // Play voice
      const audioDataUri = await generateSpeech(result.text, selectedFriend.voiceName);
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedFriend) {
    return (
      <div className="flex flex-col h-screen bg-sky-50 animate-in fade-in duration-500">
        <header className="p-6 bg-white soft-shadow flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedFriend(null)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <Users size={24} />
            </button>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-200">
              <img src={selectedFriend.avatarUrl} alt={selectedFriend.name} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-baby text-gray-800">{selectedFriend.name}</h2>
              <div className="flex items-center text-xs text-sky-500 font-bold uppercase tracking-widest">
                <span className={`w-2 h-2 rounded-full bg-sky-500 mr-2 animate-pulse`}></span>
                {currentMood} Friend
              </div>
            </div>
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center px-12">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6">
                 <Heart size={48} className="text-sky-300" />
               </div>
               <p className="text-xl font-medium text-sky-900">
                 Say "Hi" to start chatting with {selectedFriend.name}!
               </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[80%] px-6 py-4 rounded-[32px] soft-shadow text-lg font-medium ${
                m.sender === 'user' 
                  ? 'bg-sky-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-sky-50'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-6 py-4 rounded-[32px] rounded-tl-none soft-shadow flex items-center space-x-2">
                <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-sky-100 flex items-center space-x-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => handleSendMessage("I'm happy!")}
              className="p-3 bg-yellow-100 text-yellow-600 rounded-2xl hover:bg-yellow-200 transition-colors"
            >
              <Smile size={24} />
            </button>
            <button 
              onClick={() => handleSendMessage("I feel a bit sad.")}
              className="p-3 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition-colors"
            >
              <Frown size={24} />
            </button>
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
              placeholder="Type or use buttons..."
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-sky-200 text-lg"
            />
            <button 
              onClick={() => handleSendMessage(input)}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-3 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 disabled:opacity-30 transition-all shadow-lg shadow-sky-100"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-sky-100 text-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Users size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Baby Friends</h1>
        <p className="text-gray-500 text-lg">Choose an AI companion for {profile.name} to talk with.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {friends.map(friend => (
          <button
            key={friend.id}
            onClick={() => setSelectedFriend(friend)}
            className="group bg-white p-10 rounded-[48px] soft-shadow border border-peach-50 text-center hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-8 border-4 border-sky-50 group-hover:scale-110 transition-transform bg-sky-50">
              <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 font-baby mb-2">{friend.name}</h3>
            <p className="text-sky-500 font-bold text-sm uppercase tracking-widest mb-4">{friend.tagline}</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{friend.personality}</p>
            <div className="py-4 px-8 bg-sky-50 text-sky-600 rounded-full font-bold text-sm inline-block group-hover:bg-sky-500 group-hover:text-white transition-colors">
              Chat with {friend.name}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-sky-50 to-blue-50 rounded-[40px] p-8 flex items-center space-x-8 border border-sky-100">
         <div className="hidden md:flex w-24 h-24 bg-white rounded-full items-center justify-center text-sky-500 shrink-0 shadow-lg">
            <Sparkles size={40} />
         </div>
         <div>
           <h4 className="text-xl font-bold text-sky-900 font-baby mb-2">Safe Conversational AI</h4>
           <p className="text-sky-800/70 leading-relaxed">
             Bondly friends are strictly limited to baby-safe vocabulary. They use emotionally intelligent logic 
             to comfort, celebrate, and teach, ensuring a nurturing digital environment for {profile.name}.
           </p>
         </div>
      </div>
    </div>
  );
};

export default CompanionFriend;
