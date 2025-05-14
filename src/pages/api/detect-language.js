import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Get IP address from request
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Use ipapi.co to get location data
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const { country_code } = response.data;

    // Map country codes to language codes
    const languageMap = {
      'NL': 'nl',
      'GB': 'en',
      'US': 'en',
      'FR': 'fr',
      'DE': 'de',
      'SA': 'ar',
      'AE': 'ar',
      'EG': 'ar',
      'MA': 'ar',
      'DZ': 'ar',
      'TN': 'ar',
      'LY': 'ar',
      'QA': 'ar',
      'KW': 'ar',
      'BH': 'ar',
      'OM': 'ar',
      'JO': 'ar',
      'LB': 'ar',
      'PS': 'ar',
      'SY': 'ar',
      'IQ': 'ar',
      'YE': 'ar'
    };

    // Get language code from country code, default to Dutch
    const language = languageMap[country_code] || 'nl';

    res.status(200).json({ language });
  } catch (error) {
    console.error('Error detecting language:', error);
    res.status(200).json({ language: 'nl' }); // Default to Dutch on error
  }
} 