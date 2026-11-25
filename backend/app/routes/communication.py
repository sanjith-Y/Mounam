"""
Advanced Touch-Based Communication Routes for MOUNAM.
Provides categories, standard symbol phrases, and custom phrase handling.
"""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Query, status
from app.models.communication import (
    CommunicationCategory,
    CommunicationPhrase,
    CustomPhraseCreateRequest,
    CustomPhraseResponse,
)

router = APIRouter(prefix="/communication", tags=["Communication"])

COMMUNICATION_CATEGORIES: List[CommunicationCategory] = [
    CommunicationCategory(
        id="food_drink",
        name="Food & Drink",
        description="Hydration, meals, and warm/cold beverages",
        icon="🍽️",
        color_theme="blue"
    ),
    CommunicationCategory(
        id="health_body",
        name="Health & Body",
        description="Headache, pain, dizziness, nausea, and rest",
        icon="🩺",
        color_theme="rose"
    ),
    CommunicationCategory(
        id="emotions",
        name="Emotions",
        description="Feelings, mood, comfort, and emotional state",
        icon="😊",
        color_theme="amber"
    ),
    CommunicationCategory(
        id="daily_needs",
        name="Daily Needs",
        description="Bathroom, sleep, posture, and going outside",
        icon="🏠",
        color_theme="purple"
    ),
    CommunicationCategory(
        id="people",
        name="People",
        description="Family members, doctor, caregiver, and friends",
        icon="👥",
        color_theme="emerald"
    ),
    CommunicationCategory(
        id="emergency",
        name="Emergency",
        description="Urgent alerts, pain distress, and immediate help",
        icon="🚨",
        color_theme="red",
        is_emergency=True
    ),
]

