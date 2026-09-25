from __future__ import annotations

from typing import Any


def structured_report(fused: dict[str, Any], rankings: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "prediction": fused["prediction"],
        "probabilities": fused["probabilities"],
        "weights": fused["weights"],
        "top_features": rankings[:5],
    }
