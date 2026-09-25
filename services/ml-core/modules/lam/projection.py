def fuse_bert_liwc(bert: list[float], liwc: list[float]) -> list[float]:
    import math

    combined = bert[:200] + liwc[:56]
    n = 256
    if len(combined) < n:
        combined = combined + [0.0] * (n - len(combined))
    # L2 normalize stub
    norm = math.sqrt(sum(x * x for x in combined[:n])) or 1.0
    return [x / norm for x in combined[:n]]
