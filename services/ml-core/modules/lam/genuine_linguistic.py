"""
Linguistic signal from VADER sentiment + depression/anxiety lexicon density.
Not a diagnostic tool — screening-style language analytics used in NLP mental-health research.
"""

from __future__ import annotations

import re

import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer: SentimentIntensityAnalyzer | None = None

# High-signal cue words (not exhaustive; extend with clinician-reviewed lists for production).
DEP_MARKERS = (
    "hopeless worthless empty exhausted numb guilty ashamed trapped suicidal cry crying tears "
    "worthless alone helpless despair tired fatigue insomnia can't sleep no energy "
    "don't care giving up pointless depress depressed"
).split()

ANX_MARKERS = (
    "panic anxious anxiety nervous worried worry overwhelmed racing heart shaking sweaty "
    "dread fear scared terrified on edge restless tense stressed overwhelmed"
).split()

NEGATION = ("not", "no", "never", "nothing", "nobody", "neither", "nowhere", "can't", "won't", "don't", "doesn't")


def _get_analyzer() -> SentimentIntensityAnalyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = SentimentIntensityAnalyzer()
    return _analyzer


def _lexical_density(text_lower: str, terms: tuple[str, ...]) -> float:
    if not text_lower.strip():
        return 0.0
    hits = sum(1 for t in terms if t in text_lower)
    words = max(1, len(text_lower.split()))
    return min(1.0, hits / (words**0.5 + 1))


def _negation_rate(text_lower: str) -> float:
    words = re.findall(r"[a-z']+", text_lower)
    if not words:
        return 0.0
    return sum(1 for w in words if w in NEGATION) / len(words)


def sixway_logits_from_text(text: str) -> list[float]:
    """Map VADER + lexicons to 6 unnormalized logits (Healthy … ModAnx)."""
    t = text.strip()
    if not t:
        return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    tl = t.lower()
    s = _get_analyzer().polarity_scores(t)
    neg, pos, compound = s["neg"], s["pos"], s["compound"]
    dep_d = _lexical_density(tl, tuple(DEP_MARKERS))
    anx_d = _lexical_density(tl, tuple(ANX_MARKERS))
    neg_r = _negation_rate(tl)

    # Healthy pole: positive valence, low clinical density
    h = 0.9 * pos + 0.55 * max(0.0, compound) - 0.4 * dep_d - 0.35 * anx_d + 0.15 * (1 - neg_r)

    # Depression pole scales with neg sentiment + depression lexicon
    d_strength = 0.55 * neg + 0.95 * dep_d + 0.25 * neg_r - 0.2 * pos
    mild_d = 0.35 + d_strength * 1.1
    mod_d = 0.15 + d_strength * 1.35 + max(0.0, compound + 0.2) * -0.15
    sev_d = 0.05 + d_strength * 1.6 + dep_d * 0.5

    # Anxiety pole
    a_strength = 0.5 * anx_d + 0.35 * neg + 0.15 * neg_r - 0.15 * pos
    mild_a = 0.25 + a_strength * 1.15
    mod_a = 0.1 + a_strength * 1.4

    return [h, mild_d, mod_d, sev_d, mild_a, mod_a]


def softmax(vec: list[float]) -> list[float]:
    a = np.array(vec, dtype=np.float64)
    a = a - np.max(a)
    e = np.exp(a)
    s = e.sum() + 1e-9
    return (e / s).tolist()


def build_embedding(probs: list[float], text: str) -> list[float]:
    """256-d vector: 6-way probs + character n-gram stats + padded."""
    from .liwc import liwc_features

    liwc = np.array(liwc_features(text), dtype=np.float64)
    p = np.array(probs, dtype=np.float64)
    # simple char bigram hash features (32 dims)
    bg = np.zeros(32, dtype=np.float64)
    s = re.sub(r"\s+", " ", text.lower())[:400]
    for i in range(len(s) - 1):
        bg[(ord(s[i]) + ord(s[i + 1])) % 32] += 1.0
    if bg.sum() > 0:
        bg = bg / bg.sum()
    parts = [p * 12.0, liwc[:80], bg]
    emb = np.concatenate(parts)
    if len(emb) < 256:
        emb = np.pad(emb, (0, 256 - len(emb)))
    return emb[:256].tolist()


def linguistic_confidence_genuine(text: str) -> float:
    t = text.strip()
    if not t:
        return 0.15
    wc = len(t.split())
    # More words → more reliable VADER/lexical estimate (capped)
    base = 0.42 + min(0.48, 0.035 * (wc**0.5))
    return float(min(0.95, base))


def run_genuine_lam(transcript: str | None) -> dict:
    text = (transcript or "").strip()
    logits = sixway_logits_from_text(text)
    probs = softmax(logits)
    labels = ["Healthy", "MildDep", "ModDep", "SevDep", "MildAnx", "ModAnx"]
    # pseudo "BERT" path: embedding driven by measured probs + LIWC
    emb = build_embedding(probs, text if text else " ")
    c_l = linguistic_confidence_genuine(text)
    vader = _get_analyzer().polarity_scores(text) if text else {"neg": 0, "neu": 1.0, "pos": 0, "compound": 0.0}
    return {
        "embedding": emb,
        "cL": c_l,
        "text": text,
        "linguistic_probs": dict(zip(labels, probs)),
        "vader": vader,
        "lexical_dep_density": _lexical_density(text.lower(), tuple(DEP_MARKERS)) if text else 0.0,
        "lexical_anx_density": _lexical_density(text.lower(), tuple(ANX_MARKERS)) if text else 0.0,
    }
