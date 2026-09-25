"""Async-capable multimodal pipeline orchestration (AAM → FEAM → LAM → CAFE → ERM)."""

from __future__ import annotations

from typing import Any

from modules.aam import run_aam
from modules.cafe import run_cafe
from modules.erm import run_erm
from modules.feam import run_feam
from modules.lam import run_lam


def run_realtime_pipeline(
    *,
    transcript: str | None,
    audio_b64: str | None,
    video_b64: str | None,
) -> dict[str, Any]:
    aam = run_aam(audio_b64)
    feam = run_feam(video_b64)
    lam = run_lam(transcript)
    a_len = len(audio_b64 or "")
    v_len = len(video_b64 or "")
    fused = run_cafe(aam, feam, lam, audio_b64_len=a_len, video_b64_len=v_len)
    erm = run_erm(fused, aam=aam, feam=feam, lam=lam)
    return erm
