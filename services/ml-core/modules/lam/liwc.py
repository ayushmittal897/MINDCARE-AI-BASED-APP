def liwc_features(text: str) -> list[float]:
    words = text.lower().split()
    if not words:
        return [0.0] * 45
    first_person = sum(1 for w in words if w in {"i", "me", "my", "mine"}) / len(words)
    neg = sum(1 for w in words if w in {"not", "never", "no", "bad", "sad"}) / len(words)
    base = [first_person, neg] + [min(1.0, len(words) / 120.0)] * 43
    return base[:45]
