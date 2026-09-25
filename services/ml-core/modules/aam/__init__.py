from .genuine_acoustic import run_genuine_aam


def run_aam(audio_b64: str | None) -> dict:
    return run_genuine_aam(audio_b64)
