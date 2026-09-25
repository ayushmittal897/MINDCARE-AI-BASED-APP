import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules.lam.genuine_linguistic import (
    sixway_logits_from_text,
    run_genuine_lam,
    _lexical_density,
    DEP_MARKERS,
    ANX_MARKERS
)

def test_empty_transcript():
    res = run_genuine_lam("")
    assert res["cL"] == 0.15
    assert res["text"] == ""
    assert res["vader"]["compound"] == 0.0
    assert len(res["embedding"]) == 256
    # Logits should be all zero for empty
    logits = sixway_logits_from_text("")
    assert all(l == 0.0 for l in logits)

def test_healthy_transcript():
    text = "I am feeling great today, very happy and energetic."
    res = run_genuine_lam(text)
    
    # Healthy should have the highest probability
    probs = res["linguistic_probs"]
    assert probs["Healthy"] > probs["SevDep"]
    assert probs["Healthy"] > probs["SevAnx"] if "SevAnx" in probs else True
    
    assert res["vader"]["compound"] > 0.0 # Positive sentiment
    assert res["lexical_dep_density"] == 0.0
    assert res["lexical_anx_density"] == 0.0

def test_depressed_transcript():
    text = "I feel so hopeless and worthless. I am constantly crying and exhausted."
    res = run_genuine_lam(text)
    
    probs = res["linguistic_probs"]
    # Should flag some level of depression stronger than healthy
    assert (probs["SevDep"] + probs["ModDep"] + probs["MildDep"]) > probs["Healthy"]
    
    assert res["vader"]["compound"] < 0.0
    assert res["lexical_dep_density"] > 0.0

def test_anxious_transcript():
    text = "I am very nervous and worried about the future. I feel panic and terrified."
    res = run_genuine_lam(text)
    
    probs = res["linguistic_probs"]
    # Should flag anxiety
    assert (probs["ModAnx"] + probs["MildAnx"]) > probs["Healthy"]
    
    assert res["lexical_anx_density"] > 0.0

def test_lexical_density_calculation():
    # Test specific keyword matches
    text = "hopeless panic"
    dep_density = _lexical_density(text, tuple(DEP_MARKERS))
    anx_density = _lexical_density(text, tuple(ANX_MARKERS))
    
    assert dep_density > 0.0
    assert anx_density > 0.0
