"""
Pydantic models for Gemini AI integration.
"""

from __future__ import annotations

from typing import List, Literal

from pydantic import BaseModel, Field, validator

# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class SentenceGenerationRequest(BaseModel):
    """Request payload for generating a sentence from selected words.

    Attributes:
        selected_words: List of words or short tokens chosen by the user.
        language: ISO‑639‑1 language code (e.g. "en", "ta").
        context: Optional short description of the situation (e.g. "daily needs").
        style: Desired output style – simple, natural, or polite.
    """

    selected_words: List[str] = Field(
        ..., description="User‑selected words or tokens to incorporate into the sentence"
    )
    language: str = Field(..., description="Target language code (ISO‑639‑1)")
    context: str | None = Field(
        None, description="Optional context hint that may guide the AI generation"
    )
    style: Literal["simple", "natural", "polite"] = Field(
        "simple",
        description="Desired phrasing style",
    )

    @validator("selected_words")
    def words_must_not_be_empty(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("selected_words must contain at least one entry")
        return v

    @validator("language")
    def language_must_be_supported(cls, v: str) -> str:
        supported = {"en", "ta", "hi", "te", "ml", "kn"}
        if v not in supported:
            raise ValueError(
                f"Unsupported language '{v}'. Supported languages are: en, ta, hi, te, ml, kn"
            )
        return v


class TranslationRequest(BaseModel):
    """Request payload for translating a piece of text.

    Attributes:
        text: The source text to translate.
        source_language: ISO‑639‑1 code of the source language.
        target_language: ISO‑639‑1 code of the desired language.
    """

    text: str = Field(..., min_length=1, description="Text to translate")
    source_language: str = Field(..., description="Source language code (ISO‑639‑1)")
    target_language: str = Field(..., description="Target language code (ISO‑639‑1)")

    @validator("source_language", "target_language")
    def language_supported(cls, v: str) -> str:
        supported = {"en", "ta", "hi", "te", "ml", "kn"}
        if v not in supported:
            raise ValueError(
                f"Unsupported language '{v}'. Supported languages are: en, ta, hi, te, ml, kn"
            )
        return v

    @validator("text")
    def text_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be empty or whitespace only")
        return v


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class SentenceGenerationResponse(BaseModel):
    """Response containing the AI‑generated sentence.

    Attributes:
        sentence: The generated sentence as a string.
        language: Language code of the output (mirrors request.language).
        style: The style that was used for generation.
    """

    sentence: str = Field(..., description="Generated sentence")
    language: str = Field(..., description="Language code of the output")
    style: Literal["simple", "natural", "polite"] = Field(..., description="Style used for the sentence")

    @validator("sentence")
    def sentence_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Generated sentence cannot be empty")
        return v


class TranslationResponse(BaseModel):
    """Response containing a translated version of the input text.

    Attributes:
        translated_text: The translated string.
        source_language: Original language code.
        target_language: Destination language code.
    """

    translated_text: str = Field(..., description="Resulting translated text")
    source_language: str = Field(..., description="Original language code")
    target_language: str = Field(..., description="Destination language code")

    @validator("translated_text")
    def translation_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("translated_text cannot be empty")
        return v
