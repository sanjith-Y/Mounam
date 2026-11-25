"""
Multilingual Language and Translation Endpoints for MOUNAM.
Provides 6 official languages and accurate regional translations for all predefined AAC phrases.
"""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from app.models.languages import LanguageInfo, PhraseTranslation

router = APIRouter(tags=["Languages & Translations"])

SUPPORTED_LANGUAGES: List[LanguageInfo] = [
    LanguageInfo(code="en", name="English", native_name="English", locale="en-US", flag="🌐"),
    LanguageInfo(code="ta", name="Tamil", native_name="தமிழ்", locale="ta-IN", flag="🇮🇳"),
    LanguageInfo(code="hi", name="Hindi", native_name="हिन्दी", locale="hi-IN", flag="🇮🇳"),
    LanguageInfo(code="te", name="Telugu", native_name="తెలుగు", locale="te-IN", flag="🇮🇳"),
    LanguageInfo(code="ml", name="Malayalam", native_name="മലയാളം", locale="ml-IN", flag="🇮🇳"),
    LanguageInfo(code="kn", name="Kannada", native_name="ಕನ್ನಡ", locale="kn-IN", flag="🇮🇳"),
]

# Database of all 42 predefined phrases translated into all 6 languages
TRANSLATIONS_DATABASE: Dict[str, PhraseTranslation] = {
    # Food & Drink
    "fd_1": PhraseTranslation(
        phrase_id="fd_1", category_id="food_drink", english="I want water.",
        translations={
            "en": "I want water.", "ta": "எனக்கு தண்ணீர் வேண்டும்.", "hi": "मुझे पानी चाहिए।",
            "te": "నాకు నీళ్లు కావాలి.", "ml": "എനിക്ക് വെള്ളം വേണം.", "kn": "ನನಗೆ ನೀರು ಬೇಕು."
        }
    ),
    "fd_2": PhraseTranslation(
        phrase_id="fd_2", category_id="food_drink", english="I want food.",
        translations={
            "en": "I want food.", "ta": "எனக்கு உணவு வேண்டும்.", "hi": "मुझे खाना चाहिए।",
            "te": "నాకు ఆహారం కావాలి.", "ml": "എനിക്ക് ഭക്ഷണം വേണം.", "kn": "ನನಗೆ ಊಟ ಬೇಕು."
        }
    ),
    "fd_3": PhraseTranslation(
        phrase_id="fd_3", category_id="food_drink", english="I am hungry.",
        translations={
            "en": "I am hungry.", "ta": "எனக்குப் பசிக்கிறது.", "hi": "मुझे भूख लगी है।",
            "te": "నాకు ఆకలిగా ఉంది.", "ml": "എനിക്ക് വിശക്കുന്നു.", "kn": "ನನಗೆ ಹಸಿವಾಗಿದೆ."
        }
    ),
    "fd_4": PhraseTranslation(
        phrase_id="fd_4", category_id="food_drink", english="I am thirsty.",
        translations={
            "en": "I am thirsty.", "ta": "எனக்கு தாகமாக இருக்கிறது.", "hi": "मुझे प्यास लगी है।",
            "te": "నాకు దాహంగా ఉంది.", "ml": "എനിക്ക് ദാഹിക്കുന്നു.", "kn": "ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ."
        }
    ),
    "fd_5": PhraseTranslation(
        phrase_id="fd_5", category_id="food_drink", english="I want milk.",
        translations={
            "en": "I want milk.", "ta": "எனக்கு பால் வேண்டும்.", "hi": "मुझे दूध चाहिए।",
            "te": "నాకు పాలు కావాలి.", "ml": "എനിക്ക് പാൽ വേണം.", "kn": "ನನಗೆ ಹಾಲು ಬೇಕು."
        }
    ),
    "fd_6": PhraseTranslation(
        phrase_id="fd_6", category_id="food_drink", english="I want juice.",
        translations={
            "en": "I want juice.", "ta": "எனக்கு பழச்சாறு வேண்டும்.", "hi": "मुझे जूस चाहिए।",
            "te": "నాకు జ్యూస్ కావాలి.", "ml": "എനിക്ക് ജ്യൂസ് വേണം.", "kn": "ನನಗೆ ಜ್ಯೂಸ್ ಬೇಕು."
        }
    ),
    "fd_7": PhraseTranslation(
        phrase_id="fd_7", category_id="food_drink", english="I want tea.",
        translations={
            "en": "I want tea.", "ta": "எனக்கு தேநீர் வேண்டும்.", "hi": "मुझे चाय चाहिए।",
            "te": "నాకు టీ కావాలి.", "ml": "എനിക്ക് ചായ വേണം.", "kn": "ನನಗೆ ಚಹಾ ಬೇಕು."
        }
    ),
    "fd_8": PhraseTranslation(
        phrase_id="fd_8", category_id="food_drink", english="I want coffee.",
        translations={
            "en": "I want coffee.", "ta": "எனக்கு காபி வேண்டும்.", "hi": "मुझे कॉफ़ी चाहिए।",
            "te": "నాకు కాఫీ కావాలి.", "ml": "എനിക്ക് കാപ്പി വേണം.", "kn": "ನನಗೆ ಕಾಫಿ ಬೇಕು."
        }
    ),

    # Health & Body
    "hb_1": PhraseTranslation(
        phrase_id="hb_1", category_id="health_body", english="I have a headache.",
        translations={
            "en": "I have a headache.", "ta": "எனக்கு தலை வலிக்கிறது.", "hi": "मेरे सिर में दर्द है।",
            "te": "నాకు తలనొప్పిగా ఉంది.", "ml": "എനിക്ക് തലവേദനയുണ്ട്.", "kn": "ನನಗೆ ತಲೆನೋವಿದೆ."
        }
    ),
    "hb_2": PhraseTranslation(
        phrase_id="hb_2", category_id="health_body", english="My stomach hurts.",
        translations={
            "en": "My stomach hurts.", "ta": "எனக்கு வயிறு வலிக்கிறது.", "hi": "मेरे पेट में दर्द हो रहा है।",
            "te": "నా కడుపు నొప్పిగా ఉంది.", "ml": "എനിക്ക് വയറുവേദനയുണ്ട്.", "kn": "ನನ್ನ ಹೊಟ್ಟೆ ನೋಯುತ್ತಿದೆ."
        }
    ),
    "hb_3": PhraseTranslation(
        phrase_id="hb_3", category_id="health_body", english="I have pain.",
        translations={
            "en": "I have pain.", "ta": "எனக்கு வலிக்கிறது.", "hi": "मुझे दर्द हो रहा है।",
            "te": "నాకు నొప్పిగా ఉంది.", "ml": "എനിക്ക് വേദനയുണ്ട്.", "kn": "ನನಗೆ ನೋವಾಗುತ್ತಿದೆ."
        }
    ),
    "hb_4": PhraseTranslation(
        phrase_id="hb_4", category_id="health_body", english="I feel dizzy.",
        translations={
            "en": "I feel dizzy.", "ta": "எனக்கு தலை சுற்றுகிறது.", "hi": "मुझे चक्कर आ रहे हैं।",
            "te": "నాకు తలతిరుగుతోంది.", "ml": "എനിക്ക് തലകറക്കം തോന്നുന്നു.", "kn": "ನನಗೆ ತಲೆತಿರುಗುತ್ತಿದೆ."
        }
    ),
    "hb_5": PhraseTranslation(
        phrase_id="hb_5", category_id="health_body", english="I feel sick.",
        translations={
            "en": "I feel sick.", "ta": "எனக்கு உடல்நிலை சரியில்லை.", "hi": "मेरी तबीयत ठीक नहीं लग रही है।",
            "te": "నాకు ఒంట్లో బాగాలేదు.", "ml": "എനിക്ക് അസുഖം തോന്നുന്നു.", "kn": "ನನಗೆ ಆರಾಮವಿಲ್ಲ."
        }
    ),
    "hb_6": PhraseTranslation(
        phrase_id="hb_6", category_id="health_body", english="I need medicine.",
        translations={
            "en": "I need medicine.", "ta": "எனக்கு மருந்து வேண்டும்.", "hi": "मुझे दवाई चाहिए।",
            "te": "నాకు మందులు కావాలి.", "ml": "എനിക്ക് മരുന്ന് വേണം.", "kn": "ನನಗೆ ಔಷಧಿ ಬೇಕು."
        }
    ),
    "hb_7": PhraseTranslation(
        phrase_id="hb_7", category_id="health_body", english="I need a doctor.",
        translations={
            "en": "I need a doctor.", "ta": "எனக்கு மருத்துவர் வேண்டும்.", "hi": "मुझे डॉक्टर चाहिए।",
            "te": "నాకు డాక్టర్ కావాలి.", "ml": "എനിക്ക് ഡോക്ടറെ കാണണം.", "kn": "ನನಗೆ ವೈದ್ಯರು ಬೇಕು."
        }
    ),
    "hb_8": PhraseTranslation(
        phrase_id="hb_8", category_id="health_body", english="I need to rest.",
        translations={
            "en": "I need to rest.", "ta": "நான் ஓய்வெடுக்க வேண்டும்.", "hi": "मुझे आराम करने की ज़रूरत है।",
            "te": "నేను విశ్రాంతి తీసుకోవాలి.", "ml": "എനിക്ക് വിശ്രമിക്കണം.", "kn": "ನಾನು ವಿಶ್ರಾಂತಿ ಪಡೆಯಬೇಕು."
        }
    ),

    # Emotions
    "em_1": PhraseTranslation(
        phrase_id="em_1", category_id="emotions", english="I am happy.",
        translations={
            "en": "I am happy.", "ta": "நான் மகிழ்ச்சியாக இருக்கிறேன்.", "hi": "मैं खुश हूँ।",
            "te": "నేను సంతోషంగా ఉన్నాను.", "ml": "ഞാൻ സന്തോഷവാനാണ്.", "kn": "ನಾನು ಸಂತೋಷವಾಗಿದ್ದೇನೆ."
        }
    ),
    "em_2": PhraseTranslation(
        phrase_id="em_2", category_id="emotions", english="I am sad.",
        translations={
            "en": "I am sad.", "ta": "நான் வருத்தமாக இருக்கிறேன்.", "hi": "मैं उदास हूँ।",
            "te": "నేను బాధపడుతున్నాను.", "ml": "ഞാൻ സങ്കടത്തിലാണ്.", "kn": "ನಾನು ದುಃಖಿತನಾಗಿದ್ದೇನೆ."
        }
    ),
    "em_3": PhraseTranslation(
        phrase_id="em_3", category_id="emotions", english="I am scared.",
        translations={
            "en": "I am scared.", "ta": "எனக்கு பயமாக இருக்கிறது.", "hi": "मुझे डर लग रहा है।",
            "te": "నాకు భయంగా ఉంది.", "ml": "എനിക്ക് ഭയമാകുന്നു.", "kn": "ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ."
        }
    ),
    "em_4": PhraseTranslation(
        phrase_id="em_4", category_id="emotions", english="I am angry.",
        translations={
            "en": "I am angry.", "ta": "எனக்கு கோபமாக இருக்கிறது.", "hi": "मुझे गुस्सा आ रहा है।",
            "te": "నాకు కోపంగా ఉంది.", "ml": "എനിക്ക് ദേഷ്യമുണ്ട്.", "kn": "ನನಗೆ ಕೋಪ ಬಂದಿದೆ."
        }
    ),
    "em_5": PhraseTranslation(
        phrase_id="em_5", category_id="emotions", english="I am uncomfortable.",
        translations={
            "en": "I am uncomfortable.", "ta": "எனக்கு அசௌகரியமாக இருக்கிறது.", "hi": "मुझे असहज महसूस हो रहा है।",
            "te": "నాకు అసౌకర్యంగా ఉంది.", "ml": "എനിക്ക് അസ്വസ്ഥത തോന്നുന്നു.", "kn": "ನನಗೆ ಅಸೌಕರ್ಯವಾಗಿದೆ."
        }
    ),
    "em_6": PhraseTranslation(
        phrase_id="em_6", category_id="emotions", english="I feel lonely.",
        translations={
            "en": "I feel lonely.", "ta": "நான் தனிமையாக உணர்கிறேன்.", "hi": "मुझे अकेलापन लग रहा है।",
            "te": "నాకు ఒంటరిగా అనిపిస్తోంది.", "ml": "എനിക്ക് ഏകാന്തത തോന്നുന്നു.", "kn": "ನನಗೆ ಒಂಟಿತನ ಕಾಡುತ್ತಿದೆ."
        }
    ),
    "em_7": PhraseTranslation(
        phrase_id="em_7", category_id="emotions", english="I am tired.",
        translations={
            "en": "I am tired.", "ta": "எனக்கு சோர்வாக இருக்கிறது.", "hi": "मैं थक गया/गई हूँ।",
            "te": "నేను అలసిపోయాను.", "ml": "എനിക്ക് ക്ഷീണം തോന്നുന്നു.", "kn": "ನನಗೆ ಸುಸ್ತಾಗಿದೆ."
        }
    ),

    # Daily Needs
    "dn_1": PhraseTranslation(
        phrase_id="dn_1", category_id="daily_needs", english="I need the bathroom.",
        translations={
            "en": "I need the bathroom.", "ta": "நான் கழிப்பறைக்கு செல்ல வேண்டும்.", "hi": "मुझे शौचालय जाना है।",
            "te": "నేను బాత్రూమ్‌కి వెళ్లాలి.", "ml": "എനിക്ക് ബാത്ത്റൂമിൽ പോകണം.", "kn": "ನಾನು ವಾಶ್‌ರೂಮ್‌ಗೆ ಹೋಗಬೇಕು."
        }
    ),
    "dn_2": PhraseTranslation(
        phrase_id="dn_2", category_id="daily_needs", english="I want to sleep.",
        translations={
            "en": "I want to sleep.", "ta": "நான் தூங்க விரும்புகிறேன்.", "hi": "मुझे सोना है।",
            "te": "నేను నిద్రపోవాలి.", "ml": "എനിക്ക് ഉറങ്ങണം.", "kn": "ನಾನು ಮಲಗಬೇಕು."
        }
    ),
    "dn_3": PhraseTranslation(
        phrase_id="dn_3", category_id="daily_needs", english="I want to go outside.",
        translations={
            "en": "I want to go outside.", "ta": "நான் வெளியே செல்ல விரும்புகிறேன்.", "hi": "मुझे बाहर जाना है।",
            "te": "నేను బయటికి వెళ్లాలనుకుంటున్నాను.", "ml": "എനിക്ക് പുറത്തു പോകണം.", "kn": "ನಾನು ಹೊರಗೆ ಹೋಗಲು ಬಯಸುತ್ತೇನೆ."
        }
    ),
    "dn_4": PhraseTranslation(
        phrase_id="dn_4", category_id="daily_needs", english="Please help me.",
        translations={
            "en": "Please help me.", "ta": "தயவுசெய்து எனக்கு உதவுங்கள்.", "hi": "कृपया मेरी मदद कीजिए।",
            "te": "దయచేసి నాకు సహాయం చేయండి.", "ml": "ദയവായി എന്നെ സഹായിക്കൂ.", "kn": "ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ."
        }
    ),
    "dn_5": PhraseTranslation(
        phrase_id="dn_5", category_id="daily_needs", english="I want to sit down.",
        translations={
            "en": "I want to sit down.", "ta": "நான் உட்கார விரும்புகிறேன்.", "hi": "मैं बैठना चाहता हूँ।",
            "te": "నేను కూర్చోవాలనుకుంటున్నాను.", "ml": "എനിക്ക് ഇരിക്കണം.", "kn": "ನಾನು ಕುಳಿತುಕೊಳ್ಳಲು ಬಯಸುತ್ತೇನೆ."
        }
    ),
    "dn_6": PhraseTranslation(
        phrase_id="dn_6", category_id="daily_needs", english="I want to stand up.",
        translations={
            "en": "I want to stand up.", "ta": "நான் எழுந்து நிற்க விரும்புகிறேன்.", "hi": "मैं खड़ा होना चाहता हूँ।",
            "te": "నేను నిలబడాలనుకుంటున్నాను.", "ml": "എനിക്ക് എഴുന്നേൽക്കണം.", "kn": "ನಾನು ಎದ್ದು ನಿಲ್ಲಲು ಬಯಸುತ್ತೇನೆ."
        }
    ),
    "dn_7": PhraseTranslation(
        phrase_id="dn_7", category_id="daily_needs", english="I need my family.",
        translations={
            "en": "I need my family.", "ta": "என் குடும்பத்தினர் எனக்கு வேண்டும்.", "hi": "मुझे मेरे परिवार की ज़रूरत है।",
            "te": "నాకు నా కుటుంబం కావాలి.", "ml": "എനിക്ക് എന്റെ കുടുംബത്തെ വേണം.", "kn": "ನನಗೆ ನನ್ನ ಕುಟುಂಬ ಬೇಕು."
        }
    ),

    # People
    "pe_1": PhraseTranslation(
        phrase_id="pe_1", category_id="people", english="Mother.",
        translations={
            "en": "Mother.", "ta": "அம்மா.", "hi": "माँ।",
            "te": "అమ్మ.", "ml": "അമ്മ.", "kn": "ಅಮ್ಮ."
        }
    ),
    "pe_2": PhraseTranslation(
        phrase_id="pe_2", category_id="people", english="Father.",
        translations={
            "en": "Father.", "ta": "அப்பா.", "hi": "पिताजी।",
            "te": "నాన్న.", "ml": "അച്ഛൻ.", "kn": "ಅಪ್ಪ."
        }
    ),
    "pe_3": PhraseTranslation(
        phrase_id="pe_3", category_id="people", english="Brother.",
        translations={
            "en": "Brother.", "ta": "சகோதரன்.", "hi": "भाई।",
            "te": "సోదరుడు.", "ml": "സഹോദരൻ.", "kn": "ಸಹೋದರ."
        }
    ),
    "pe_4": PhraseTranslation(
        phrase_id="pe_4", category_id="people", english="Sister.",
        translations={
            "en": "Sister.", "ta": "சகோதரி.", "hi": "बहन।",
            "te": "సోదరి.", "ml": "സഹോദരി.", "kn": "ಸಹೋದರಿ."
        }
    ),
    "pe_5": PhraseTranslation(
        phrase_id="pe_5", category_id="people", english="Doctor.",
        translations={
            "en": "Doctor.", "ta": "மருத்துவர்.", "hi": "डॉक्टर।",
            "te": "డాక్టర్.", "ml": "ഡോക്ടർ.", "kn": "ವೈದ್ಯರು."
        }
    ),
    "pe_6": PhraseTranslation(
        phrase_id="pe_6", category_id="people", english="Caregiver.",
        translations={
            "en": "Caregiver.", "ta": "பராமரிப்பாளர்.", "hi": "देखभालकर्ता।",
            "te": "సంరక్షకుడు.", "ml": "പരിചാരകൻ.", "kn": "ಆರೈಕೆದಾರರು."
        }
    ),
    "pe_7": PhraseTranslation(
        phrase_id="pe_7", category_id="people", english="Friend.",
        translations={
            "en": "Friend.", "ta": "நண்பர்.", "hi": "दोस्त।",
            "te": "స్నేహితుడు.", "ml": "സുഹൃത്ത്.", "kn": "ಸ್ನೇಹಿತ."
        }
    ),

    # Emergency
    "emg_1": PhraseTranslation(
        phrase_id="emg_1", category_id="emergency", english="Help me.",
        translations={
            "en": "Help me.", "ta": "எனக்கு உதவுங்கள்.", "hi": "मेरी मदद कीजिए।",
            "te": "నాకు సహాయం చేయండి.", "ml": "എന്നെ സഹായിക്കൂ.", "kn": "ನನಗೆ ಸಹಾಯ ಮಾಡಿ."
        }
    ),
    "emg_2": PhraseTranslation(
        phrase_id="emg_2", category_id="emergency", english="Call my family.",
        translations={
            "en": "Call my family.", "ta": "என் குடும்பத்தினரை அழைக்கவும்.", "hi": "मेरे परिवार को बुलाइए।",
            "te": "నా కుటుంబానికి కాల్ చేయండి.", "ml": "എന്റെ കുടുംബത്തെ വിളിക്കൂ.", "kn": "ನನ್ನ ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ."
        }
    ),
    "emg_3": PhraseTranslation(
        phrase_id="emg_3", category_id="emergency", english="Call a doctor.",
        translations={
            "en": "Call a doctor.", "ta": "மருத்துவரை அழைக்கவும்.", "hi": "डॉक्टर को बुलाइए।",
            "te": "డాక్టర్‌ని పిలవండి.", "ml": "ഡോക്ടറെ വിളിക്കൂ.", "kn": "ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ."
        }
    ),
    "emg_4": PhraseTranslation(
        phrase_id="emg_4", category_id="emergency", english="I am in pain.",
        translations={
            "en": "I am in pain.", "ta": "எனக்கு வலிக்கிறது.", "hi": "मुझे बहुत दर्द हो रहा है।",
            "te": "నాకు చాలా నొప్పిగా ఉంది.", "ml": "എനിക്ക് കഠിനമായ വേദനയുണ്ട്.", "kn": "ನನಗೆ ತೀವ್ರ ನೋವಾಗುತ್ತಿದೆ."
        }
    ),
    "emg_5": PhraseTranslation(
        phrase_id="emg_5", category_id="emergency", english="I need urgent help.",
        translations={
            "en": "I need urgent help.", "ta": "எனக்கு அவசர உதவி தேவை.", "hi": "मुझे तत्काल मदद चाहिए।",
            "te": "నాకు అత్యవసర సహాయం కావాలి.", "ml": "എനിക്ക് അടിയന്തിര സഹായം വേണം.", "kn": "ನನಗೆ ತುರ್ತು ಸಹಾಯ ಬೇಕು."
        }
    ),
}

@router.get("/languages", response_model=List[LanguageInfo])
async def get_supported_languages():
    """Retrieve list of supported languages with codes and native scripts."""
    return SUPPORTED_LANGUAGES

@router.get("/translations/{phrase_id}", response_model=PhraseTranslation)
async def get_phrase_translation(phrase_id: str):
    """Retrieve all regional translations for a given phrase ID."""
    if phrase_id not in TRANSLATIONS_DATABASE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Phrase translation not found for id '{phrase_id}'."
        )
    return TRANSLATIONS_DATABASE[phrase_id]
