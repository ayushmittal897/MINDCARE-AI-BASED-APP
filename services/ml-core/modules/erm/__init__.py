from .natural_language import generate_user_summary, generate_medical_summary
from .report_generator import structured_report
from .shap_analyzer import rank_features


def run_erm(fused: dict, *, aam: dict, feam: dict, lam: dict) -> dict:
    rankings = rank_features(fused, lam)
    _ = structured_report(fused, rankings)
    pred = fused.get("prediction", "Healthy")
    top = rankings[0]["feature"] if rankings else ""
    user_summary = generate_user_summary(pred, top)
    medical_summary = generate_medical_summary(fused, rankings, lam)
    return {
        "prediction": fused["prediction"],
        "probabilities": fused["probabilities"],
        "confidences": {"cA": aam["cA"], "cV": feam["cV"], "cL": lam["cL"]},
        "weights": fused["weights"],
        "shapRankings": rankings,
        "userSummary": user_summary,
        "medicalSummary": medical_summary,
    }
