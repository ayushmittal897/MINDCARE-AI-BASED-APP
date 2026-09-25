def encode_visual(aus: list[float]) -> list[float]:
    return [a * 0.5 for a in aus[:256]] + [0.0] * max(0, 256 - len(aus))
