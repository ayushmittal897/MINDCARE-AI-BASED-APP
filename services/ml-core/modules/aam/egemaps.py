"""eGeMAPS (88) feature vector — wire OpenSMILE extractor here."""


def extract_egemaps(frame_features: list[float]) -> list[float]:
    return frame_features[:88] if len(frame_features) >= 88 else frame_features + [0.0] * (88 - len(frame_features))
