import math

class MemoryScorer:
    """Score a memory node based on length, emotion, and repeat count.

    The score is a float in the range [0, 1] rounded to three decimals.
    """
    def score(self, text: str, emotion: str | None = None, repeat_count: int = 1) -> float:
        # Length contribution – capped at 1.0 for texts >= 200 chars
        length_score = min(len(text) / 200, 1)

        # Emotion weighting – default to neutral if not provided
        emotion_score = {
            "joy": 0.7,
            "anger": 0.9,
            "sad": 0.85,
            "neutral": 0.4,
            None: 0.5,
        }[emotion]

        # Repeat contribution – logarithmic decay, capped at 1.0
        repeat_score = min(math.log(repeat_count + 1, 5), 1)

        # Weighted sum (30% length, 40% emotion, 30% repeat)
        score = (
            length_score * 0.3 +
            emotion_score * 0.4 +
            repeat_score * 0.3
        )
        return round(score, 3)