PREDEFINED_PHRASES: List[CommunicationPhrase] = [
    # A. FOOD & DRINK
    CommunicationPhrase(id="fd_1", category_id="food_drink", label="I want water", sentence="I want water.", icon="💧", tokens=["I", "Want", "Water"]),
    CommunicationPhrase(id="fd_2", category_id="food_drink", label="I want food", sentence="I want food.", icon="🍲", tokens=["I", "Want", "Food"]),
    CommunicationPhrase(id="fd_3", category_id="food_drink", label="I am hungry", sentence="I am hungry.", icon="🍽️", tokens=["I", "Am", "Hungry"]),
    CommunicationPhrase(id="fd_4", category_id="food_drink", label="I am thirsty", sentence="I am thirsty.", icon="🥤", tokens=["I", "Am", "Thirsty"]),
    CommunicationPhrase(id="fd_5", category_id="food_drink", label="I want milk", sentence="I want milk.", icon="🥛", tokens=["I", "Want", "Milk"]),
    CommunicationPhrase(id="fd_6", category_id="food_drink", label="I want juice", sentence="I want juice.", icon="🧃", tokens=["I", "Want", "Juice"]),
    CommunicationPhrase(id="fd_7", category_id="food_drink", label="I want tea", sentence="I want tea.", icon="☕", tokens=["I", "Want", "Tea"]),
    CommunicationPhrase(id="fd_8", category_id="food_drink", label="I want coffee", sentence="I want coffee.", icon="☕", tokens=["I", "Want", "Coffee"]),

    # B. HEALTH & BODY
    CommunicationPhrase(id="hb_1", category_id="health_body", label="I have a headache", sentence="I have a headache.", icon="🤕", tokens=["I", "Have", "Pain", "In", "My Head"]),
    CommunicationPhrase(id="hb_2", category_id="health_body", label="My stomach hurts", sentence="My stomach hurts.", icon="🤢", tokens=["I", "Have", "Pain", "In", "My Stomach"]),
    CommunicationPhrase(id="hb_3", category_id="health_body", label="I have pain", sentence="I have pain.", icon="⚡", tokens=["I", "Have", "Pain"]),
    CommunicationPhrase(id="hb_4", category_id="health_body", label="I feel dizzy", sentence="I feel dizzy.", icon="💫", tokens=["I", "Feel", "Dizzy"]),
    CommunicationPhrase(id="hb_5", category_id="health_body", label="I feel sick", sentence="I feel sick.", icon="🤒", tokens=["I", "Feel", "Sick"]),
    CommunicationPhrase(id="hb_6", category_id="health_body", label="I need medicine", sentence="I need medicine.", icon="💊", tokens=["I", "Need", "Medicine"]),
    CommunicationPhrase(id="hb_7", category_id="health_body", label="I need a doctor", sentence="I need a doctor.", icon="👨‍⚕️", tokens=["I", "Need", "Doctor"]),
    CommunicationPhrase(id="hb_8", category_id="health_body", label="I need to rest", sentence="I need to rest.", icon="🛌", tokens=["I", "Need", "Rest"]),

    # C. EMOTIONS
    CommunicationPhrase(id="em_1", category_id="emotions", label="I am happy", sentence="I am happy.", icon="😊", tokens=["I", "Am", "Happy"]),
    CommunicationPhrase(id="em_2", category_id="emotions", label="I am sad", sentence="I am sad.", icon="😢", tokens=["I", "Am", "Sad"]),
    CommunicationPhrase(id="em_3", category_id="emotions", label="I am scared", sentence="I am scared.", icon="😨", tokens=["I", "Am", "Scared"]),
    CommunicationPhrase(id="em_4", category_id="emotions", label="I am angry", sentence="I am angry.", icon="😠", tokens=["I", "Am", "Angry"]),
    CommunicationPhrase(id="em_5", category_id="emotions", label="I am uncomfortable", sentence="I am uncomfortable.", icon="😣", tokens=["I", "Am", "Uncomfortable"]),
    CommunicationPhrase(id="em_6", category_id="emotions", label="I feel lonely", sentence="I feel lonely.", icon="🥺", tokens=["I", "Feel", "Lonely"]),
    CommunicationPhrase(id="em_7", category_id="emotions", label="I am tired", sentence="I am tired.", icon="🥱", tokens=["I", "Am", "Tired"]),

    # D. DAILY NEEDS
    CommunicationPhrase(id="dn_1", category_id="daily_needs", label="I need the bathroom", sentence="I need the bathroom.", icon="🚻", tokens=["I", "Need", "Bathroom"]),
    CommunicationPhrase(id="dn_2", category_id="daily_needs", label="I want to sleep", sentence="I want to sleep.", icon="😴", tokens=["I", "Want", "Sleep"]),
    CommunicationPhrase(id="dn_3", category_id="daily_needs", label="I want to go outside", sentence="I want to go outside.", icon="🌳", tokens=["I", "Want", "Outside"]),
    CommunicationPhrase(id="dn_4", category_id="daily_needs", label="Please help me", sentence="Please help me.", icon="🆘", tokens=["Please", "Help", "Me"]),
    CommunicationPhrase(id="dn_5", category_id="daily_needs", label="I want to sit down", sentence="I want to sit down.", icon="🪑", tokens=["I", "Want", "Sit Down"]),
    CommunicationPhrase(id="dn_6", category_id="daily_needs", label="I want to stand up", sentence="I want to stand up.", icon="🧍", tokens=["I", "Want", "Stand Up"]),
    CommunicationPhrase(id="dn_7", category_id="daily_needs", label="I need my family", sentence="I need my family.", icon="👨‍👩‍👧", tokens=["I", "Need", "Family"]),

    # E. PEOPLE
    CommunicationPhrase(id="pe_1", category_id="people", label="Mother", sentence="Mother.", icon="👩", tokens=["Mother"]),
    CommunicationPhrase(id="pe_2", category_id="people", label="Father", sentence="Father.", icon="👨", tokens=["Father"]),
    CommunicationPhrase(id="pe_3", category_id="people", label="Brother", sentence="Brother.", icon="👦", tokens=["Brother"]),
    CommunicationPhrase(id="pe_4", category_id="people", label="Sister", sentence="Sister.", icon="👧", tokens=["Sister"]),
    CommunicationPhrase(id="pe_5", category_id="people", label="Doctor", sentence="Doctor.", icon="🩺", tokens=["Doctor"]),
    CommunicationPhrase(id="pe_6", category_id="people", label="Caregiver", sentence="Caregiver.", icon="🤝", tokens=["Caregiver"]),
    CommunicationPhrase(id="pe_7", category_id="people", label="Friend", sentence="Friend.", icon="🧑‍🤝‍🧑", tokens=["Friend"]),

    # F. EMERGENCY
    CommunicationPhrase(id="emg_1", category_id="emergency", label="Help me", sentence="Help me.", icon="🚨", is_emergency=True, tokens=["Help", "Me"]),
    CommunicationPhrase(id="emg_2", category_id="emergency", label="Call my family", sentence="Call my family.", icon="📞", is_emergency=True, tokens=["Call", "Family"]),
    CommunicationPhrase(id="emg_3", category_id="emergency", label="Call a doctor", sentence="Call a doctor.", icon="🏥", is_emergency=True, tokens=["Call", "Doctor"]),
    CommunicationPhrase(id="emg_4", category_id="emergency", label="I am in pain", sentence="I am in pain.", icon="⚡", is_emergency=True, tokens=["I", "Have", "Pain"]),
    CommunicationPhrase(id="emg_5", category_id="emergency", label="I need urgent help", sentence="I need urgent help.", icon="🆘", is_emergency=True, tokens=["Need", "Urgent", "Help"]),
]

@router.get("/categories", response_model=List[CommunicationCategory])
async def get_categories():
    """Retrieve all available AAC communication categories."""
    return COMMUNICATION_CATEGORIES

@router.get("/phrases", response_model=List[CommunicationPhrase])
async def get_phrases(
    category_id: Optional[str] = None,
    search: Optional[str] = None
):
    """Retrieve touch communication symbol phrases with optional category and search filters."""
    results = PREDEFINED_PHRASES
    if category_id and isinstance(category_id, str):
        results = [p for p in results if p.category_id == category_id]
    if search and isinstance(search, str):
        q = search.lower().strip()
        results = [
            p for p in results
            if q in p.label.lower() or q in p.sentence.lower()
        ]
    return results

@router.post("/custom-phrase", response_model=CustomPhraseResponse, status_code=status.HTTP_201_CREATED)
async def create_custom_phrase(payload: CustomPhraseCreateRequest):
    """Create and validate a custom communication phrase."""
    new_phrase = CommunicationPhrase(
        id=f"custom_{uuid.uuid4().hex[:8]}",
        category_id=payload.category_id,
        label=payload.label,
        sentence=payload.sentence,
        icon=payload.icon,
        is_custom=True,
        tokens=[w for w in payload.sentence.replace(".", "").split() if w]
    )
    return CustomPhraseResponse(
        status="success",
        message="Custom communication phrase validated and prepared.",
        phrase=new_phrase
    )
