"""Dashboard and Phrase Schemas for MOUNAM."""

from typing import List, Optional
from pydantic import BaseModel, Field

class PhraseItem(BaseModel):
    id: str
    category: str
    label: str
    sentence: str
    icon: str
    regional_translations: Optional[dict] = Field(default_factory=dict)
    is_emergency: bool = False

class CategorySummary(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    phrase_count: int

class DashboardResponse(BaseModel):
    status: str
    platform_name: str = "MOUNAM"
    tagline: str = "Every Voice Deserves to Be Heard."
    active_profile: dict
    categories: List[CategorySummary]
    simple_mode_available: bool = True
    offline_support: bool = True
    voice_engine: str = "Web Speech API (Client-side)"
