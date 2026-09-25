from .genuine_visual import run_genuine_feam


def run_feam(video_b64: str | None) -> dict:
    return run_genuine_feam(video_b64)
