def align_landmarks(det: dict) -> float:
    return 0.9 if det.get("score", 0) > 0.5 else 0.4
