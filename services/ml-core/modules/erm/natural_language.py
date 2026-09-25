from __future__ import annotations

from typing import Any


def generate_user_summary(pred: str, top: str) -> str:
    descriptions = {
        "Healthy": "Your results indicate a generally healthy emotional state with no significant signs of depression or anxiety.",
        "MildDep": "Your results suggest mild signs of depression. You might be feeling a bit down, unmotivated, or tired lately.",
        "ModDep": "Your results suggest moderate signs of depression. It could be beneficial to talk to a professional about how you've been feeling.",
        "SevDep": "Your results indicate severe signs of depression. We highly encourage you to reach out to a mental health professional or a support system for help.",
        "MildAnx": "Your results suggest mild signs of anxiety. You may be experiencing some extra stress, restlessness, or worry in your daily life.",
        "ModAnx": "Your results suggest moderate signs of anxiety. Exploring stress-management techniques or speaking to a professional could be helpful."
    }
    health_status = descriptions.get(pred, "Your results have been processed successfully.")
    
    top_lower = top.lower()
    if "acoustic" in top_lower or "audio" in top_lower:
        cue_msg = "Your voice tone and speech patterns were the primary indicators in this analysis."
    elif "visual" in top_lower or "face" in top_lower or "video" in top_lower:
        cue_msg = "Your facial expressions were the primary indicators in this analysis."
    elif "linguistic" in top_lower or "vader" in top_lower or "lexicon" in top_lower or "text" in top_lower:
        cue_msg = "The words you chose and your overall sentiment were the primary indicators in this analysis."
    else:
        cue_msg = "A combination of your text, voice, and facial expressions contributed to this result."
        
    return f"{health_status} {cue_msg} Please note that this is an automated screening tool, not a medical diagnosis."

def generate_medical_summary(
    fused: dict[str, Any],
    rankings: list[dict[str, Any]],
    lam: dict[str, Any] | None = None,
) -> str:
    pred = fused.get("prediction", "Healthy")
    top = rankings[0]["feature"] if rankings else "multimodal cues"
    w = fused.get("weights", {"wA": 0, "wV": 0, "wL": 0})
    lam = lam or {}
    v = lam.get("vader") or {}
    neg = float(v.get("neg", 0))
    compound = float(v.get("compound", 0))
    note = (
        "Linguistic layer uses VADER sentiment and research-style depression/anxiety lexicon density; "
        "acoustic/visual layers use signal statistics on uploaded bytes and JPEG frames (not clinical instruments). "
        "This is not a diagnosis."
    )
    return (
        f"Clinical session summary: top attribution — {top}. "
        f"CAFE weights: acoustic {w.get('wA', 0):.2f}, visual {w.get('wV', 0):.2f}, linguistic {w.get('wL', 0):.2f}. "
        f"Predicted class (screening-style): {pred}. "
        f"VADER: neg={neg:.2f}, compound={compound:.2f}. "
        f"{note}"
    )
