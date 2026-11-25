"""Communication models and schemas for MOUNAM touch-based AAC."""

from typing import List, Optional
from pydantic import BaseModel, Field

class CommunicationPhrase(BaseModel):
    id: str
    category_id: str
    label: str
    sentence: str
    icon: str
    is_emergency: bool = False
    is_custom: bool = False
    tokens: Optional[List[str]] = Field(default_factory=list)

class CommunicationCategory(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    color_theme: str
    is_emergency: bool = False

class CustomPhraseCreateRequest(BaseModel):
    label: str = Field(..., min_length=1, max_length=100)
    sentence: str = Field(..., min_length=1, max_length=250)
    category_id: str = Field(..., min_length=1)
    icon: str = Field(default="💬", min_length=1, max_length=10)

class CustomPhraseResponse(BaseModel):
    status: str
    message: str
    phrase: CommunicationPhrase
