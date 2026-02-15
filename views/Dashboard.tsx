
import React from 'react';
import { BabyProfile, AppRoute } from '../types';
import { Sparkles, Sun, Moon, Gamepad2, Users, Smile, ShoppingBag, Camera } from 'lucide-react';

interface DashboardProps {
  profile: BabyProfile;
  onAction: (route: AppRoute) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onAction }) => {
  const cards = [
    { title: 'New Story', desc: 'Create a magical world', icon: Sun, color: 'bg-yellow-100 text-yellow-600', route: AppRoute.STORIES },
    { title: 'Bedtime Lullaby', desc: 'Soothe to sleep', icon: Moon, color: 'bg-indigo-100 text-indigo-600', route: AppRoute.SONGS },
    { title: 'Toy Simulator', desc: 'Voxel Pixel world', icon: Gamepad2, color: 'bg-orange-100 text-orange-600', route: AppRoute.TOYS },
    { title: 'Smart Shop', desc: 'Designer baby gear', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600', route: AppRoute.SHOP },
    { title: 'Baby Cam', desc: 'Watch & Analyze', icon: Camera, color: 'bg-rose-100 text-rose-600', route: AppRoute.BABY_CAM },
    { title: 'Monkey Game', desc: 'Catch the hiders', icon: Smile, color: 'bg-green-100 text-green-600', route: AppRoute.MONKEY_GAME },
    { title: 'Baby Friends', desc: 'Chat with companions', icon: Users, color: 'bg-sky-100 text-sky-600', route: AppRoute.FRIENDS },
  ];

  return (
    <div className="p-6 md:p-12 animate-in fade-in duration-500 overflow-y-auto h-screen no-scrollbar pb-32">
      <header className="mb-12">
        <div className="flex items-center space-x-2 text-pink-500 mb-2">
          <Sparkles size={20} />
          <span className="text-sm font-semibold tracking-wider uppercase">Bonding with {profile.name}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-baby">Good morning, Parent!</h1>
        <p className="text-gray-500 max-w-lg">
          Clark AI has prepared personalized activities for {profile.name} today based on their growth milestones.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={i}
              onClick={() => onAction(card.route)}
              className="group p-6 rounded-3xl bg-white soft-shadow hover:-translate-y-1 transition-all duration-300 text-left border border-transparent hover:border-pink-100"
            >
              <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-baby">{card.title}</h3>
              <p className="text-gray-500 text-sm">{card.desc}</p>
            </button>
          );
        })}
      </div>

      <section className="mt-16 bg-pink-50 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-pink-900 mb-4 font-baby">Parenting Insight</h2>
          <p className="text-pink-800/80 text-lg leading-relaxed mb-8">
            "Babies at {profile.age} years old love object permanence games. 
            Try the new <b>Monkey Hide & Seek</b> or use the <b>Baby Cam</b> to see what they're learning!"
          </p>
          <button 
            onClick={() => onAction(AppRoute.GUIDE)}
            className="px-8 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
          >
            Read Expert Guide
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
};

export default Dashboard;
