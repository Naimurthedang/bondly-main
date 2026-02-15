
import React, { useState, useEffect } from 'react';
import { BabyProfile } from '../types';
import { generateSceneImage } from '../services/geminiService';
import { Sparkles, Star, Loader2, ChevronLeft, Trophy } from 'lucide-react';

interface Monkey {
  id: number;
  x: number;
  y: number;
  found: boolean;
  hidden: boolean;
  size: number;
}

const MonkeyGame: React.FC<{ profile: BabyProfile }> = ({ profile }) => {
  const [monkeys, setMonkeys] = useState<Monkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgUrl, setBgUrl] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const totalMonkeys = 5;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    setGameOver(false);
    setScore(0);
    try {
      const url = await generateSceneImage("Bright colorful baby nursery garden with big soft bushes, colorful clouds and magic toy boxes. High quality voxel style, 3D render.");
      setBgUrl(url);
      
      const newMonkeys = Array.from({ length: totalMonkeys }).map((_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 60,
        found: false,
        hidden: true,
        size: 80 + Math.random() * 40
      }));
      setMonkeys(newMonkeys);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const findMonkey = (id: number) => {
    setMonkeys(prev => prev.map(m => m.id === id ? { ...m, found: true, hidden: false } : m));
    setScore(s => s + 1);
    
    if (score + 1 === totalMonkeys) {
      setTimeout(() => setGameOver(true), 1000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-green-50">
        <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold font-baby text-green-900">Building the Jungle...</h2>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-green-50 select-none">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000" 
        style={{ backgroundImage: `url(${bgUrl})`, filter: gameOver ? 'blur(10px) brightness(0.8)' : 'none' }}
      />
      
      {/* Header Info */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button onClick={() => window.location.reload()} className="p-3 bg-white/80 backdrop-blur rounded-2xl soft-shadow text-green-600">
           <ChevronLeft size={24} />
        </button>
        <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full soft-shadow flex items-center space-x-3">
          <Star className="text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-2xl text-green-900">{score} / {totalMonkeys} Found!</span>
        </div>
      </div>

      {/* Monkeys Layer */}
      {monkeys.map((monkey) => (
        <div 
          key={monkey.id}
          onClick={() => !monkey.found && findMonkey(monkey.id)}
          className={`absolute cursor-pointer transition-all duration-500 ${monkey.found ? 'scale-125 z-20' : 'hover:scale-105 opacity-80 z-10'}`}
          style={{ 
            left: `${monkey.x}%`, 
            top: `${monkey.y}%`, 
            width: monkey.size, 
            height: monkey.size,
            transform: `translate(-50%, -50%)` 
          }}
        >
          {/* Use a playful monkey avatar from dicebear */}
          <img 
            src={`https://api.dicebear.com/7.x/big-smile/svg?seed=monkey-${monkey.id}&backgroundColor=ffdfbf`} 
            alt="Monkey" 
            className={`w-full h-full transition-all duration-500 ${monkey.found ? 'filter-none' : 'brightness-0 opacity-20 hover:opacity-40'}`}
          />
          {monkey.found && (
            <div className="absolute -top-4 -right-4 animate-bounce">
               <Star size={32} className="text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>
      ))}

      {/* Win Modal */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-green-900/40 backdrop-blur">
          <div className="bg-white rounded-[50px] p-12 max-w-lg w-full text-center shadow-2xl animate-in zoom-in-95">
             <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Trophy size={48} />
             </div>
             <h2 className="text-4xl font-bold font-baby text-gray-800 mb-4">Yay! You Found Them All!</h2>
             <p className="text-xl text-gray-500 mb-10">{profile.name} is a Jungle Explorer!</p>
             <button 
               onClick={initGame}
               className="w-full py-5 bg-green-500 text-white rounded-3xl font-bold text-2xl hover:bg-green-600 transition-all shadow-xl shadow-green-100 flex items-center justify-center space-x-3"
             >
               <Sparkles />
               <span>Play Again</span>
             </button>
          </div>
        </div>
      )}

      {/* Help Hint */}
      {!gameOver && score === 0 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce bg-white/80 backdrop-blur px-8 py-4 rounded-full border-4 border-green-200 text-green-900 font-bold text-xl flex items-center">
          Tap the hidden shadows to find the monkeys! 🙈
        </div>
      )}
    </div>
  );
};

export default MonkeyGame;
