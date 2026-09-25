"""BiLSTM encoder stub → 512-d embedding."""


def encode_acoustic(egemaps: list[float]) -> list[float]:
    import hashlib

    h = hashlib.sha256(bytes(str(egemaps[:16]), "utf-8")).digest()
    return [b / 255.0 for b in h] * 16  # 512-d
