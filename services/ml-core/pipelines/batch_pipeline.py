"""Batch inference entry point for research / re-evaluation."""

from __future__ import annotations

from typing import Any

from pipelines.realtime_pipeline import run_realtime_pipeline


def run_batch_row(row: dict[str, Any]) -> dict[str, Any]:
    return run_realtime_pipeline(
        transcript=row.get("transcript"),
        audio_b64=row.get("audioBase64"),
        video_b64=row.get("videoBase64"),
    )
