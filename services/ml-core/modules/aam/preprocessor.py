"""Audio preprocessing: HPSS/VAD/normalization hooks (integrate OpenSMILE in production)."""


def preprocess_audio(_pcm_or_b64: str | None) -> list[float]:
    if not _pcm_or_b64:
        return [0.0] * 88
    # Stub: deterministic pseudo-features from payload length
    n = min(len(_pcm_or_b64), 88)
    return [((ord(c) % 17) / 17.0) for c in _pcm_or_b64[:88].ljust(88, "0")]
