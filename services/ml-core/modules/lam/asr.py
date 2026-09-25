def transcribe_stub(text: str | None) -> tuple[str, float]:
    if not text:
        return "", 0.2
    return text, min(1.0, 0.65 + len(text) / 500.0)
