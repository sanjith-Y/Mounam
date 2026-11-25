"""Language and Translation models for MOUNAM."""

from typing import Dict, List, Optional
from pydantic import BaseModel

class LanguageInfo(BaseModel):
    code: str
    name: str
    native_name: str
    locale: str
    flag: str
    is_supported: bool = True

class PhraseTranslation(BaseModel):
    phrase_id: str
    category_id: str
    english: str
    translations: Dict[str, str]
