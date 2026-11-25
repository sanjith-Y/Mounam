/**
 * MOUNAM Multilingual Translation Database
 * Provides authentic, natural translations for all 42 predefined phrases
 * across the 6 supported languages: English, Tamil, Hindi, Telugu, Malayalam, and Kannada.
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', locale: 'en-US', flag: '🌐' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', locale: 'ml-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN', flag: '🇮🇳' },
];

export interface PhraseTranslationEntry {
  id: string;
  category: string;
  icon: string;
  english: string;
  label: string;
  translations: Record<string, string>;
  labels: Record<string, string>;
}

export const PHRASE_TRANSLATIONS: Record<string, PhraseTranslationEntry> = {
  // A. FOOD & DRINK
  fd_1: {
    id: 'fd_1', category: 'food_drink', icon: '💧', english: 'I want water.', label: 'I want water',
    translations: {
      en: 'I want water.', ta: 'எனக்கு தண்ணீர் வேண்டும்.', hi: 'मुझे पानी चाहिए।',
      te: 'నాకు నీళ్లు కావాలి.', ml: 'എനിക്ക് വെള്ളം വേണം.', kn: 'ನನಗೆ ನೀರು ಬೇಕು.'
    },
    labels: {
      en: 'I want water', ta: 'தண்ணீர் வேண்டும்', hi: 'पानी चाहिए',
      te: 'నీళ్లు కావాలి', ml: 'വെള്ളം വേണം', kn: 'ನೀರು ಬೇಕು'
    }
  },
  fd_2: {
    id: 'fd_2', category: 'food_drink', icon: '🍲', english: 'I want food.', label: 'I want food',
    translations: {
      en: 'I want food.', ta: 'எனக்கு உணவு வேண்டும்.', hi: 'मुझे खाना चाहिए।',
      te: 'నాకు ఆహారం కావాలి.', ml: 'എനിക്ക് ഭക്ഷണം വേണം.', kn: 'ನನಗೆ ಊಟ ಬೇಕು.'
    },
    labels: {
      en: 'I want food', ta: 'உணவு வேண்டும்', hi: 'खाना चाहिए',
      te: 'ఆహారం కావాలి', ml: 'ഭക്ഷണം വേണം', kn: 'ಊಟ ಬೇಕು'
    }
  },
  fd_3: {
    id: 'fd_3', category: 'food_drink', icon: '🍽️', english: 'I am hungry.', label: 'I am hungry',
    translations: {
      en: 'I am hungry.', ta: 'எனக்குப் பசிக்கிறது.', hi: 'मुझे भूख लगी है।',
      te: 'నాకు ఆకలిగా ఉంది.', ml: 'എനിക്ക് വിശക്കുന്നു.', kn: 'ನನಗೆ ಹಸಿವಾಗಿದೆ.'
    },
    labels: {
      en: 'I am hungry', ta: 'பசிக்கிறது', hi: 'भूख लगी है',
      te: 'ఆకలిగా ఉంది', ml: 'വിശക്കുന്നു', kn: 'ಹಸಿವಾಗಿದೆ'
    }
  },
  fd_4: {
    id: 'fd_4', category: 'food_drink', icon: '🥤', english: 'I am thirsty.', label: 'I am thirsty',
    translations: {
      en: 'I am thirsty.', ta: 'எனக்கு தாகமாக இருக்கிறது.', hi: 'मुझे प्यास लगी है।',
      te: 'నాకు దాహంగా ఉంది.', ml: 'എനിക്ക് ദാഹിക്കുന്നു.', kn: 'ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ.'
    },
    labels: {
      en: 'I am thirsty', ta: 'தாகமாக இருக்கிறது', hi: 'प्यास लगी है',
      te: 'దాహంగా ఉంది', ml: 'ദാഹിക്കുന്നു', kn: 'ಬಾಯಾರಿಕೆಯಾಗಿದೆ'
    }
  },
  fd_5: {
    id: 'fd_5', category: 'food_drink', icon: '🥛', english: 'I want milk.', label: 'I want milk',
    translations: {
      en: 'I want milk.', ta: 'எனக்கு பால் வேண்டும்.', hi: 'मुझे दूध चाहिए।',
      te: 'నాకు పాలు కావాలి.', ml: 'എനിക്ക് പാൽ വേണം.', kn: 'ನನಗೆ ಹಾಲು ಬೇಕು.'
    },
    labels: {
      en: 'I want milk', ta: 'பால் வேண்டும்', hi: 'दूध चाहिए',
      te: 'పాలు కావాలి', ml: 'പാൽ വേണം', kn: 'ಹಾಲು ಬೇಕು'
    }
  },
  fd_6: {
    id: 'fd_6', category: 'food_drink', icon: '🧃', english: 'I want juice.', label: 'I want juice',
    translations: {
      en: 'I want juice.', ta: 'எனக்கு பழச்சாறு வேண்டும்.', hi: 'मुझे जूस चाहिए।',
      te: 'నాకు జ్యూస్ కావాలి.', ml: 'എനിക്ക് ജ്യൂസ് വേണം.', kn: 'ನನಗೆ ಜ್ಯೂಸ್ ಬೇಕು.'
    },
    labels: {
      en: 'I want juice', ta: 'பழச்சாறு வேண்டும்', hi: 'जूस चाहिए',
      te: 'జ్యూస్ కావాలి', ml: 'ജ്യൂസ് വേണം', kn: 'ಜ್ಯೂಸ್ ಬೇಕು'
    }
  },
  fd_7: {
    id: 'fd_7', category: 'food_drink', icon: '☕', english: 'I want tea.', label: 'I want tea',
    translations: {
      en: 'I want tea.', ta: 'எனக்கு தேநீர் வேண்டும்.', hi: 'मुझे चाय चाहिए।',
      te: 'నాకు టీ కావాలి.', ml: 'എനിക്ക് ചായ വേണം.', kn: 'ನನಗೆ ಚಹಾ ಬೇಕು.'
    },
    labels: {
      en: 'I want tea', ta: 'தேநீர் வேண்டும்', hi: 'चाय चाहिए',
      te: 'టీ కావాలి', ml: 'ചായ വേണം', kn: 'ಚಹಾ ಬೇಕು'
    }
  },
  fd_8: {
    id: 'fd_8', category: 'food_drink', icon: '☕', english: 'I want coffee.', label: 'I want coffee',
    translations: {
      en: 'I want coffee.', ta: 'எனக்கு காபி வேண்டும்.', hi: 'मुझे कॉफ़ी चाहिए।',
      te: 'నాకు కాఫీ కావాలి.', ml: 'എനിക്ക് കാപ്പി വേണം.', kn: 'ನನಗೆ ಕಾಫಿ ಬೇಕು.'
    },
    labels: {
      en: 'I want coffee', ta: 'காபி வேண்டும்', hi: 'कॉफ़ी चाहिए',
      te: 'కాఫీ కావాలి', ml: 'കാപ്പി വേണം', kn: 'ಕಾಫಿ ಬೇಕು'
    }
  },

  // B. HEALTH & BODY
  hb_1: {
    id: 'hb_1', category: 'health_body', icon: '🤕', english: 'I have a headache.', label: 'I have a headache',
    translations: {
      en: 'I have a headache.', ta: 'எனக்கு தலை வலிக்கிறது.', hi: 'मेरे सिर में दर्द है।',
      te: 'నాకు తలనొప్పిగా ఉంది.', ml: 'എനിക്ക് തലവേദനയുണ്ട്.', kn: 'ನನಗೆ ತಲೆನೋವಿದೆ.'
    },
    labels: {
      en: 'Headache', ta: 'தலைவலி', hi: 'सिरदर्द',
      te: 'తలనొప్పి', ml: 'തലവേദന', kn: 'ತಲೆನೋವು'
    }
  },
  hb_2: {
    id: 'hb_2', category: 'health_body', icon: '🤢', english: 'My stomach hurts.', label: 'My stomach hurts',
    translations: {
      en: 'My stomach hurts.', ta: 'எனக்கு வயிறு வலிக்கிறது.', hi: 'मेरे पेट में दर्द हो रहा है।',
      te: 'నా కడుపు నొప్పిగా ఉంది.', ml: 'എനിക്ക് വയറുവേദനയുണ്ട്.', kn: 'ನನ್ನ ಹೊಟ್ಟೆ ನೋಯುತ್ತಿದೆ.'
    },
    labels: {
      en: 'Stomach hurts', ta: 'வயிற்று வலி', hi: 'पेट दर्द',
      te: 'కడుపు నొప్పి', ml: 'വയറുവേദന', kn: 'ಹೊಟ್ಟೆ ನೋವು'
    }
  },
  hb_3: {
    id: 'hb_3', category: 'health_body', icon: '⚡', english: 'I have pain.', label: 'I have pain',
    translations: {
      en: 'I have pain.', ta: 'எனக்கு வலிக்கிறது.', hi: 'मुझे दर्द हो रहा है।',
      te: 'నాకు నొప్పిగా ఉంది.', ml: 'എനിക്ക് വേദനയുണ്ട്.', kn: 'ನನಗೆ ನೋವಾಗುತ್ತಿದೆ.'
    },
    labels: {
      en: 'I have pain', ta: 'வலிக்கிறது', hi: 'दर्द है',
      te: 'నొప్పిగా ఉంది', ml: 'വേദനയുണ്ട്', kn: 'ನೋವಿದೆ'
    }
  },
  hb_4: {
    id: 'hb_4', category: 'health_body', icon: '💫', english: 'I feel dizzy.', label: 'I feel dizzy',
    translations: {
      en: 'I feel dizzy.', ta: 'எனக்கு தலை சுற்றுகிறது.', hi: 'मुझे चक्कर आ रहे हैं।',
      te: 'నాకు తలతిరుగుతోంది.', ml: 'എനിക്ക് തലകറക്കം തോന്നുന്നു.', kn: 'ನನಗೆ ತಲೆತಿರುಗುತ್ತಿದೆ.'
    },
    labels: {
      en: 'Feel dizzy', ta: 'தலைசுற்றல்', hi: 'चक्कर आना',
      te: 'తలతిరుగుతోంది', ml: 'തലകറക്കം', kn: 'ತಲೆತಿರುಗುವಿಕೆ'
    }
  },
  hb_5: {
    id: 'hb_5', category: 'health_body', icon: '🤒', english: 'I feel sick.', label: 'I feel sick',
    translations: {
      en: 'I feel sick.', ta: 'எனக்கு உடல்நிலை சரியில்லை.', hi: 'मेरी तबीयत ठीक नहीं है।',
      te: 'నాకు ఒంట్లో బాగాలేదు.', ml: 'എനിക്ക് അസുഖം തോന്നുന്നു.', kn: 'ನನಗೆ ಆರಾಮವಿಲ್ಲ.'
    },
    labels: {
      en: 'Feel sick', ta: 'உடல்நிலை சரியில்லை', hi: 'तबीयत खराब',
      te: 'బాగాలేదు', ml: 'അസുഖം', kn: 'ಆರಾಮವಿಲ್ಲ'
    }
  },
  hb_6: {
    id: 'hb_6', category: 'health_body', icon: '💊', english: 'I need medicine.', label: 'I need medicine',
    translations: {
      en: 'I need medicine.', ta: 'எனக்கு மருந்து வேண்டும்.', hi: 'मुझे दवाई चाहिए।',
      te: 'నాకు మందులు కావాలి.', ml: 'എനിക്ക് മരുന്ന് വേണം.', kn: 'ನನಗೆ ಔಷಧಿ ಬೇಕು.'
    },
    labels: {
      en: 'Need medicine', ta: 'மருந்து வேண்டும்', hi: 'दवाई चाहिए',
      te: 'మందులు కావాలి', ml: 'മരുന്ന് വേണം', kn: 'ಔಷಧಿ ಬೇಕು'
    }
  },
  hb_7: {
    id: 'hb_7', category: 'health_body', icon: '👨‍⚕️', english: 'I need a doctor.', label: 'I need a doctor',
    translations: {
      en: 'I need a doctor.', ta: 'எனக்கு மருத்துவர் வேண்டும்.', hi: 'मुझे डॉक्टर चाहिए।',
      te: 'నాకు డాక్టర్ కావాలి.', ml: 'എനിക്ക് ഡോക്ടറെ കാണണം.', kn: 'ನನಗೆ ವೈದ್ಯರು ಬೇಕು.'
    },
    labels: {
      en: 'Need doctor', ta: 'மருத்துவர் வேண்டும்', hi: 'डॉक्टर चाहिए',
      te: 'డాక్టర్ కావాలి', ml: 'ഡോക്ടർ വേണം', kn: 'ವೈದ್ಯರು ಬೇಕು'
    }
  },
  hb_8: {
    id: 'hb_8', category: 'health_body', icon: '🛌', english: 'I need to rest.', label: 'I need to rest',
    translations: {
      en: 'I need to rest.', ta: 'நான் ஓய்வெடுக்க வேண்டும்.', hi: 'मुझे आराम करने की ज़रूरत है।',
      te: 'నేను విశ్రాంతి తీసుకోవాలి.', ml: 'എനിക്ക് വിശ്രമിക്കണം.', kn: 'ನಾನು ವಿಶ್ರಾಂತಿ ಪಡೆಯಬೇಕು.'
    },
    labels: {
      en: 'Need to rest', ta: 'ஓய்வு வேண்டும்', hi: 'आराम चाहिए',
      te: 'విశ్రాంతి కావాలి', ml: 'വിശ്രമം വേണം', kn: 'ವಿಶ್ರಾಂತಿ ಬೇಕು'
    }
  },

  // C. EMOTIONS
  em_1: {
    id: 'em_1', category: 'emotions', icon: '😊', english: 'I am happy.', label: 'I am happy',
    translations: {
      en: 'I am happy.', ta: 'நான் மகிழ்ச்சியாக இருக்கிறேன்.', hi: 'मैं खुश हूँ।',
      te: 'నేను సంతోషంగా ఉన్నాను.', ml: 'ഞാൻ സന്തോഷവാനാണ്.', kn: 'ನಾನು ಸಂತೋಷವಾಗಿದ್ದೇನೆ.'
    },
    labels: {
      en: 'Happy', ta: 'மகிழ்ச்சி', hi: 'खुश',
      te: 'సంతోషం', ml: 'സന്തോഷം', kn: 'ಸಂತೋಷ'
    }
  },
  em_2: {
    id: 'em_2', category: 'emotions', icon: '😢', english: 'I am sad.', label: 'I am sad',
    translations: {
      en: 'I am sad.', ta: 'நான் வருத்தமாக இருக்கிறேன்.', hi: 'मैं उदास हूँ।',
      te: 'నేను బాధపడుతున్నాను.', ml: 'ഞാൻ സങ്കടത്തിലാണ്.', kn: 'ನಾನು ದುಃಖಿತನಾಗಿದ್ದೇನೆ.'
    },
    labels: {
      en: 'Sad', ta: 'வருத்தம்', hi: 'उदास',
      te: 'బాధ', ml: 'സങ്കടം', kn: 'ದುಃಖ'
    }
  },
  em_3: {
    id: 'em_3', category: 'emotions', icon: '😨', english: 'I am scared.', label: 'I am scared',
    translations: {
      en: 'I am scared.', ta: 'எனக்கு பயமாக இருக்கிறது.', hi: 'मुझे डर लग रहा है।',
      te: 'నాకు భయంగా ఉంది.', ml: 'എനിക്ക് ഭയമാകുന്നു.', kn: 'ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ.'
    },
    labels: {
      en: 'Scared', ta: 'பயம்', hi: 'डर',
      te: 'భయం', ml: 'ഭയം', kn: 'ಭಯ'
    }
  },
  em_4: {
    id: 'em_4', category: 'emotions', icon: '😠', english: 'I am angry.', label: 'I am angry',
    translations: {
      en: 'I am angry.', ta: 'எனக்கு கோபமாக இருக்கிறது.', hi: 'मुझे गुस्सा आ रहा है।',
      te: 'నాకు కోపంగా ఉంది.', ml: 'എനിക്ക് ദേഷ്യമുണ്ട്.', kn: 'ನನಗೆ ಕೋಪ ಬಂದಿದೆ.'
    },
    labels: {
      en: 'Angry', ta: 'கோபம்', hi: 'गुस्सा',
      te: 'కోపం', ml: 'ദേഷ്യം', kn: 'ಕೋಪ'
    }
  },
  em_5: {
    id: 'em_5', category: 'emotions', icon: '😣', english: 'I am uncomfortable.', label: 'I am uncomfortable',
    translations: {
      en: 'I am uncomfortable.', ta: 'எனக்கு அசௌகரியமாக இருக்கிறது.', hi: 'मुझे असहज लग रहा है।',
      te: 'నాకు అసౌకర్యంగా ఉంది.', ml: 'എനിക്ക് അസ്വസ്ഥത തോന്നുന്നു.', kn: 'ನನಗೆ ಅಸೌಕರ್ಯವಾಗಿದೆ.'
    },
    labels: {
      en: 'Uncomfortable', ta: 'அசௌகரியம்', hi: 'असहज',
      te: 'అసౌకర్యం', ml: 'അസ്വസ്ഥത', kn: 'ಅಸೌಕರ್ಯ'
    }
  },
  em_6: {
    id: 'em_6', category: 'emotions', icon: '🥺', english: 'I feel lonely.', label: 'I feel lonely',
    translations: {
      en: 'I feel lonely.', ta: 'நான் தனிமையாக உணர்கிறேன்.', hi: 'मुझे अकेलापन लग रहा है।',
      te: 'నాకు ఒంటరిగా అనిపిస్తోంది.', ml: 'എനിക്ക് ഏകാന്തത തോന്നുന്നു.', kn: 'ನನಗೆ ಒಂಟಿತನ ಕಾಡುತ್ತಿದೆ.'
    },
    labels: {
      en: 'Lonely', ta: 'தனிமை', hi: 'अकेलापन',
      te: 'ఒంటరితనం', ml: 'ഏകാന്തത', kn: 'ಒಂಟಿತನ'
    }
  },
  em_7: {
    id: 'em_7', category: 'emotions', icon: '🥱', english: 'I am tired.', label: 'I am tired',
    translations: {
      en: 'I am tired.', ta: 'எனக்கு சோர்வாக இருக்கிறது.', hi: 'मैं थक गया/गई हूँ।',
      te: 'నేను అలసిపోయాను.', ml: 'എനിക്ക് ക്ഷീണം തോന്നുന്നു.', kn: 'ನನಗೆ ಸುಸ್ತಾಗಿದೆ.'
    },
    labels: {
      en: 'Tired', ta: 'சோர்வு', hi: 'थकान',
      te: 'అలసట', ml: 'ക്ഷീണം', kn: 'ಸುಸ್ತು'
    }
  },

  // D. DAILY NEEDS
  dn_1: {
    id: 'dn_1', category: 'daily_needs', icon: '🚻', english: 'I need the bathroom.', label: 'I need the bathroom',
    translations: {
      en: 'I need the bathroom.', ta: 'நான் கழிப்பறைக்கு செல்ல வேண்டும்.', hi: 'मुझे शौचालय जाना है।',
      te: 'నేను బాత్రూమ్‌కి వెళ్లాలి.', ml: 'എനിക്ക് ബാത്ത്റൂമിൽ പോകണം.', kn: 'ನಾನು ವಾಶ್‌ರೂಮ್‌ಗೆ ಹೋಗಬೇಕು.'
    },
    labels: {
      en: 'Bathroom', ta: 'கழிப்பறை', hi: 'शौचालय',
      te: 'బాత్రూమ్', ml: 'ബാത്ത്റൂം', kn: 'ವಾಶ್‌ರೂಮ್'
    }
  },
  dn_2: {
    id: 'dn_2', category: 'daily_needs', icon: '😴', english: 'I want to sleep.', label: 'I want to sleep',
    translations: {
      en: 'I want to sleep.', ta: 'நான் தூங்க விரும்புகிறேன்.', hi: 'मुझे सोना है।',
      te: 'నేను నిద్రపోవాలి.', ml: 'എനിക്ക് ഉറങ്ങണം.', kn: 'ನಾನು ಮಲಗಬೇಕು.'
    },
    labels: {
      en: 'Sleep', ta: 'தூக்கம்', hi: 'सोना',
      te: 'నిద్ర', ml: 'ഉറക്കം', kn: 'ನಿದ್ರೆ'
    }
  },
  dn_3: {
    id: 'dn_3', category: 'daily_needs', icon: '🌳', english: 'I want to go outside.', label: 'I want to go outside',
    translations: {
      en: 'I want to go outside.', ta: 'நான் வெளியே செல்ல விரும்புகிறேன்.', hi: 'मुझे बाहर जाना है।',
      te: 'నేను బయటికి వెళ్లాలనుకుంటున్నాను.', ml: 'എനിക്ക് പുറത്തു പോകണം.', kn: 'ನಾನು ಹೊರಗೆ ಹೋಗಲು ಬಯಸುತ್ತೇನೆ.'
    },
    labels: {
      en: 'Go outside', ta: 'வெளியே செல்ல', hi: 'बाहर जाना',
      te: 'బయటకు', ml: 'പുറത്ത്', kn: 'ಹೊರಗೆ'
    }
  },
  dn_4: {
    id: 'dn_4', category: 'daily_needs', icon: '🆘', english: 'Please help me.', label: 'Please help me',
    translations: {
      en: 'Please help me.', ta: 'தயவுசெய்து எனக்கு உதவுங்கள்.', hi: 'कृपया मेरी मदद कीजिए।',
      te: 'దయచేసి నాకు సహాయం చేయండి.', ml: 'ദയവായി എന്നെ സഹായിക്കൂ.', kn: 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.'
    },
    labels: {
      en: 'Please help me', ta: 'உதவுங்கள்', hi: 'मदद कीजिए',
      te: 'సహాయం చేయండి', ml: 'സഹായിക്കൂ', kn: 'ಸಹಾಯ ಮಾಡಿ'
    }
  },
  dn_5: {
    id: 'dn_5', category: 'daily_needs', icon: '🪑', english: 'I want to sit down.', label: 'I want to sit down',
    translations: {
      en: 'I want to sit down.', ta: 'நான் உட்கார விரும்புகிறேன்.', hi: 'मैं बैठना चाहता हूँ।',
      te: 'నేను కూర్చోవాలనుకుంటున్నాను.', ml: 'എനിക്ക് ഇരിക്കണം.', kn: 'ನಾನು ಕುಳಿತುಕೊಳ್ಳಲು ಬಯಸುತ್ತೇನೆ.'
    },
    labels: {
      en: 'Sit down', ta: 'உட்கார', hi: 'बैठना',
      te: 'కూర్చోవడం', ml: 'ഇരിക്കുക', kn: 'ಕುಳಿತುಕೊಳ್ಳಿ'
    }
  },
  dn_6: {
    id: 'dn_6', category: 'daily_needs', icon: '🧍', english: 'I want to stand up.', label: 'I want to stand up',
    translations: {
      en: 'I want to stand up.', ta: 'நான் எழுந்து நிற்க விரும்புகிறேன்.', hi: 'मैं खड़ा होना चाहता हूँ।',
      te: 'నేను నిలబడాలనుకుంటున్నాను.', ml: 'എനിക്ക് എഴുന്നേൽക്കണം.', kn: 'ನಾನು ಎದ್ದು ನಿಲ್ಲಲು ಬಯಸುತ್ತೇನೆ.'
    },
    labels: {
      en: 'Stand up', ta: 'நிற்க', hi: 'खड़े होना',
      te: 'నిలబడటం', ml: 'എഴുന്നേൽക്കുക', kn: 'ಎದ್ದು ನಿಲ್ಲಿ'
    }
  },
  dn_7: {
    id: 'dn_7', category: 'daily_needs', icon: '👨‍👩‍👧', english: 'I need my family.', label: 'I need my family',
    translations: {
      en: 'I need my family.', ta: 'என் குடும்பத்தினர் எனக்கு வேண்டும்.', hi: 'मुझे मेरे परिवार की ज़रूरत है।',
      te: 'నాకు నా కుటుంబం కావాలి.', ml: 'എനിക്ക് എന്റെ കുടുംബത്തെ വേണം.', kn: 'ನನಗೆ ನನ್ನ ಕುಟುಂಬ ಬೇಕು.'
    },
    labels: {
      en: 'Need family', ta: 'குடும்பத்தினர்', hi: 'परिवार',
      te: 'కుటుంబం', ml: 'കുടുംബം', kn: 'ಕುಟುಂಬ'
    }
  },

  // E. PEOPLE
  pe_1: {
    id: 'pe_1', category: 'people', icon: '👩', english: 'Mother.', label: 'Mother',
    translations: {
      en: 'Mother.', ta: 'அம்மா.', hi: 'माँ।',
      te: 'అమ్మ.', ml: 'അമ്മ.', kn: 'ಅಮ್ಮ.'
    },
    labels: {
      en: 'Mother', ta: 'அம்மா', hi: 'माँ',
      te: 'అమ్మ', ml: 'അമ്മ', kn: 'ಅಮ್ಮ'
    }
  },
  pe_2: {
    id: 'pe_2', category: 'people', icon: '👨', english: 'Father.', label: 'Father',
    translations: {
      en: 'Father.', ta: 'அப்பா.', hi: 'पिताजी।',
      te: 'నాన్న.', ml: 'അച്ഛൻ.', kn: 'ಅಪ್ಪ.'
    },
    labels: {
      en: 'Father', ta: 'அப்பா', hi: 'पिताजी',
      te: 'నాన్న', ml: 'അച്ഛൻ', kn: 'ಅಪ್ಪ'
    }
  },
  pe_3: {
    id: 'pe_3', category: 'people', icon: '👦', english: 'Brother.', label: 'Brother',
    translations: {
      en: 'Brother.', ta: 'சகோதரன்.', hi: 'भाई।',
      te: 'సోదరుడు.', ml: 'സഹോദരൻ.', kn: 'ಸಹೋದರ.'
    },
    labels: {
      en: 'Brother', ta: 'சகோதரன்', hi: 'भाई',
      te: 'సోదరుడు', ml: 'സഹോദരൻ', kn: 'ಸಹೋದರ'
    }
  },
  pe_4: {
    id: 'pe_4', category: 'people', icon: '👧', english: 'Sister.', label: 'Sister',
    translations: {
      en: 'Sister.', ta: 'சகோதரி.', hi: 'बहन।',
      te: 'సోదరి.', ml: 'സഹോദരി.', kn: 'ಸಹೋದರಿ.'
    },
    labels: {
      en: 'Sister', ta: 'சகோதரி', hi: 'बहन',
      te: 'సోదరి', ml: 'സഹോദരി', kn: 'ಸಹೋದರಿ'
    }
  },
  pe_5: {
    id: 'pe_5', category: 'people', icon: '🩺', english: 'Doctor.', label: 'Doctor',
    translations: {
      en: 'Doctor.', ta: 'மருத்துவர்.', hi: 'डॉक्टर।',
      te: 'డాక్టర్.', ml: 'ഡോക്ടർ.', kn: 'ವೈದ್ಯರು.'
    },
    labels: {
      en: 'Doctor', ta: 'மருத்துவர்', hi: 'डॉक्टर',
      te: 'డాక్టర్', ml: 'ഡോക്ടർ', kn: 'ವೈದ್ಯರು'
    }
  },
  pe_6: {
    id: 'pe_6', category: 'people', icon: '🤝', english: 'Caregiver.', label: 'Caregiver',
    translations: {
      en: 'Caregiver.', ta: 'பராமரிப்பாளர்.', hi: 'देखभालकर्ता।',
      te: 'సంరక్షకుడు.', ml: 'പരിചാരകൻ.', kn: 'ಆರೈಕೆದಾರರು.'
    },
    labels: {
      en: 'Caregiver', ta: 'பராமரிப்பாளர்', hi: 'देखभालकर्ता',
      te: 'సంరక్షకుడు', ml: 'പരിചാരകൻ', kn: 'ಆರೈಕೆದಾರರು'
    }
  },
  pe_7: {
    id: 'pe_7', category: 'people', icon: '🧑‍🤝‍🧑', english: 'Friend.', label: 'Friend',
    translations: {
      en: 'Friend.', ta: 'நண்பர்.', hi: 'दोस्त।',
      te: 'స్నేహితుడు.', ml: 'സുഹൃത്ത്.', kn: 'ಸ್ನೇಹಿತ.'
    },
    labels: {
      en: 'Friend', ta: 'நண்பர்', hi: 'दोस्त',
      te: 'స్నేహితుడు', ml: 'സുഹൃത്ത്', kn: 'ಸ್ನೇಹಿತ'
    }
  },

  // F. EMERGENCY
  emg_1: {
    id: 'emg_1', category: 'emergency', icon: '🚨', english: 'Help me.', label: 'Help me',
    translations: {
      en: 'Help me.', ta: 'எனக்கு உதவுங்கள்.', hi: 'मेरी मदद कीजिए।',
      te: 'నాకు సహాయం చేయండి.', ml: 'എന്നെ സഹായിക്കൂ.', kn: 'ನನಗೆ ಸಹಾಯ ಮಾಡಿ.'
    },
    labels: {
      en: 'Help me', ta: 'உதவுங்கள்', hi: 'मदद कीजिए',
      te: 'సహాయం చేయండి', ml: 'സഹായിക്കൂ', kn: 'ಸಹಾಯ ಮಾಡಿ'
    }
  },
  emg_2: {
    id: 'emg_2', category: 'emergency', icon: '📞', english: 'Call my family.', label: 'Call my family',
    translations: {
      en: 'Call my family.', ta: 'என் குடும்பத்தினரை அழைக்கவும்.', hi: 'मेरे परिवार को बुलाइए।',
      te: 'నా కుటుంబానికి కాల్ చేయండి.', ml: 'എന്റെ കുടുംബത്തെ വിളിക്കൂ.', kn: 'ನನ್ನ ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ.'
    },
    labels: {
      en: 'Call my family', ta: 'குடும்பத்தை அழைக்கவும்', hi: 'परिवार को बुलाइए',
      te: 'కుటుంబానికి కాల్ చేయండి', ml: 'കുടുംബത്തെ വിളിക്കൂ', kn: 'ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ'
    }
  },
  emg_3: {
    id: 'emg_3', category: 'emergency', icon: '🏥', english: 'Call a doctor.', label: 'Call a doctor',
    translations: {
      en: 'Call a doctor.', ta: 'மருத்துவரை அழைக்கவும்.', hi: 'डॉक्टर को बुलाइए।',
      te: 'డాక్టర్‌ని పిలవండి.', ml: 'ഡോക്ടറെ വിളിക്കൂ.', kn: 'ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ.'
    },
    labels: {
      en: 'Call a doctor', ta: 'மருத்துவரை அழைக்கவும்', hi: 'डॉक्टर को बुलाइए',
      te: 'డాక్టర్‌ని పిలవండి', ml: 'ഡോക്ടറെ വിളിക്കൂ', kn: 'ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ'
    }
  },
  emg_4: {
    id: 'emg_4', category: 'emergency', icon: '⚡', english: 'I am in pain.', label: 'I am in pain',
    translations: {
      en: 'I am in pain.', ta: 'எனக்கு வலிக்கிறது.', hi: 'मुझे बहुत दर्द हो रहा है।',
      te: 'నాకు చాలా నొప్పిగా ఉంది.', ml: 'എനിക്ക് കഠിനമായ വേദനയുണ്ട്.', kn: 'ನನಗೆ ತೀವ್ರ ನೋವಾಗುತ್ತಿದೆ.'
    },
    labels: {
      en: 'I am in pain', ta: 'வலிக்கிறது', hi: 'बहुत दर्द है',
      te: 'చాలా నొప్పిగా ఉంది', ml: 'കഠിനമായ വേദന', kn: 'ತೀವ್ರ ನೋವು'
    }
  },
  emg_5: {
    id: 'emg_5', category: 'emergency', icon: '🆘', english: 'I need urgent help.', label: 'I need urgent help',
    translations: {
      en: 'I need urgent help.', ta: 'எனக்கு அவசர உதவி தேவை.', hi: 'मुझे तत्काल मदद चाहिए।',
      te: 'నాకు అత్యవసర సహాయం కావాలి.', ml: 'എനിക്ക് അടിയന്തിര സഹായം വേണം.', kn: 'ನನಗೆ ತುರ್ತು ಸಹಾಯ ಬೇಕು.'
    },
    labels: {
      en: 'Urgent help', ta: 'அவசர உதவி', hi: 'तत्काल मदद',
      te: 'అత్యవసర సహాయం', ml: 'അടിയന്തിര സഹായം', kn: 'ತುರ್ತು ಸಹಾಯ'
    }
  },
};

/**
 * Helper to get translated sentence for a phrase ID
 */
export const getPhraseSentence = (phraseId: string, langCode: string): string => {
  const item = PHRASE_TRANSLATIONS[phraseId];
  if (!item) return '';
  return item.translations[langCode] || item.translations['en'] || item.english;
};

/**
 * Helper to get localized label for a phrase ID
 */
export const getPhraseLabel = (phraseId: string, langCode: string): string => {
  const item = PHRASE_TRANSLATIONS[phraseId];
  if (!item) return '';
  return item.labels[langCode] || item.labels['en'] || item.label;
};

/**
 * Reverse lookup by English sentence
 */
export const translateEnglishSentence = (englishSentence: string, langCode: string): string => {
  const normalized = englishSentence.trim().toLowerCase();
  for (const entry of Object.values(PHRASE_TRANSLATIONS)) {
    if (entry.english.toLowerCase() === normalized || entry.label.toLowerCase() === normalized) {
      return entry.translations[langCode] || entry.english;
    }
  }
  return englishSentence;
};
