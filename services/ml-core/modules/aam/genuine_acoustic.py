"""Acoustic-side features from raw recording bytes (WebM/Opus or any blob) — no decode required."""

from __future__ import annotations

import base64
import math

import numpy as np


def _decode_b64(audio_b64: str | None) -> bytes | None:
    if not audio_b64:
        return None
    try:
        return base64.b64decode(audio_b64, validate=True)
    except Exception:
        try:
            return base64.b64decode(audio_b64)
        except Exception:
            return None


def byte_acoustic_features(raw: bytes) -> list[float]:
    """~88-d proxy: distribution + temporal change on byte stream (surrogate for energy variation)."""
    if not raw or len(raw) < 64:
        return [0.0] * 88

    u = np.frombuffer(raw[: min(len(raw), 200_000)], dtype=np.uint8).astype(np.float64)
    feats: list[float] = []
    feats.append(float(np.mean(u)))
    feats.append(float(np.std(u)))
    feats.append(float(np.median(u)))
    d = np.diff(u)
    if len(d) > 0:
        feats.append(float(np.sqrt(np.mean(d**2))))  # activity
        feats.append(float(np.mean(np.abs(d))))
        zc = np.sum(np.abs(np.diff(np.sign(d - np.mean(d))))) / 2.0
        feats.append(float(zc / max(1, len(d))))
    else:
        feats.extend([0.0, 0.0, 0.0])

    hist, _ = np.histogram(u, bins=32, range=(0, 255))
    hist = hist.astype(np.float64)
    hist = hist / (np.sum(hist) + 1e-9)
    feats.extend(hist.tolist())

    # spectral-ish: treat byte blocks as frames
    block = 512
    nblocks = min(32, len(u) // block)
    if nblocks > 0:
        rms_blocks = []
        for i in range(nblocks):
            chunk = u[i * block : (i + 1) * block]
            rms_blocks.append(float(np.sqrt(np.mean((chunk - 128.0) ** 2))))
        feats.append(float(np.std(rms_blocks)))
        feats.append(float(np.mean(rms_blocks)))
    else:
        feats.extend([0.0, 0.0])

    while len(feats) < 88:
        feats.append(0.0)
    return feats[:88]


def acoustic_confidence_from_bytes(raw: bytes | None) -> float:
    if not raw or len(raw) < 500:
        return 0.28
    # longer clip + variability → higher confidence we measured something real
    dur_proxy = math.log10(len(raw) + 10) / 5.0
    u = np.frombuffer(raw[:50_000], dtype=np.uint8).astype(np.float64)
    var = float(np.var(u))
    activity = float(np.std(np.diff(u))) if len(u) > 1 else 0.0
    score = 0.35 + min(0.45, dur_proxy) + min(0.2, var / 2000.0) + min(0.15, activity / 30.0)
    return float(max(0.25, min(0.92, score)))


def run_genuine_aam(audio_b64: str | None) -> dict:
    raw = _decode_b64(audio_b64)
    feats = byte_acoustic_features(raw or b"")
    from .bilstm import encode_acoustic

    emb = encode_acoustic(feats)
    c_a = acoustic_confidence_from_bytes(raw)
    return {"embedding": emb, "cA": c_a, "bytes_len": len(raw or b"")}
