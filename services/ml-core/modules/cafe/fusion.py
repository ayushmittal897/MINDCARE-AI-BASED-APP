"""Fuse embeddings with weights → 6-class softmax (stub logits)."""

from __future__ import annotations

import hashlib
import math
from typing import Any


LABELS = ["Healthy", "MildDep", "ModDep", "SevDep", "MildAnx", "ModAnx"]


def _softmax(vec: list[float]) -> list[float]:
    m = max(vec)
    ex = [math.exp(v - m) for v in vec]
    s = sum(ex) or 1.0
    return [e / s for e in ex]


def _input_fingerprint(transcript: str, audio_b64_len: int, video_b64_len: int) -> float:
    raw = f"{transcript[:800]}|{audio_b64_len}|{video_b64_len}".encode("utf-8", errors="ignore")
    return int.from_bytes(hashlib.sha256(raw).digest()[:2], "big") / 65535.0


def fuse_modalities(
    e_a: list[float],
    e_v: list[float],
    e_l: list[float],
    w_a: float,
    w_v: float,
    w_l: float,
    transcript: str,
    *,
    audio_b64_len: int = 0,
    video_b64_len: int = 0,
) -> dict[str, Any]:
    # Project to common dim 64 via simple averaging slices
    def compress(e: list[float]) -> float:
        return sum(e[:64]) / 64 if e else 0.0

    s_a, s_v, s_l = compress(e_a), compress(e_v), compress(e_l)
    # Extract linguistic probabilities from e_l (stored by lam as probs * 12.0)
    lam_probs = [e / 12.0 for e in e_l[:6]] if len(e_l) >= 6 else [1.0/6.0] * 6
    
    # Scale probabilities to act as strong base logits prior to softmax
    logits = [p * 6.0 for p in lam_probs]

    # Real payload sizes change the stub decision boundary (replace with trained CAFE later)
    audio_boost = min(0.35, (audio_b64_len / 500_000) * 0.35)  # ~large clip nudges acoustic-heavy classes
    video_boost = min(0.2, (video_b64_len / 200_000) * 0.2)
    logits[1] += audio_boost * 0.4
    logits[4] += video_boost * 0.25

    fp = _input_fingerprint(transcript, audio_b64_len, video_b64_len)
    for i in range(len(logits)):
        logits[i] += (fp - 0.5) * 0.06 * (1 + i * 0.03)

    blend = w_a * s_a + w_v * s_v + w_l * s_l
    logits = [l + blend * 0.15 for l in logits]
    probs = _softmax(logits)
    pred_i = max(range(len(probs)), key=lambda i: probs[i])
    return {
        "prediction": LABELS[pred_i],
        "probabilities": [{"label": LABELS[i], "probability": probs[i]} for i in range(len(LABELS))],
        "weights": {"wA": w_a, "wV": w_v, "wL": w_l},
    }
