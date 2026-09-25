def linguistic_confidence(asr_score: float) -> float:
    return max(0.1, min(1.0, asr_score))
