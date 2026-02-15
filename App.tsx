
import React, { useState } from 'react';
import { AppRoute, BabyProfile } from './types';
import Navbar from './components/Navbar';
import DashboardView from './views/Dashboard';
import StoryGenerator from './views/StoryGenerator';
import SongGenerator from './views/SongGenerator';
import VideoGenerator from './views/VideoGenerator';
import ParentingGuide from './views/ParentingGuide';
import ToySimulator from './views/ToySimulator';
import CompanionFriend from './views/CompanionFriend';
import MonkeyGame from './views/MonkeyGame';
import Shop from './views/Shop';
import BabyCam from './views/BabyCam';
import { Baby } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [profile, setProfile] = useState<BabyProfile>({
    name: 'Lily',
    age: 2,
    language: 'English',
    mood: 'happy'
  });

  const [showProfileModal, setShowProfileModal] = useState(false);

  const renderView = () => {
    switch (currentRoute) {
      case AppRoute.DASHBOARD:
        return <DashboardView profile={profile} onAction={setCurrentRoute} />;
      case AppRoute.STORIES:
        return <StoryGenerator profile={profile} />;
      case AppRoute.SONGS:
        return <SongGenerator profile={profile} />;
      case AppRoute.TOYS:
        return <ToySimulator profile={profile} />;
      case AppRoute.FRIENDS:
        return <CompanionFriend profile={profile} />;
      case AppRoute.VIDEOS:
        return <VideoGenerator profile={profile} />;
      case AppRoute.GUIDE:
        return <ParentingGuide profile={profile} />;
      case AppRoute.MONKEY_GAME:
        return <MonkeyGame profile={profile} />;
      case AppRoute.SHOP:
        return <Shop profile={profile} />;
      case AppRoute.BABY_CAM:
        return <BabyCam profile={profile} />;
      default:
        return <DashboardView profile={profile} onAction={setCurrentRoute} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fdfbf7]">
      <Navbar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      
      <main className="flex-1 pb-24 md:pb-0 relative h-screen overflow-y-auto no-scrollbar">
        <header className="fixed top-0 right-0 p-6 z-20 hidden md:block">
           <button 
             onClick={() => setShowProfileModal(true)}
             className="flex items-center space-x-3 bg-white p-2 pr-6 rounded-full soft-shadow hover:scale-105 transition-transform border border-peach-100"
           >
             <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
               <Baby size={20} />
             </div>
             <div>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Baby Profile</p>
               <p className="text-sm font-bold text-gray-700">{profile.name} • {profile.age}y</p>
             </div>
           </button>
        </header>

        {renderView()}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-md animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-6 font-baby text-gray-800">Customize Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Baby Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Age (Years)</label>
                <input 
                  type="number" 
                  value={profile.age} 
                  onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold mt-4 shadow-lg shadow-pink-100"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
