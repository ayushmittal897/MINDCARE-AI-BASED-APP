"""Image-based visual signal from a single JPEG frame (sharpness, contrast, downsampled patch)."""

from __future__ import annotations

import base64
import io

import numpy as np
from PIL import Image


def _decode_image(video_b64: str | None) -> np.ndarray | None:
    if not video_b64:
        return None
    try:
        raw = base64.b64decode(video_b64, validate=True)
    except Exception:
        try:
            raw = base64.b64decode(video_b64)
        except Exception:
            return None
    try:
        im = Image.open(io.BytesIO(raw)).convert("L")
        return np.asarray(im, dtype=np.float64)
    except Exception:
        return None


def run_genuine_feam(video_b64: str | None) -> dict:
    a = _decode_image(video_b64)
    if a is None or a.size == 0:
        return {"embedding": [0.02] * 256, "cV": 0.22}

    var = float(np.var(a))
    mean = float(np.mean(a))
    gx = np.diff(a, axis=1) if a.shape[1] > 1 else np.array([0.0])
    gy = np.diff(a, axis=0) if a.shape[0] > 1 else np.array([0.0])
    grad = float(np.mean(np.abs(gx)) + np.mean(np.abs(gy)))

    # Laplacian variance (blur detector)
    if a.shape[0] > 2 and a.shape[1] > 2:
        lap = (
            -4.0 * a[1:-1, 1:-1]
            + a[:-2, 1:-1]
            + a[2:, 1:-1]
            + a[1:-1, :-2]
            + a[1:-1, 2:]
        )
        lap_var = float(np.var(lap))
    else:
        lap_var = 0.0

    im = Image.fromarray(a.astype(np.uint8))
    im_small = im.resize((16, 16), Image.Resampling.LANCZOS)
    emb = (np.asarray(im_small, dtype=np.float64).flatten() / 255.0).tolist()
    if len(emb) < 256:
        emb = emb + [0.0] * (256 - len(emb))
    emb = emb[:256]
    # append global stats into last dims (overwrite tail)
    tail = [mean / 255.0, min(1.0, var / 5000.0), min(1.0, grad / 40.0), min(1.0, lap_var / 500.0)]
    emb[-len(tail) :] = tail

    # confidence: sharp, reasonable size
    h, w = a.shape[:2]
    size_ok = min(1.0, (h * w) / (320 * 240))
    c = 0.38 + min(0.35, grad / 45.0) + min(0.15, lap_var / 400.0) + 0.1 * size_ok
    c = float(max(0.22, min(0.94, c)))

    return {"embedding": emb, "cV": c}
