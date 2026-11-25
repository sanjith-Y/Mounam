"""
Dashboard and Communication Phrases Endpoints for MOUNAM.
Provides structured categories and standard phrases with regional translations.
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from app.models.dashboard import DashboardResponse, PhraseItem, CategorySummary

router = APIRouter(tags=["Dashboard"])

STANDARD_PHRASES: List[PhraseItem] = [
    # Card 1: I Need Something / Food & Water
    PhraseItem(
        id="water",
        category="food_water",
        label="I need water",
        sentence="I need water.",
        icon="💧",
        regional_translations={
            "ta": "எனக்கு தண்ணீர் வேண்டும்.",
            "hi": "मुझे पानी चाहिए।",
            "ml": "എനിക്ക് വെള്ളം വേണം.",
            "te": "నాకు నీళ్లు కావాలి.",
            "kn": "ನನಗೆ ನೀರು ಬೇಕು."
        }
    ),
    PhraseItem(
        id="hungry",
        category="food_water",
        label="I am hungry",
        sentence="I am hungry.",
        icon="🍽️",
        regional_translations={
            "ta": "எனக்கு பசிக்கிறது.",
            "hi": "मुझे भूख लगी है।",
            "ml": "എനിക്ക് വിശക്കുന്നു.",
            "te": "నాకు ఆకలిగా ఉంది.",
            "kn": "ನನಗೆ ಹಸಿವಾಗಿದೆ."
        }
    ),
    PhraseItem(
        id="food",
        category="food_water",
        label="I need food",
        sentence="I need food.",
        icon="🍲",
        regional_translations={
            "ta": "எனக்கு உணவு வேண்டும்.",
            "hi": "मुझे खाना चाहिए।",
            "ml": "എനിക്ക് ഭക്ഷണം വേണം.",
            "te": "నాకు ఆహారం కావాలి.",
            "kn": "ನನಗೆ ಊಟ ಬೇಕು."
        }
    ),
    PhraseItem(
        id="medicine",
        category="food_water",
        label="I need medicine",
        sentence="I need medicine.",
        icon="💊",
        regional_translations={
            "ta": "எனக்கு மருந்து வேண்டும்.",
            "hi": "मुझे दवाई चाहिए।",
            "ml": "എനിക്ക് മരുന്ന് വേണം.",
            "te": "నాకు మందులు కావాలి.",
            "kn": "ನನಗೆ ಔಷಧಿ ಬೇಕು."
        }
    ),

    # Card 2: My Feelings / Emotions
    PhraseItem(
        id="happy",
        category="emotions",
        label="I am happy",
        sentence="I am happy.",
        icon="😊",
        regional_translations={
            "ta": "நான் மகிழ்ச்சியாக இருக்கிறேன்.",
            "hi": "मैं खुश हूँ।",
            "ml": "ഞാൻ സന്തോഷവാനാണ്.",
            "te": "నేను సంతోషంగా ఉన్నాను.",
            "kn": "ನಾನು ಸಂತೋಷವಾಗಿದ್ದೇನೆ."
        }
    ),
    PhraseItem(
        id="sad",
        category="emotions",
        label="I am sad",
        sentence="I am sad.",
        icon="😢",
        regional_translations={
            "ta": "நான் வருத்தமாக இருக்கிறேன்.",
            "hi": "मैं उदास हूँ।",
            "ml": "ഞാൻ സങ്കടത്തിലാണ്.",
            "te": "నేను బాధపడుతున్నాను.",
            "kn": "ನಾನು ದುಃಖಿತನಾಗಿದ್ದೇನೆ."
        }
    ),
    PhraseItem(
        id="uncomfortable",
        category="emotions",
        label="I am uncomfortable",
        sentence="I am uncomfortable.",
        icon="😣",
        regional_translations={
            "ta": "எனக்கு வசதியாக இல்லை.",
            "hi": "मुझे असहज लग रहा है।",
            "ml": "എനിക്ക് അസ്വസ്ഥത തോന്നുന്നു.",
            "te": "నాకు అసౌకర్యంగా ఉంది.",
            "kn": "ನನಗೆ ಅಸೌಕರ್ಯವಾಗಿದೆ."
        }
    ),
    PhraseItem(
        id="scared",
        category="emotions",
        label="I am scared",
        sentence="I am scared.",
        icon="😨",
        regional_translations={
            "ta": "எனக்கு பயமாக இருக்கிறது.",
            "hi": "मुझे डर लग रहा है।",
            "ml": "എനിക്ക് ഭയമാകുന്നു.",
            "te": "నాకు భయంగా ఉంది.",
            "kn": "ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ."
        }
    ),

    # Card 3: My Health
    PhraseItem(
        id="pain",
        category="health",
        label="I am feeling pain",
        sentence="I am feeling pain.",
        icon="⚡",
        regional_translations={
            "ta": "எனக்கு வலி இருக்கிறது.",
            "hi": "मुझे दर्द हो रहा है।",
            "ml": "എനിക്ക് വേദനയുണ്ട്.",
            "te": "నాకు నొప్పిగా ఉంది.",
            "kn": "ನನಗೆ ನೋವಾಗುತ್ತಿದೆ."
        }
    ),
    PhraseItem(
        id="medical_help",
        category="health",
        label="I need medical help",
        sentence="I need medical help.",
        icon="👨‍⚕️",
        regional_translations={
            "ta": "எனக்கு மருத்துவ உதவி தேவை.",
            "hi": "मुझे चिकित्सा सहायता चाहिए।",
            "ml": "എനിക്ക് വൈദ്യസഹായം വേണം.",
            "te": "నాకు వైద్య సహాయం కావాలి.",
            "kn": "ನನಗೆ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಬೇಕು."
        }
    ),
    PhraseItem(
        id="dizzy",
        category="health",
        label="I feel dizzy",
        sentence="I feel dizzy.",
        icon="💫",
        regional_translations={
            "ta": "எனக்கு தலை சுற்றுகிறது.",
            "hi": "मुझे चक्कर आ रहा है।",
            "ml": "എനിക്ക് തലകറക്കം തോന്നുന്നു.",
            "te": "నాకు తలతిరుగుతోంది.",
            "kn": "ನನಗೆ ತಲೆತಿರುಗುತ್ತಿದೆ."
        }
    ),
    PhraseItem(
        id="rest",
        category="health",
        label="I need to rest",
        sentence="I need to rest.",
        icon="🛌",
        regional_translations={
            "ta": "நான் ஓய்வெடுக்க வேண்டும்.",
            "hi": "मुझे आराम करना है।",
            "ml": "എനിക്ക് വിശ്രമിക്കണം.",
            "te": "నేను విశ్రాంతి తీసుకోవాలి.",
            "kn": "ನಾನು ವಿಶ್ರಾಂತಿ ಪಡೆಯಬೇಕು."
        }
    ),

    # Card 4: Daily Needs / Daily Activities
    PhraseItem(
        id="bathroom",
        category="daily_activities",
        label="I need to use the bathroom",
        sentence="I need to use the bathroom.",
        icon="🚻",
        regional_translations={
            "ta": "நான் கழிப்பறைக்கு செல்ல வேண்டும்.",
            "hi": "मुझे वॉशरूम जाना है।",
            "ml": "എനിക്ക് ബാത്ത്റൂമിൽ പോകണം.",
            "te": "నేను బాత్రూమ్‌కి వెళ్లాలి.",
            "kn": "ನಾನು ವಾಶ್‌ರೂಮ್‌ಗೆ ಹೋಗಬೇಕು."
        }
    ),
    PhraseItem(
        id="sleep",
        category="daily_activities",
        label="I want to sleep",
        sentence="I want to sleep.",
        icon="😴",
        regional_translations={
            "ta": "நான் தூங்க வேண்டும்.",
            "hi": "मुझे सोना है।",
            "ml": "എനിക്ക് ഉറങ്ങണം.",
            "te": "నేను పడుకోవాలి.",
            "kn": "ನಾನು ಮಲಗಬೇಕು."
        }
    ),
    PhraseItem(
        id="help",
        category="daily_activities",
        label="I need help",
        sentence="I need help.",
        icon="🆘",
        regional_translations={
            "ta": "எனக்கு உதவி தேவை.",
            "hi": "मुझे मदद चाहिए।",
            "ml": "എനിക്ക് സഹായം വേണം.",
            "te": "నాకు సహాయం కావాలి.",
            "kn": "ನನಗೆ ಸಹಾಯ ಬೇಕು."
        }
    ),
    PhraseItem(
        id="outside",
        category="daily_activities",
        label="I want to go outside",
        sentence="I want to go outside.",
        icon="🌳",
        regional_translations={
            "ta": "நான் வெளியே செல்ல விரும்புகிறேன்.",
            "hi": "मुझे बाहर जाना है।",
            "ml": "എനിക്ക് പുറത്തു പോകണം.",
            "te": "నేను బయటికి వెళ్లాలనుకుంటున్నాను.",
            "kn": "ನಾನು ಹೊರಗೆ ಹೋಗಲು ಬಯಸುತ್ತೇನೆ."
        }
    ),

    # Card 5: Emergency
    PhraseItem(
        id="emergency_help",
        category="emergency",
        label="Please help me",
        sentence="Please help me.",
        icon="🚨",
        is_emergency=True,
        regional_translations={
            "ta": "தயவுசெய்து எனக்கு உதவுங்கள்.",
            "hi": "कृपया मेरी मदद कीजिए।",
            "ml": "ദയവായി എന്നെ സഹായിക്കൂ.",
            "te": "దయచేసి నాకు సహాయం చేయండి.",
            "kn": "ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ."
        }
    ),
    PhraseItem(
        id="call_family",
        category="emergency",
        label="Call my family",
        sentence="Call my family.",
        icon="📞",
        is_emergency=True,
        regional_translations={
            "ta": "என் குடும்பத்தை அழைக்கவும்.",
            "hi": "मेरे परिवार को बुलाइए।",
            "ml": "എന്റെ കുടുംബത്തെ വിളിക്കൂ.",
            "te": "నా కుటుంబానికి కాల్ చేయండి.",
            "kn": "ನನ್ನ ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ."
        }
    ),
    PhraseItem(
        id="urgent_medical",
        category="emergency",
        label="I need urgent medical assistance",
        sentence="I need urgent medical assistance.",
        icon="🏥",
        is_emergency=True,
        regional_translations={
            "ta": "எனக்கு அவசர மருத்துவ உதவி தேவை.",
            "hi": "मुझे तत्काल चिकित्सा सहायता चाहिए।",
            "ml": "എനിക്ക് അടിയന്തിര വൈദ്യസഹായം വേണം.",
            "te": "నాకు అత్యవసర వైద్య సహాయం కావాలి.",
            "kn": "ನನಗೆ ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ಬೇಕು."
        }
    ),

    # Category: Family & Social
    PhraseItem(
        id="family_talk",
        category="family",
        label="I want to talk with family",
        sentence="I want to talk with my family.",
        icon="👨‍👩‍👧",
        regional_translations={
            "ta": "நான் என் குடும்பத்துடன் பேச விரும்புகிறேன்.",
            "hi": "मैं अपने परिवार से बात करना चाहता हूँ।",
            "ml": "എനിക്ക് കുടുംബവുമായി സംസാരിക്കണം.",
            "te": "నేను నా కుటుంబంతో మాట్లాడాలనుకుంటున్నాను.",
            "kn": "ನಾನು ನನ್ನ ಕುಟುಂಬದೊಂದಿಗೆ ಮಾತನಾಡಲು ಬಯಸುತ್ತೇನೆ."
        }
    ),
    PhraseItem(
        id="thank_you",
        category="family",
        label="Thank you",
        sentence="Thank you very much.",
        icon="🙏",
        regional_translations={
            "ta": "மிக்க நன்றி.",
            "hi": "बहुत-बहुत धन्यवाद।",
            "ml": "വളരെ നന്ദി.",
            "te": "చాలా ధన్యవాదాలు.",
            "kn": "ತುಂಬಾ ಧನ್ಯವಾದಗಳು."
        }
    ),
]

CATEGORIES: List[CategorySummary] = [
    CategorySummary(
        id="food_water",
        name="I Need Something",
        description="Water, food, meals, and routine medicines",
        icon="💧",
        phrase_count=4
    ),
    CategorySummary(
        id="emotions",
        name="My Feelings",
        description="Happy, sad, uncomfortable, scared, or calm",
        icon="😊",
        phrase_count=4
    ),
    CategorySummary(
        id="health",
        name="My Health",
        description="Pain, medical assistance, dizziness, and rest",
        icon="⚡",
        phrase_count=4
    ),
    CategorySummary(
        id="daily_activities",
        name="Daily Needs",
        description="Bathroom, sleep, general help, and outside air",
        icon="🚻",
        phrase_count=4
    ),
    CategorySummary(
        id="emergency",
        name="Emergency",
        description="High-priority distress alerts and urgent family calls",
        icon="🚨",
        phrase_count=3
    ),
    CategorySummary(
        id="custom",
        name="Custom Message",
        description="Enter and speak your own text directly",
        icon="✍️",
        phrase_count=0
    ),
]

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_summary():
    """Returns overview of dashboard capabilities, active categories, and accessibility modes."""
    return DashboardResponse(
        status="active",
        platform_name="MOUNAM",
        tagline="Every Voice Deserves to Be Heard.",
        active_profile={
            "user_name": "Valued User",
            "user_type": "individual",
            "preferred_language": "en"
        },
        categories=CATEGORIES,
        simple_mode_available=True,
        offline_support=True,
        voice_engine="Web Speech API (Client-side)"
    )

@router.get("/phrases", response_model=List[PhraseItem])
async def get_phrases(
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """Returns accessible communication phrases with optional category and search filtering."""
    results = STANDARD_PHRASES
    if category and isinstance(category, str):
        results = [p for p in results if p.category == category]
    if search and isinstance(search, str):
        q = search.lower().strip()
        results = [
            p for p in results
            if q in p.label.lower() or q in p.sentence.lower()
        ]
    return results
