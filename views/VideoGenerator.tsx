
import React, { useState } from 'react';
import { BabyProfile } from '../types';
import { generateFruitVideo } from '../services/geminiService';
import { Video, Sparkles, Loader2, Music, AlertCircle } from 'lucide-react';

interface VideoGeneratorProps {
  profile: BabyProfile;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ profile }) => {
  const [fruit, setFruit] = useState('Apple');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fruits = ['Apple', 'Banana', 'Strawberry', 'Grape', 'Pineapple'];

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(0);
    setErrorMsg(null);
    
    // Fake progress for user experience
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.5, 98));
    }, 1000);

    try {
      const url = await generateFruitVideo(fruit, profile.language);
      setVideoUrl(url);
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || "Something went wrong";
      
      if (msg.includes('permission') || msg.includes('403') || msg.includes('entity was not found')) {
        setErrorMsg("Permission denied. Please ensure you have selected a valid paid project API key.");
        // The service already attempts to open the key selector, so we just show the state here
      } else {
        setErrorMsg("The fruit stars are a bit shy right now. Please try again in a moment.");
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Video size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Fruit Dance Rhyme</h1>
        <p className="text-gray-500 text-lg">Watch {fruit} dance and sing for {profile.name}!</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[40px] soft-shadow border border-peach-50">
        {videoUrl ? (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="aspect-video rounded-[32px] overflow-hidden bg-black shadow-2xl">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
            <button
              onClick={() => setVideoUrl(null)}
              className="w-full py-4 text-pink-500 font-bold hover:underline"
            >
              Make Another Video
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 animate-in shake duration-500">
                 <AlertCircle className="shrink-0 mt-0.5" size={20} />
                 <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Choose a Fruit Star</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {fruits.map(f => (
                  <button
                    key={f}
                    onClick={() => setFruit(f)}
                    className={`px-4 py-3 rounded-2xl font-medium transition-all ${
                      fruit === f 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
               <div className="flex items-start space-x-4">
                 <div className="bg-blue-200 p-2 rounded-lg text-blue-700">
                    <Music size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-blue-900 mb-1 font-baby">AI Video Studio</h4>
                   <p className="text-sm text-blue-800/70">
                     Video generation uses Veo 3.1 AI. It takes about 1-2 minutes to animate.
                     You'll need a paid API key to use this experimental feature.
                   </p>
                 </div>
               </div>
            </div>

            {loading && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-gray-500 text-sm italic">
                  Animating {fruit}'s happy feet... {Math.round(progress)}%
                </p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-5 bg-red-500 text-white rounded-3xl font-bold text-xl hover:bg-red-600 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-red-100 disabled:bg-red-300"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Sparkles size={24} />
                  <span>Generate AI Video</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Powered by Veo 3.1 • Requires Paid API Key selection
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
