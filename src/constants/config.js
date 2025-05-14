export const SITE_CONFIG = {
  name: 'Delbi Restaurant',
  description: 'Experience exquisite dining at Delbi Restaurant',
  url: 'https://delbi-restaurant.com',
  email: 'info@delbi-restaurant.com',
  phone: '+1 (123) 456-7890',
  address: '123 Restaurant Street, City, Country',
  social: {
    facebook: 'https://facebook.com/delbi-restaurant',
    instagram: 'https://instagram.com/delbi-restaurant',
    twitter: 'https://twitter.com/delbi-restaurant'
  },
  hours: {
    weekdays: '11:00 AM - 10:00 PM',
    weekend: '10:00 AM - 11:00 PM'
  }
};

export const LANGUAGES = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

export const ROUTES = {
  home: '/',
  menu: '/menu',
  about: '/about',
  reservation: '/reservation',
  admin: '/admin'
};

export const MENU_CATEGORIES = {
  starters: 'starters',
  mainCourses: 'mainCourses',
  desserts: 'desserts',
  drinks: 'drinks'
};

export const THEME = {
  light: 'light',
  dark: 'dark'
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
}; 