import { useState, useEffect } from 'react';

export type Language = 'en' | 'sw';

interface Translations {
  [key: string]: {
    en: string;
    sw: string;
  };
}

export const translations: Translations = {
  // Navigation
  home: { en: 'Home', sw: 'Nyumbani' },
  chat: { en: 'Chat', sw: 'Mazungumzo' },
  reels: { en: 'Reels', sw: 'Video' },
  account: { en: 'Account', sw: 'Akaunti' },
  
  // Home Tab
  feed: { en: 'Feed', sw: 'Mipasho' },
  yourStory: { en: 'Your Story', sw: 'Hadithi Yako' },
  noPostsYet: { en: 'No posts yet', sw: 'Hakuna machapisho bado' },
  startFollowing: { en: 'Start following people to see their posts here', sw: 'Fuata watu kuona machapisho yao hapa' },
  likes: { en: 'likes', sw: 'imependwa' },
  
  // Notifications
  notifications: { en: 'Notifications', sw: 'Arifa' },
  noNotifications: { en: 'No notifications yet', sw: 'Hakuna arifa bado' },
  notificationsDesc: { en: 'When someone likes or comments on your posts, you\'ll see it here', sw: 'Ukipendwa au kutumiwa maoni, utaona hapa' },
  today: { en: 'Today', sw: 'Leo' },
  thisWeek: { en: 'This Week', sw: 'Wiki Hii' },
  earlier: { en: 'Earlier', sw: 'Awali' },
  
  // Post/Story Creation
  createPost: { en: 'Create Post', sw: 'Unda Chapisho' },
  createStory: { en: 'Create Story', sw: 'Unda Hadithi' },
  addCaption: { en: 'Add a caption...', sw: 'Ongeza maelezo...' },
  share: { en: 'Share', sw: 'Shiriki' },
  cancel: { en: 'Cancel', sw: 'Ghairi' },
  next: { en: 'Next', sw: 'Endelea' },
  done: { en: 'Done', sw: 'Tayari' },
  
  // Edit Tools
  filters: { en: 'Filters', sw: 'Vichujio' },
  adjust: { en: 'Adjust', sw: 'Rekebisha' },
  brightness: { en: 'Brightness', sw: 'Mwangaza' },
  contrast: { en: 'Contrast', sw: 'Tofauti' },
  saturation: { en: 'Saturation', sw: 'Rangi' },
  warmth: { en: 'Warmth', sw: 'Joto' },
  text: { en: 'Text', sw: 'Maandishi' },
  draw: { en: 'Draw', sw: 'Chora' },
  stickers: { en: 'Stickers', sw: 'Stika' },
  
  // Settings
  settings: { en: 'Settings', sw: 'Mipangilio' },
  editProfile: { en: 'Edit Profile', sw: 'Hariri Wasifu' },
  privacy: { en: 'Privacy', sw: 'Faragha' },
  security: { en: 'Security', sw: 'Usalama' },
  theme: { en: 'Theme', sw: 'Mandhari' },
  language: { en: 'Language', sw: 'Lugha' },
  sounds: { en: 'Sounds', sw: 'Sauti' },
  help: { en: 'Help', sw: 'Msaada' },
  about: { en: 'About', sw: 'Kuhusu' },
  logOut: { en: 'Log Out', sw: 'Ondoka' },
  darkMode: { en: 'Dark Mode', sw: 'Hali ya Giza' },
  lightMode: { en: 'Light Mode', sw: 'Hali ya Mwanga' },
  english: { en: 'English', sw: 'Kiingereza' },
  swahili: { en: 'Swahili', sw: 'Kiswahili' },
  
  // Profile
  posts: { en: 'Posts', sw: 'Machapisho' },
  followers: { en: 'Followers', sw: 'Wafuasi' },
  following: { en: 'Following', sw: 'Unafuata' },
  
  // Gallery
  gallery: { en: 'Gallery', sw: 'Picha' },
  camera: { en: 'Camera', sw: 'Kamera' },
  selectPhoto: { en: 'Select Photo', sw: 'Chagua Picha' },
  
  // Buttons
  save: { en: 'Save', sw: 'Hifadhi' },
  delete: { en: 'Delete', sw: 'Futa' },
  edit: { en: 'Edit', sw: 'Hariri' },
  back: { en: 'Back', sw: 'Rudi' },
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return { language, setLanguage, t };
};
