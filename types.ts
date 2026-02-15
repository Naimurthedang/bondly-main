
export interface BabyProfile {
  name: string;
  age: number; // in years
  language: string;
  mood?: string;
}

export interface StoryScene {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Storybook {
  title: string;
  theme: string;
  scenes: StoryScene[];
}

export interface Lullaby {
  lyrics: string;
  audioBlob?: Blob;
  mood: string;
}

export interface ParentingAdvice {
  summary: string;
  tips: string[];
  bondingActivity: string;
  safetyNote: string;
  groundingSources?: { web?: { uri: string, title: string } }[];
}

export interface Toy {
  id: string;
  name: string;
  type: 'Teddy' | 'Bunny' | 'Robot' | 'Dino' | 'Fruit' | 'Custom';
  personality: string;
  imageUrl: string;
  voiceStyle: string;
  status: 'happy' | 'broken';
}

export interface ToyInteraction {
  response: string;
  animation: 'bounce' | 'shake' | 'glow' | 'wiggle' | 'shatter' | 'repair';
  audioUrl?: string;
}

export interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
  personality: string;
  tagline: string;
  voiceName: string;
}

export interface FriendMessage {
  text: string;
  audioUrl?: string;
  mood: 'happy' | 'comforting' | 'playful' | 'sleepy';
}

export interface ProductRecommendation {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  category: 'clothing' | 'gear' | 'educational';
  link?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  STORIES = 'stories',
  SONGS = 'songs',
  TOYS = 'toys',
  FRIENDS = 'friends',
  VIDEOS = 'videos',
  GUIDE = 'guide',
  MONKEY_GAME = 'monkey_game',
  SHOP = 'shop',
  BABY_CAM = 'baby_cam'
}
