def visual_confidence(det_score: float, align: float) -> float:
    return max(0.1, min(1.0, (det_score + align) / 2))
