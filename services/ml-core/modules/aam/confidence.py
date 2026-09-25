"""Monte Carlo dropout confidence placeholder."""


def acoustic_confidence(_embedding: list[float], has_signal: bool) -> float:
    return 0.75 if has_signal else 0.35
