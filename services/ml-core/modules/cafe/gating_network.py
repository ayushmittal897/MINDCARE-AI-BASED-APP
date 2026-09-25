"""CAFE gating: softmax over modality confidences (production: small MLP)."""

from __future__ import annotations

import math


def gate_weights(c_a: float, c_v: float, c_l: float) -> tuple[float, float, float]:
    x = [max(0.01, c_a), max(0.01, c_v), max(0.01, c_l)]
    m = max(x)
    ex = [math.exp(v - m) for v in x]
    s = sum(ex) or 1.0
    return ex[0] / s, ex[1] / s, ex[2] / s
