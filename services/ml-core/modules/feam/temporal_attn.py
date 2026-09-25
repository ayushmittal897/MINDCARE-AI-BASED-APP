def temporal_pool(spatial: list[float]) -> list[float]:
    mid = len(spatial) // 2
    return spatial[mid : mid + 256] if len(spatial) >= 256 else spatial + [0.0] * (256 - len(spatial))
