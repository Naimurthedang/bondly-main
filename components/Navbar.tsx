
import React from 'react';
import { AppRoute } from '../types';
import { 
  Heart, 
  BookOpen, 
  Music, 
  Gamepad2, 
  Users,
  Video, 
  MessageCircle,
  Settings,
  Smile,
  ShoppingBag,
  Camera
} from 'lucide-react';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { id: AppRoute.DASHBOARD, icon: Heart, label: 'Bondly' },
    { id: AppRoute.STORIES, icon: BookOpen, label: 'Stories' },
    { id: AppRoute.SONGS, icon: Music, label: 'Songs' },
    { id: AppRoute.TOYS, icon: Gamepad2, label: 'Toys' },
    { id: AppRoute.MONKEY_GAME, icon: Smile, label: 'Monkeys' },
    { id: AppRoute.BABY_CAM, icon: Camera, label: 'BabyCam' },
    { id: AppRoute.SHOP, icon: ShoppingBag, label: 'Shop' },
    { id: AppRoute.FRIENDS, icon: Users, label: 'Friends' },
    { id: AppRoute.VIDEOS, icon: Video, label: 'Videos' },
    { id: AppRoute.GUIDE, icon: MessageCircle, label: 'Guide' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-peach-100 z-50 px-4 py-2 md:relative md:border-t-0 md:border-r md:w-64 md:h-screen md:bg-peach-50/30">
      <div className="flex justify-between items-center md:flex-col md:h-full md:py-8 overflow-x-auto md:overflow-x-visible no-scrollbar">
        <div className="hidden md:flex flex-col items-center mb-12">
          <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 mb-2">
            <Heart fill="currentColor" size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 font-baby">Bondly</h1>
        </div>

        <div className="flex md:flex-col w-full justify-around md:space-y-2 min-w-max md:min-w-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col md:flex-row items-center p-2 rounded-xl transition-all duration-300 px-4 md:w-full ${
                  isActive 
                    ? 'text-pink-500 bg-pink-50' 
                    : 'text-gray-400 hover:text-gray-600 md:hover:bg-gray-50'
                }`}
              >
                <Icon size={24} className={`${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] md:text-sm mt-1 md:mt-0 md:ml-3 font-medium whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:block mt-auto w-full px-4">
           <button className="flex items-center space-x-3 text-gray-500 p-3 rounded-xl hover:bg-gray-100 w-full transition-colors">
             <Settings size={20} />
             <span className="text-sm font-medium">Settings</span>
           </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
