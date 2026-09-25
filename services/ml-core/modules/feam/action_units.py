def extract_aus(_video_b64: str | None) -> list[float]:
    if not _video_b64:
        return [0.1] * 17
    return [0.35 + (i % 5) * 0.02 for i in range(17)]
