
import React, { useState } from 'react';
import { BabyProfile, ProductRecommendation } from '../types';
import { getShoppingRecommendations, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { ShoppingBag, Loader2, Search, Sparkles, ExternalLink, Tag, ChevronRight, Trophy } from 'lucide-react';

interface ShopProps {
  profile: BabyProfile;
}

const Shop: React.FC<ShopProps> = ({ profile }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    advice: string;
    products: ProductRecommendation[];
    sources: any[];
  } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await getShoppingRecommendations(profile, query);
      setResult(data);
      playAchievementSound();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const playAchievementSound = async () => {
    const audioDataUri = await generateSpeech("Magic Shopping Discovery! You unlocked a new style!", "Kore");
    const base64Data = audioDataUri.split(',')[1];
    const audioBytes = decode(base64Data);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto overflow-y-auto h-screen no-scrollbar pb-32">
      <header className="text-center mb-12">
        <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Smart Shop</h1>
        <p className="text-gray-500 text-lg">Designer high-quality gear for {profile.name}.</p>
      </header>

      <div className="bg-white p-6 rounded-3xl soft-shadow border border-peach-50 flex items-center space-x-4 mb-12">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for organic cotton clothes, safety gear, or sensory toys..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-200 text-lg"
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="px-8 py-4 bg-pink-500 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
          <span>Discover</span>
        </button>
      </div>

      {result && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-gradient-to-r from-pink-50 to-peach-50 p-8 rounded-[40px] border border-pink-100">
            <h2 className="text-2xl font-bold text-pink-900 mb-4 font-baby flex items-center">
              <Sparkles className="mr-2" /> Clark's Personal Advice
            </h2>
            <p className="text-pink-800/80 text-lg leading-relaxed mb-6">{result.advice}</p>
            {result.sources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source, i) => (
                  source.web && (
                    <a key={i} href={source.web.uri} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-xs bg-white/50 px-3 py-1.5 rounded-full text-pink-600 border border-pink-100 hover:bg-white">
                      <ExternalLink size={10} />
                      <span className="truncate max-w-[150px]">{source.web.title}</span>
                    </a>
                  )
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {result.products.map(product => (
              <div key={product.id} className="group bg-white rounded-[40px] overflow-hidden soft-shadow border border-peach-50 flex flex-col hover:-translate-y-2 transition-all duration-300">
                <div className="aspect-[4/5] relative bg-peach-50 overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                    <span className="text-pink-600 font-bold flex items-center text-sm">
                      <Tag size={14} className="mr-1" /> {product.price}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">{product.category}</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 font-baby">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3">{product.description}</p>
                  <button className="w-full py-4 bg-gray-50 text-gray-800 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-pink-500 hover:text-white transition-all">
                    <span>Shop Now</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && !result && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-pink-500" size={64} />
          <p className="text-gray-500 font-medium animate-pulse">Clark is scouting the best stores...</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
