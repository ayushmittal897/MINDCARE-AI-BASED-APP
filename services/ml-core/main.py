"""MindCare ML Core — FastAPI entry. Patent-aligned module layout; production swaps stubs for trained weights."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager

from pipelines.realtime_pipeline import run_realtime_pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retrieve port from uvicorn config or env if needed, but standard print is fine
    print("ML service READY on port 8010", flush=True)
    yield

app = FastAPI(title="MindCare ML Core", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    transcript: str | None = None
    audioBase64: str | None = None
    videoBase64: str | None = None
    userId: str = Field(..., description="Opaque user id from gateway")


class AnalyzeResponse(BaseModel):
    sessionId: str = ""
    prediction: str
    probabilities: list[dict[str, Any]]
    confidences: dict[str, float]
    weights: dict[str, float]
    shapRankings: list[dict[str, Any]]
    userSummary: str
    medicalSummary: str
    createdAt: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "mindcare-ml-core"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    out = run_realtime_pipeline(
        transcript=body.transcript,
        audio_b64=body.audioBase64,
        video_b64=body.videoBase64,
    )
    return AnalyzeResponse(
        sessionId="",
        prediction=out["prediction"],
        probabilities=out["probabilities"],
        confidences=out["confidences"],
        weights=out["weights"],
        shapRankings=out["shapRankings"],
        userSummary=out["userSummary"],
        medicalSummary=out["medicalSummary"],
        createdAt=datetime.now(timezone.utc).isoformat(),
    )
