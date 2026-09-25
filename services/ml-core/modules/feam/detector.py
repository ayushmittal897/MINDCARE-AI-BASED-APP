def detect_face(_frame_b64: str | None) -> dict:
    return {"score": 0.82 if _frame_b64 else 0.2}
