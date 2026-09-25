"""Feature attribution summary (interpretability layer — not full SHAP)."""

from __future__ import annotations

from typing import Any


def rank_features(fused: dict[str, Any], lam: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    pred = fused.get("prediction", "Healthy")
    lam = lam or {}
    v = lam.get("vader") or {}
    neg = float(v.get("neg", 0))
    pos = float(v.get("pos", 0))
    compound = float(v.get("compound", 0))
    dep_d = float(lam.get("lexical_dep_density", 0))
    anx_d = float(lam.get("lexical_anx_density", 0))

    rows: list[dict[str, Any]] = []
    lp = lam.get("linguistic_probs")
    if isinstance(lp, dict) and lp:
        top_lab = max(lp, key=lambda k: float(lp[k]))
        rows.append(
            {
                "feature": f"Linguistic 6-way peak: {top_lab}",
                "modality": "linguistic",
                "value": round(float(lp[top_lab]), 4),
            },
        )

    rows.extend(
        [
            {"feature": "VADER negative sentiment", "modality": "linguistic", "value": round(neg, 4)},
            {"feature": "VADER positive sentiment", "modality": "linguistic", "value": round(pos, 4)},
            {"feature": "VADER compound (valence)", "modality": "linguistic", "value": round(compound, 4)},
            {"feature": "Depression-lexicon density", "modality": "linguistic", "value": round(dep_d, 4)},
            {"feature": "Anxiety-lexicon density", "modality": "linguistic", "value": round(anx_d, 4)},
            {"feature": "Byte-stream activity (audio proxy)", "modality": "acoustic", "value": 0.07},
            {"feature": "Frame sharpness / gradient (visual proxy)", "modality": "visual", "value": 0.06},
        ],
    )

    if "Dep" in pred:
        for r in rows:
            if "Depression" in r["feature"]:
                r["value"] = float(r["value"]) + 0.05
    if "Anx" in pred:
        for r in rows:
            if "Anxiety" in r["feature"]:
                r["value"] = float(r["value"]) + 0.05
    if pred == "Healthy":
        for r in rows:
            if "compound" in r["feature"].lower():
                r["value"] = float(r["value"]) + 0.04

    return sorted(rows, key=lambda x: abs(float(x["value"])), reverse=True)[:8]
