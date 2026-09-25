from .fusion import LABELS, fuse_modalities
from .gating_network import gate_weights


def _blend_linguistic_prior(fused: dict, lam: dict) -> dict:
    """Align fused distribution with VADER+lexicon 6-way prior when linguistic confidence is high."""
    lp = lam.get("linguistic_probs")
    if not isinstance(lp, dict):
        return fused
    c_l = float(lam.get("cL", 0.5))
    blend_w = min(0.62, 0.22 + 0.55 * c_l)
    old = {p["label"]: p["probability"] for p in fused["probabilities"]}
    new_probs: list[float] = []
    for lab in LABELS:
        p = float(old.get(lab, 0))
        t = float(lp.get(lab, 0))
        new_probs.append((1 - blend_w) * p + blend_w * t)
    s = sum(new_probs) or 1.0
    new_probs = [p / s for p in new_probs]
    pred_i = max(range(len(LABELS)), key=lambda i: new_probs[i])
    return {
        **fused,
        "prediction": LABELS[pred_i],
        "probabilities": [{"label": LABELS[i], "probability": new_probs[i]} for i in range(len(LABELS))],
    }


def run_cafe(
    aam: dict,
    feam: dict,
    lam: dict,
    *,
    audio_b64_len: int = 0,
    video_b64_len: int = 0,
) -> dict:
    w_a, w_v, w_l = gate_weights(aam["cA"], feam["cV"], lam["cL"])
    fused = fuse_modalities(
        aam["embedding"],
        feam["embedding"],
        lam["embedding"],
        w_a,
        w_v,
        w_l,
        lam.get("text") or "",
        audio_b64_len=audio_b64_len,
        video_b64_len=video_b64_len,
    )
    return _blend_linguistic_prior(fused, lam)
