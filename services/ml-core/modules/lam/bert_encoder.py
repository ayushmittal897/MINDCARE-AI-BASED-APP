def encode_text(text: str) -> list[float]:
    return [((ord(c) % 23) / 23.0) for c in text[:768].ljust(768, " ")]
