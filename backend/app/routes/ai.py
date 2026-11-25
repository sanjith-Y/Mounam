"""
MOUNAM AI Communication Assistant API Routes.
Provides endpoints for AI sentence generation, translation, and status.
"""

import os
from fastapi import APIRouter, HTTPException, status
from app.models.ai import (
    SentenceGenerationRequest,
    SentenceGenerationResponse,
    TranslationRequest,
    TranslationResponse,
)
from app.services.ai_service import generate_sentence_async

router = APIRouter(prefix="/ai", tags=["AI Communication Assistant"])


@router.get("/status")
async def get_ai_status():
    """
    Check the Gemini AI integration and service status.
    Returns whether the API key is configured without exposing it.
    """
    api_key_configured = bool(os.getenv("GEMINI_API_KEY"))
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    timeout = int(os.getenv("GEMINI_TIMEOUT", "15"))

    return {
        "status": "online" if api_key_configured else "standby",
        "service": "Google Gemini Assistive AI",
        "api_key_configured": api_key_configured,
        "model": model_name,
        "timeout_seconds": timeout,
        "supported_styles": ["simple", "natural", "polite"],
        "supported_languages": ["en", "ta", "hi", "te", "ml", "kn"],
    }


@router.post(
    "/generate-sentence",
    response_model=SentenceGenerationResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_sentence(payload: SentenceGenerationRequest):
    """
    Generate an articulate, courteous, context-aware sentence from selected words/tokens.
    Uses Google Gen AI SDK.
    """
    try:
        response = await generate_sentence_async(
            selected_words=payload.selected_words,
            language=payload.language,
            context=payload.context,
            style=payload.style,
        )
        return response
    except RuntimeError as re:
        # Missing API key or setup error
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service configuration issue: {str(re)}",
        )
    except ImportError as ie:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI SDK error: {str(ie)}",
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except TimeoutError as te:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Gemini AI request timed out. Please try again.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {str(exc)}",
        )


@router.post(
    "/translate",
    response_model=TranslationResponse,
    status_code=status.HTTP_200_OK,
)
async def translate_text(payload: TranslationRequest):
    """
    Translate text across supported regional languages using Gemini.
    """
    # For translation, we compose a translation prompt and use generate_sentence_async style pipeline
    try:
        translated_sentence = await generate_sentence_async(
            selected_words=[payload.text],
            language=payload.target_language,
            context=f"Translate precisely from language code {payload.source_language} to {payload.target_language}",
            style="natural",
        )
        return TranslationResponse(
            translated_text=translated_sentence.sentence,
            source_language=payload.source_language,
            target_language=payload.target_language,
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service configuration issue: {str(re)}",
        )
    except TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Translation request timed out.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Translation error: {str(exc)}",
        )
