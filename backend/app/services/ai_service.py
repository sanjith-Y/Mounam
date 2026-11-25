"""
Google Gemini AI Service for MOUNAM.
Provides async helpers to call Gemini model for sentence generation and translation.
"""

import os
import asyncio
from typing import List

# Modern Google Generative AI SDK import
try:
    from google import genai
except ImportError as e:
    genai = None  # Will be handled lazily when the service is used.

from pydantic import ValidationError

# Import request/response models
from ..models.ai import SentenceGenerationRequest, SentenceGenerationResponse

# Supported languages and styles
SUPPORTED_LANGUAGES = {"en", "ta", "hi", "te", "ml", "kn"}
SUPPORTED_STYLES = {"simple", "natural", "polite"}

# Default and allowed Gemini models
DEFAULT_MODEL = "gemini-1.5-flash"
ALLOWED_MODELS = {DEFAULT_MODEL, "gemini-1.5-pro"}


def _get_api_key() -> str:
    """Retrieve the Gemini API key from the environment.

    Raises:
        RuntimeError: If ``GEMINI_API_KEY`` is not set.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")
    return api_key


def _get_model_name() -> str:
    """Determine which Gemini model to use.

    Returns the model name, validating it against the allowed set.
    """
    model = os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
    if model not in ALLOWED_MODELS:
        raise ValueError(f"Unsupported GEMINI_MODEL '{model}'. Allowed: {', '.join(ALLOWED_MODELS)}")
    return model


def _init_client():
    """Initialise the GenAI client.

    Returns:
        The configured genai module (or raises ImportError if missing).
    """
    if genai is None:
        raise ImportError("google-genai package is not installed. Install it to use AI services.")
    api_key = _get_api_key()
    genai.configure(api_key=api_key)
    return genai


async def generate_sentence_async(
    selected_words: List[str],
    language: str,
    context: str | None = None,
    style: str = "simple",
    timeout: int = 15,
) -> SentenceGenerationResponse:
    """Generate a sentence using Gemini.

    Parameters
    ----------
    selected_words: List[str]
        Words/tokens chosen by the user.
    language: str
        Language code (e.g. "en", "ta").
    context: str | None
        Optional contextual hint for the model.
    style: str
        Desired output style – "simple", "natural" or "polite".
    timeout: int
        Seconds to wait for the Gemini request before raising a timeout.

    Returns
    -------
    SentenceGenerationResponse
        The model‑generated sentence and echoed metadata.

    Raises
    ------
    RuntimeError
        If the API key is missing.
    ImportError
        If the SDK is not installed.
    ValueError
        For unsupported languages, styles, or model name.
    asyncio.TimeoutError
        If the request exceeds the given timeout.
    Exception
        For any other network/API error.
    """
    # Validate inputs via Pydantic model
    try:
        request = SentenceGenerationRequest(
            selected_words=selected_words,
            language=language,
            context=context,
            style=style,
        )
    except ValidationError as ve:
        raise ValueError(str(ve))

    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language '{language}'. Supported: {', '.join(SUPPORTED_LANGUAGES)}")
    if style not in SUPPORTED_STYLES:
        raise ValueError(f"Unsupported style '{style}'. Supported: {', '.join(SUPPORTED_STYLES)}")

    client = _init_client()
    model_name = _get_model_name()
    model = client.GenerativeModel(model_name)

    # Language name mapping for clear instructions to model
    language_names = {
        "en": "English",
        "ta": "Tamil",
        "hi": "Hindi",
        "te": "Telugu",
        "ml": "Malayalam",
        "kn": "Kannada"
    }
    target_language_name = language_names.get(language, language)

    # Build prompt with strict assistive AAC safety and fidelity rules
    prompt_parts = [
        f"You are an assistive AAC communication assistant for MOUNAM ('Every Voice Deserves to Be Heard').",
        f"Generate a single, clear, articulate sentence in {target_language_name} ({language}) script.",
        f"The user selected the following words/intent tokens: {', '.join(selected_words)}.",
    ]
    if context:
        prompt_parts.append(f"Context: {context}.")
    prompt_parts.append(
        f"Style: {style} ("
        "simple = short, direct, essential words; "
        "natural = everyday warm conversational phrasing; "
        "polite = courteous, respectful phrasing)."
    )
    prompt_parts.append(
        "CRITICAL SAFETY RULES: "
        "1. Strictly reflect only the meaning implied by the selected tokens. "
        "2. Never fabricate new medical symptoms, clinical diagnoses, emotions, or emergency claims. "
        "3. Output ONLY the generated sentence in proper native script for regional languages. Do not include markdown quotes, explanations, or pronunciation guides."
    )
    prompt = " ".join(prompt_parts)

    loop = asyncio.get_running_loop()
    try:
        response = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: model.generate_content(prompt)),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        raise asyncio.TimeoutError("Gemini request timed out")
    except Exception as exc:
        raise Exception(f"Gemini API request failed: {exc}")

    # Extract generated text
    try:
        generated = response.text.strip()
    except Exception:
        raise Exception("Gemini returned an empty or malformed response.")

    if not generated:
        raise Exception("Gemini returned an empty sentence")

    return SentenceGenerationResponse(
        sentence=generated,
        language=language,
        style=style,
    )
