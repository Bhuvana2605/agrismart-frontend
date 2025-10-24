// Manual crop name translations (fallback when API fails)
export const cropTranslations: Record<string, Record<string, string>> = {
  // Telugu translations
  te: {
    'Rice': 'వరి',
    'Wheat': 'గోధుమ',
    'Cotton': 'పత్తి',
    'Maize': 'మొక్కజొన్న',
    'Sugarcane': 'చెరకు',
    'Jute': 'జనపనార',
    'Coffee': 'కాఫీ',
    'Tea': 'టీ',
    'Groundnut': 'వేరుశెనగ',
    'Coconut': 'కొబ్బరి',
    'Papaya': 'బొప్పాయి',
    'Orange': 'నారింజ',
    'Apple': 'ఆపిల్',
    'Mango': 'మామిడి',
    'Banana': 'అరటి',
    'Grapes': 'ద్రాక్ష',
    'Watermelon': 'పుచ్చకాయ',
    'Muskmelon': 'ఖర్బూజా',
    'Pomegranate': 'దానిమ్మ',
    'Chickpea': 'శనగలు',
    'Kidneybeans': 'రాజ్మా',
    'Pigeonpeas': 'కందిపప్పు',
    'Mothbeans': 'మోత్ బీన్స్',
    'Mungbean': 'పెసలు',
    'Blackgram': 'మినుములు',
    'Lentil': 'కాయధాన్యాలు',
  },
  // Hindi translations
  hi: {
    'Rice': 'चावल',
    'Wheat': 'गेहूं',
    'Cotton': 'कपास',
    'Maize': 'मक्का',
    'Sugarcane': 'गन्ना',
    'Jute': 'जूट',
    'Coffee': 'कॉफ़ी',
    'Tea': 'चाय',
    'Groundnut': 'मूंगफली',
    'Coconut': 'नारियल',
    'Papaya': 'पपीता',
    'Orange': 'संतरा',
    'Apple': 'सेब',
    'Mango': 'आम',
    'Banana': 'केला',
    'Grapes': 'अंगूर',
    'Watermelon': 'तरबूज',
    'Muskmelon': 'खरबूजा',
    'Pomegranate': 'अनार',
    'Chickpea': 'चना',
    'Kidneybeans': 'राजमा',
    'Pigeonpeas': 'अरहर दाल',
    'Mothbeans': 'मोठ बीन्स',
    'Mungbean': 'मूंग दाल',
    'Blackgram': 'उड़द दाल',
    'Lentil': 'मसूर दाल',
  }
};

/**
 * Translate crop name using hardcoded dictionary
 * This is a reliable fallback when API translation fails
 */
export const translateCropName = (cropName: string, targetLanguage: string): string => {
  if (!cropName || targetLanguage === 'en') {
    return cropName;
  }

  // Try exact match first
  if (cropTranslations[targetLanguage] && cropTranslations[targetLanguage][cropName]) {
    console.log(`✅ Translated: "${cropName}" → "${cropTranslations[targetLanguage][cropName]}"`);
    return cropTranslations[targetLanguage][cropName];
  }

  // Try case-insensitive match
  const lowerCropName = cropName.toLowerCase();
  for (const [english, translated] of Object.entries(cropTranslations[targetLanguage] || {})) {
    if (english.toLowerCase() === lowerCropName) {
      console.log(`✅ Translated (case-insensitive): "${cropName}" → "${translated}"`);
      return translated;
    }
  }

  // Return original if not found
  console.warn(`⚠️ No translation found for crop: "${cropName}" in ${targetLanguage}`);
  return cropName;
};
