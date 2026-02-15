
import React, { useState } from 'react';
import { BabyProfile, Storybook } from '../types';
import { generateStorybook, generateSceneImage } from '../services/geminiService';
import { BookOpen, Sparkles, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

interface StoryGeneratorProps {
  profile: BabyProfile;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ profile }) => {
  const [theme, setTheme] = useState('Magical Forest');
  const [moral, setMoral] = useState('Sharing is caring');
  const [loading, setLoading] = useState(false);
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [currentScene, setCurrentScene] = useState(0);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const book = await generateStorybook(profile, theme, moral);
      
      // Generate images for each scene
      const updatedScenes = await Promise.all(book.scenes.map(async (scene) => {
        const imageUrl = await generateSceneImage(scene.imagePrompt);
        return { ...scene, imageUrl };
      }));
      
      setStorybook({ ...book, scenes: updatedScenes });
      setCurrentScene(0);
    } catch (error) {
      console.error(error);
      alert('Magical things are taking longer than usual. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const themes = ['Magical Forest', 'Space Adventure', 'Under the Sea', 'Dinosaur Park', 'Kindness Kingdom'];

  if (storybook) {
    return (
      <div className="p-6 md:p-12 animate-in slide-in-from-bottom duration-500">
        <button 
          onClick={() => setStorybook(null)}
          className="mb-8 text-pink-500 font-medium hover:underline flex items-center"
        >
          <ChevronLeft size={16} /> Back to Library
        </button>

        <div className="max-w-4xl mx-auto bg-white rounded-[40px] overflow-hidden soft-shadow border border-peach-50">
          <div className="grid grid-cols-1 md:grid-cols-2 h-[600px]">
            <div className="relative h-full bg-peach-50">
              {storybook.scenes[currentScene].imageUrl ? (
                <img 
                  src={storybook.scenes[currentScene].imageUrl} 
                  alt="Story scene" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <Loader2 className="animate-spin text-pink-300" size={48} />
                </div>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                {storybook.scenes.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === currentScene ? 'bg-pink-500' : 'bg-pink-200'}`} />
                ))}
              </div>
            </div>

            <div className="p-12 flex flex-col justify-center bg-white">
              <span className="text-pink-400 text-sm font-bold uppercase tracking-widest mb-4">Scene {currentScene + 1} of {storybook.scenes.length}</span>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 font-baby leading-tight">{storybook.title}</h2>
              <p className="text-xl text-gray-600 leading-relaxed italic">
                "{storybook.scenes[currentScene].text}"
              </p>
              
              <div className="mt-12 flex justify-between">
                <button 
                  disabled={currentScene === 0}
                  onClick={() => setCurrentScene(s => s - 1)}
                  className="p-4 rounded-full bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  disabled={currentScene === storybook.scenes.length - 1}
                  onClick={() => setCurrentScene(s => s + 1)}
                  className="p-4 rounded-full bg-pink-500 text-white disabled:opacity-30 hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BookOpen size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Magical Storybook</h1>
        <p className="text-gray-500 text-lg">Create a personalized story for {profile.name}'s bedtime.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[40px] soft-shadow border border-peach-50">
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Choose a Theme</label>
            <div className="flex flex-wrap gap-3">
              {themes.map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    theme === t 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">What's the Moral?</label>
            <input 
              type="text" 
              value={moral}
              onChange={(e) => setMoral(e.target.value)}
              placeholder="e.g., Being brave, Kindness, Brushing teeth..."
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-200 text-gray-700 text-lg"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-5 bg-pink-500 text-white rounded-3xl font-bold text-xl hover:bg-pink-600 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-pink-100 disabled:bg-pink-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Sparkles size={24} />
                <span>Create Magical Story</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;
