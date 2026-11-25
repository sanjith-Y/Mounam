"""
MOUNAM Pilot Feedback Router (Phase 14)
Collects real usability and accessibility feedback from pilot participants.
Stores submissions in a local JSONL file (no fabricated entries).
"""

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/feedback", tags=["Pilot Feedback"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
FEEDBACK_FILE = DATA_DIR / "pilot_feedback.jsonl"


class PilotFeedbackRequest(BaseModel):
    role: Literal["aac_user", "deaf_user", "caregiver", "clinician", "tester"] = "aac_user"
    module_used: str = Field(..., min_length=1, max_length=80)
    rating: int = Field(..., ge=1, le=5)
    ease_of_use: int = Field(..., ge=1, le=5)
    issue_category: Literal[
        "none",
        "voice_tts",
        "speech_to_text",
        "gesture_camera",
        "sign_communication",
        "accessibility",
        "navigation",
        "performance",
        "other",
    ] = "none"
    comment: str = Field(..., min_length=3, max_length=2000)
    language: str = Field(default="en", max_length=16)
    device_info: Optional[str] = Field(default=None, max_length=200)


class PilotFeedbackResponse(BaseModel):
    status: str
    feedback_id: str
    received_at: str
    persisted_to_disk: bool


@router.post("", response_model=PilotFeedbackResponse)
async def submit_pilot_feedback(payload: PilotFeedbackRequest):
    """Record genuine pilot user/caregiver feedback."""
    feedback_id = f"fb_{uuid.uuid4().hex[:10]}"
    received_at = datetime.now(timezone.utc).isoformat()
    record = {
        "feedback_id": feedback_id,
        "received_at": received_at,
        **payload.model_dump(),
    }

    persisted = False
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
        persisted = True
    except OSError:
        persisted = False

    return PilotFeedbackResponse(
        status="received",
        feedback_id=feedback_id,
        received_at=received_at,
        persisted_to_disk=persisted,
    )


@router.get("/summary")
async def get_feedback_summary():
    """Return actual count of recorded pilot feedback submissions."""
    if not FEEDBACK_FILE.exists():
        return {"total_submissions": 0, "recent": []}

    entries = []
    try:
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    entries.append(json.loads(line))
    except OSError:
        return {"total_submissions": 0, "recent": []}

    return {
        "total_submissions": len(entries),
        "recent": entries[-10:][::-1],
    }
